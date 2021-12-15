// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { get, set } from "@upstash/redis";
import { Main } from "../../util/types"

import type { NextApiRequest, NextApiResponse } from "next";

const startRange = 1609455600;
const secPerDay = 3600 * 24;
const secPerWeek = 604800;

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
    // console.log("PAYLOAD: ", payload);
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

function filterToIR(data: )

async function getSongsHandler(req: NextApiRequest, res: NextApiResponse) {
  const user: string = req.query.user as string;
  if (req.query.days == undefined) return res.status(400); // need to specify a day
  const days: number = parseInt(req.query.days as string);
  await oneByOne(user, days)
    .then((res) => console.log(res))
    .then((err) => console.log(err));

  return res.status(200).json({ success: true, payload: main });
}

export default getSongsHandler;
