// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { get, set } from "@upstash/redis";
import type { NextApiRequest, NextApiResponse } from "next";
import { useTab, filter } from "@chakra-ui/react";
import type { CalendarData } from "../../util/types";
import {
  maybeAddLeadingZero,
  normalizeCalendarDays,
  listenLevel,
} from "../../util/user_helpers";

const startRange = 1609455600;
const secPerDay = 3600 * 24;
const secPerWeek = 604800;
const endRange = 1641020399; // This is the last second of 2021

const lastApi = "http://ws.audioscrobbler.com";

function formatTopTracksRequest(
  user: string,
  limit: number = 100,
  period: string = "12month"
): string {
  const str: string =
    lastApi +
    `/2.0/?method=user.gettoptracks&user=${user}&limit=${limit}&period=${period}&api_key=${process.env.LAST_ID}&format=json`;
  return str;
}

/**
 * This function must be called in order to get the user's recent listens.
 * NOTE: I want to be able to do a Promises.all() to do all these reqs in parallel, then process them
 * BUT I cant do that since I need each promise to return what timestamp to start the next promise
 * from. One idea I could do, is if I somehow new the total number of scrobbles for a given year, I
 * could divide that by the 200 limit per request, and get the timestamps that way?
 * Right now, it'll have to be slow.
 * @param user : the username
 * @param endDate : the end date for the request, default to one day after jan 1 2021
 * @param page : the page at which to make the requestt, defaults to 1
 * @param limit : the limit of tracks that will be returned, defaults to 200
 */
function formatRecentListensRequest(
  user: string,
  startDate: number = startRange,
  endDate: number = startRange + secPerDay,
  page: number = 1,
  limit: number = 200
): string {
  const str: string =
    lastApi +
    `/2.0/?method=user.getrecenttracks&user=${user}&limit=${limit}&from=${startDate}&to=${endDate}&page=${page}&api_key=${process.env.LAST_ID}&format=json`;
  return str;
}

const main = { data: [] };

/**
 * This function will take in the data json and parse the data into our internal representation
 * @param data The payload data from the last.fm api
 * @returns boolean value. True if error, false if all good
 */
function addToMain(data, currDate: number): boolean {
  if (data["error"] != undefined) {
    // oooh maybe could write to file!
    console.log(`Error code: ${data["error"]} adding ${currDate} to file`);
    return true;
  }
  main["data"].push({
    date: currDate,
    streams: data["recenttracks"]["track"],
  });
  return false;
}

// helper function
function arePagesDoneHandler(data): boolean {
  let totalPages = parseInt(data["recenttracks"]["@attr"]["totalPages"]);
  if (totalPages == 0) return true;
  let currPage = parseInt(data["recenttracks"]["@attr"]["page"]);
  // console.log("TOTALPAGES: ", totalPages);
  // console.log("CURRPAGE: ", currPage);
  return totalPages === currPage;
}

async function oneByOne(user: string, numDays: number) {
  var page: number = 1;
  var currDate: number = startRange;
  var endDate: number = startRange + numDays * secPerDay;

  var arePagesDone: boolean;
  while (currDate < endDate) {
    let nextDay = currDate + secPerDay;
    var payload = await fetch(
      formatRecentListensRequest(user, currDate, nextDay, page)
    )
      .then((res) => res.json())
      .catch((err) => err);
    var isError = addToMain(payload, currDate);
    if (isError) return "ERROR";
    arePagesDone = arePagesDoneHandler(payload);
    if (arePagesDone) {
      // proceed to the next day
      currDate = nextDay;
      page = 1;
    } else {
      page++;
    }
  }
}

function formatToIR(rawData) {
  // format name
  let output = {};

  rawData["data"].forEach((element) => {
    var streams = element["streams"];
    if (streams["@attr"] != undefined) {
      // this is a problem. Basically the 'nowplaying' part of recent listens will break my api
      return; // so we continue to the next one and just skip this entry
    }
    streams.forEach((stream) => {
      var artist = stream["artist"]["#text"];
      var song = stream["name"];
      const newName = song + "^" + artist;
      if (stream["@attr"] != undefined) {
        // this is a problem. Basically the 'nowplaying' part of recent listens will break my api
        return; // so we continue to the next one and just skip this entry
      }
      var streamDate = stream["date"]["uts"];
      var dateUTS = new Date(Date.parse(stream["date"]["#text"]));
      if (newName in output) {
        if (
          streamDate - output[newName]["days"].slice(-1).pop()["dayBoundary"] >=
          secPerDay
        ) {
          // this stream happened in a new day
          var day = {
            dayBoundary: streamDate,
            listensToday: 1,
            day_text: `${dateUTS.getFullYear()}-${maybeAddLeadingZero(
              (dateUTS.getMonth() + 1).toString()
            )}-${maybeAddLeadingZero(dateUTS.getDate().toString())}`,
          };
          output[newName]["days"].push(day);
        } else {
          output[newName]["days"].slice(-1).pop()["listensToday"]++;
        }
        output[newName]["streams"].push(stream);
        output[newName]["count"]++;
      } else {
        var day = {
          dayBoundary: streamDate,
          listensToday: 1,
          day_text: `${dateUTS.getFullYear()}-${maybeAddLeadingZero(
            (dateUTS.getMonth() + 1).toString()
          )}-${maybeAddLeadingZero(dateUTS.getDate().toString())}`,
        };
        output[newName] = { count: 1, streams: [stream], days: [day] };
      }
    });
  });
  return output;
}

async function getSongsHandler(req: NextApiRequest, res: NextApiResponse) {
  const user: string = req.query.user as string;
  const calendar: string = req.query.calendar as string;
  const debug: string = req.query.debug as string;
  if (req.query.days == undefined) return res.status(400); // need to specify a day
  const days: number = parseInt(req.query.days as string);
  await oneByOne(user, days)
    .then((res) => console.log(res))
    .then((err) => console.log(err));

  var real = formatToIR(main); // this is the streaming data for ALL the songs
  // we're gonna try and go about separating song by song.

  if (calendar != undefined) {
    // then we want the payload to be in the calendar format
    Object.keys(real).filter((entry) => {
      console.log("The song: ", entry);
      var logger: boolean = false;
      if (entry === "Nightline^Juche") logger = true;
      var days = real[`${entry}`]["days"].map((listen) => {
        // console.log("the listen: ", listen);
        if (logger) console.log("DATA: ", listen);
        return {
          date: listen["day_text"],
          count: listen["listensToday"],
          level: listenLevel(listen["listensToday"]),
        };
      });
      if (days.length >= 1) {
        real[`${entry}`] = normalizeCalendarDays(days);
        return true;
      }
      console.log("THE CALENDAR DAYS: ", real[`${entry}`]);
      return false;
      // real[`${entry}`] = days;
    });

    // real = addMissingDaysTillYear(real);
    // console.log("THE DATA: ", calendarData);
  }

  return res.status(200).json({ success: true, payload: real });
}

export default getSongsHandler;
