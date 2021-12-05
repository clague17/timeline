// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { get, set } from "@upstash/redis";

import type { NextApiRequest, NextApiResponse } from "next";

// Takes in a timestamp and uses that in the "after" field when making the fetch
// var fetchNextSongs = (timestamp: string) => {
//   return spotifyApi.getMyRecentlyPlayedTracks();
// };

async function getSongsHandler(req: NextApiRequest, res: NextApiResponse) {
  //   var user: UserProfile = await spotifyApi
  //     .getMe()
  //     .then((data: any) => data.body)
  //     .catch((err: any) => console.log(err));
  // const me = spotifyApi.getMe().then((data: any) => data.json());
  //   await runMiddleware(req, res, cors);
  //   var authorizeURL = spotifyApi.createAuthorizeURL(req.scopes, req.state);
  console.log("we're in the handler");
  return res.status(200).json({ success: true });
}

export default getSongsHandler;
