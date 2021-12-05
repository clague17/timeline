import { get, set } from "@upstash/redis";

export var fetchValidTokens = () =>
  Promise.all([get("spotifyAccess"), get("spotifyRefresh")])
    .then(([access, refresh]) => {
      return [access.data, refresh.data];
    })
    .catch((err) =>
      console.log(
        "Couldn't find the access or refresh tokens from redis: " + err
      )
    );
