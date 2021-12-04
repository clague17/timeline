// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
var SpotifyWebApi = require("spotify-web-api-node");
import { get, set } from "@upstash/redis";

var SpotifyWebApi = require("spotify-web-api-node");

import type { NextApiRequest, NextApiResponse } from "next";

const spotifyObj = {
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
};

var spotifyApi = new SpotifyWebApi(spotifyObj);

var fetchTokens = Promise.all([get("spotifyAccess"), get("spotifyRefresh")])
  .then(([access, refresh]) => {
    spotifyApi.setAccessToken(access.data);
    spotifyApi.setRefreshToken(refresh.data);
  })
  .catch((err) =>
    console.log("Couldn't find the access or refresh tokens from redis: " + err)
  );

interface UserProfile {
  country: string;
  display_name: string;
  email: string;
  explicit_content: { filter_enabled: boolean; filter_locked: boolean };
  external_urls: { spotify: string };
  followers: { href: null; total: number };
  href: string;
  id: string;
  images: [[Object]];
  product: string;
  type: string;
  uri: string;
}

async function getUserInfoHandler(req: NextApiRequest, res: NextApiResponse) {
  await fetchTokens;
  var user: UserProfile = await spotifyApi
    .getMe()
    .then((data: any) => data.body)
    .catch((err: any) => console.log(err));
  // const me = spotifyApi.getMe().then((data: any) => data.json());
  //   await runMiddleware(req, res, cors);
  //   var authorizeURL = spotifyApi.createAuthorizeURL(req.scopes, req.state);
  console.log("sending over user-profile: ", user);
  return res.status(200).json(user);
}

export default getUserInfoHandler;
