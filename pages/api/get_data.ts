// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
var querystring = require("querystring");
var SpotifyWebApi = require("spotify-web-api-node");
var Redis = require("ioredis");

import type { NextApiRequest, NextApiResponse } from "next";
/**
 * Generates a random string containing numbers and letters
 * @param  {number} length The length of the string
 * @return {string} The generated string
 */
var generateRandomString = function (length: Number): String {
  var text = "";
  var possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

let redis = new Redis(
  "rediss://:90a384121e8940e7ae246e31b5f46d4b@usw1-charmed-man-32039.upstash.io:32039"
);

var scopes = ["user-read-private", "user-read-email"];
var state = generateRandomString(16);

const spotifyObj = {
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  redirectUri: "http://localhost:3000/api/get_data",
  state: state,
};

export const spotifyApi = new SpotifyWebApi(spotifyObj);

function getSpotifyAuthLink(): string {
  return spotifyApi.createAuthorizeURL(scopes, state);
}

interface SpotifyAuthSuccess {
  code: string;
  state: string;
}

interface SpotifyAuthResponse {
  body: {
    access_token: string;
    token_type: string;
    expires_in: number;
    refresh_token: string;
    scope: string;
  };
}

function maybeSetAuthCode(obj: SpotifyAuthSuccess): boolean {
  var { code, state } = obj;
  var success;
  if (state == obj.state) {
    success = spotifyApi.authorizationCodeGrant(code).then(
      function (data: SpotifyAuthResponse) {
        // console.log(data);
        // console.log("The token expires in " + data.body["expires_in"]);
        // console.log("The access token is " + data.body["access_token"]);
        // console.log("The refresh token is " + data.body["refresh_token"]);

        // Set the access token on the API object to use it in later calls
        spotifyApi.setAccessToken(data.body["access_token"]);
        spotifyApi.setRefreshToken(data.body["refresh_token"]);
        redis.set("spotifyAccess", spotifyApi);
        return true;
      },
      function (err: any) {
        console.log("Something went wrong!", err);
        return false;
      }
    );
  } else {
    console.log("Error authenticating with Spotify!");
    success = false;
  }
  return success;
}

async function authSpotifyHandler(req: NextApiRequest, res: NextApiResponse) {
  if (req.query.code != undefined) {
    var success = maybeSetAuthCode(
      (req.query as unknown) as SpotifyAuthSuccess
    );
    if (success) {
      return res.redirect("http://localhost:3000/authed");
    } else {
      return res.status(404).json({ err: "couldn't authorize code grant" });
    }
  }
  res.status(200).json({ url: getSpotifyAuthLink() });
}

export default authSpotifyHandler;
