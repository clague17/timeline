// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
var SpotifyWebApi = require("spotify-web-api-node");
var Redis = require("ioredis");
var SpotifyWebApi = require("spotify-web-api-node");
// import Cors from "cors";

import type { NextApiRequest, NextApiResponse } from "next";

let redis = new Redis(
  "rediss://:90a384121e8940e7ae246e31b5f46d4b@usw1-charmed-man-32039.upstash.io:32039"
);
const spotifyApi = redis.get("spotifyObj");

function getUserNameHandler(): string {
  console.log(spotifyApi);
  const me = spotifyApi
    .getMe()
    .then((data: any) => data.json())
    .catch((err: any) => console.log(err));
  console.log(me);
  return "bob";
}

async function getUserInfoHandler(req: NextApiRequest, res: NextApiResponse) {
  const me = spotifyApi.getMe().then((data: any) => data.json());
  console.log(me);
  //   await runMiddleware(req, res, cors);
  //   var authorizeURL = spotifyApi.createAuthorizeURL(req.scopes, req.state);
}

export default getUserInfoHandler;
