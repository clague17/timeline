// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { get, set } from "@upstash/redis";
import type { NextApiRequest, NextApiResponse } from "next";
import { doc, setDoc, getDoc } from "@firebase/firestore";
import { firestore } from "../../firebase/clientApp";
import { User } from "../../util/types";

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

const getOrCreateUser = async (username: string, realname: string) => {
  const userRef = doc(firestore, "users", `${username}`);
  const docSnap = await getDoc(userRef);

  if (docSnap.exists()) {
    console.log("The user gotten from firestore: ", docSnap.data);
    return docSnap.data;
  } else {
    return await addUser(username, realname);
  }
};

/**
 *
 * @param username the username to create
 * @param realname the user's real name
 * This function
 * @returns a number 200 if user was added, a number 409 if the user alr exists
 */
const addUser = async (username: string, realname: string) => {
  // get the current timestamp
  const timestamp: string = Date.now().toString();
  // create a pointer to our Document
  const _user = doc(firestore, `users/${username}`);
  // structure the todo data
  const userData: User = {
    username: username,
    realname: realname,
    songs: {},
  };
  try {
    //add the Document
    await setDoc(_user, userData);
    //show a success message
    console.log("Successfully created user: ", username);
    return userData;
    //reset fields
  } catch (error) {
    //show an error message
    console.log("An error occurred while adding user");
  }
};

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
  // TODO: Check if we have this user registered in our database
  // if not, create an entry under the users collection
  // await getOrCreateUser(payload.user.name, payload.user.realname);
  return res.status(200).json({ success: true, isUsernameValid: true });
}

export default getUserInfoHandler;
