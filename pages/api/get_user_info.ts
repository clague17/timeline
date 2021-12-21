// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { get, set } from "@upstash/redis";
import type { NextApiRequest, NextApiResponse } from "next";

const lastApi = "http://ws.audioscrobbler.com";
const localhost = "http://localhost:3000";

interface request {
  user: string;
}

/** This function is specifically for formatting this route in the last.fm API
 * https://www.last.fm/api/show/user.getInfo
 */

function formatRequest(user: string): string {
  const str: string =
    lastApi +
    `/2.0/?method=user.getinfo&user=${user}&api_key=${process.env.LAST_ID}&format=json`;
  return str;
}

async function getUserInfoHandler(req: NextApiRequest, res: NextApiResponse) {
  const user: string = req.query.user as string;
  const payload = await fetch(formatRequest(user))
    .then((res) => res.json())
    .catch((error) => {
      return { error: true };
    });
  if (payload.error) {
    console.log("errore");
    console.log("redirecting to home");
    return res.redirect("/");
  }
  set("realname", payload.user.realname);
  set("username", payload.user.name);
  console.log("redirecting to authed!");
  return res.redirect(localhost + "/authed");
}

export default getUserInfoHandler;
