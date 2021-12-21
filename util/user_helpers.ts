import { get, set } from "@upstash/redis";
import type { CalendarData } from "../../util/types";
import { CalendarData } from "./types";

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

const longMonths = [1, 3, 5, 7, 8, 10, 12];

export function generateYear(): CalendarData[] {
  var output = [];
  var year = "2021";
  var month = 1;
  var day = 1;
  for (var i = 0; i < 365; i++) {
    var today =
      year +
      "-" +
      maybeAddLeadingZero(`${month}`) +
      "-" +
      maybeAddLeadingZero(`${day}`);
    output.push({ count: 0, date: today, level: 0 });
    // update the day and month
    if (day == 28 && month == 2) {
      day = 1;
      month++;
    } else if (day == 30) {
      if (month in longMonths) {
        day++;
      } else {
        day = 1;
        month++;
      }
    } else {
      day++;
    }
  }
  return output;
}

// This function works under the assumption that data is in sequential order
export function addMissingDaysTillYear(data: CalendarData[]): CalendarData[] {
  var allDays = generateYear();
  allDays = data.concat(allDays.slice(data.length - 1));
  return allDays;
}

export function maybeAddLeadingZero(date: string): string {
  return date.length > 1 ? date : "0" + date;
}
