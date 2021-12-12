// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { get, set } from "@upstash/redis";

import type { NextApiRequest, NextApiResponse } from "next";

const startRange = 1609455600;
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

function getWeeklyTimestamps(): string {
  const str: string =
    lastApi +
    `/2.0/?method=user.&user=${user}&limit=${limit}&from=${startRange}&to=${startPlusOne}&api_key=${process.env.LAST_ID}&format=json`;
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
 * @param limit : the limit of tracks that will be returned
 */
function formatRecentListensRequest(
  user: string,
  limit: number = 200,
  page: number = 1
): string {
  var endDate = startRange + 52 * secPerWeek;
  const str: string =
    lastApi +
    `/2.0/?method=user.getrecenttracks&user=${user}&limit=${limit}&from=${startRange}&to${endDate}&page=${page}&api_key=${process.env.LAST_ID}&format=json`;
  return str;
}

async function oneByOne(user: string) {
  var startDate = startRange;
  var endDate = startRange + 52 * secPerWeek;

  var aggregate = {};

  var payload = await fetch(formatRecentListensRequest(user))
    .then((res) => res.json())
    .catch((err) => console.log("Error piecing together the data"));

  const maxPages = payload["recenttracks"]["@attr"]["totalPages"];
  var currPage = payload["recenttracks"]["@attr"]["page"];

  while (currPage < maxPages) {
    // make a request
    const payload = await fetch(formatRecentListensRequest(user));
    var currPage = payload["recenttracks"]["@attr"]["page"];
  }
}

async function getSongsHandler(req: NextApiRequest, res: NextApiResponse) {
  const user: string = req.query.user as string;
  const payload = await fetch(formatRecentListensRequest(user)).then((res) =>
    res.json()
  );

  return res.status(200).json({ success: true, payload: payload });
}

export default getSongsHandler;
