import { get, set } from "@upstash/redis";
import { CalendarData, Day, Level } from "./types";
import differenceInCalendarDays from "date-fns/differenceInCalendarDays";
import eachDayOfInterval from "date-fns/eachDayOfInterval";
import formatISO from "date-fns/formatISO";
import getDay from "date-fns/getDay";
import getMonth from "date-fns/getMonth";
import nextDay from "date-fns/nextDay";
import parseISO from "date-fns/parseISO";
import subWeeks from "date-fns/subWeeks";
import lastDayOfMonth from "date-fns/lastDayOfMonth";
import type { Day as WeekDay } from "date-fns";

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

/** Use [[normalizeCalendarDays]] instead of this!!! */
export function generateYear(data: Day[]): Day[] {
  var output: Day[] = [];
  var year = "2021";
  var month = 1;
  var day = 1;
  var candidate = data.shift();
  for (var i = 0; i < 365; i++) {
    var today =
      year +
      "-" +
      maybeAddLeadingZero(`${month}`) +
      "-" +
      maybeAddLeadingZero(`${day}`);
    // check if candidate fits here
    if (candidate && candidate["date"] === today) {
      output.push(candidate);
      candidate = data.shift();
    } else {
      output.push({
        date: today,
        count: 0,
        level: 0,
      });
    }
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
    } else if (day == 31) {
      day = 1;
      month++;
    } else {
      day++;
    }
  }
  return output;
}

export function normalizeCalendarDays(days: Array<Day>): Array<Day> {
  const daysMap = days.reduce((map, day) => {
    map.set(day.date, day);
    return map;
  }, new Map<string, Day>());

  var monthStart = 0;
  var monthEnd = 11;

  const yearStart = new Date(1610013675 * 1000).getFullYear(); // NOTE THIS IS ANCHORING TO 2021, have to get unix timstamp to milliseconds before converting to Date
  const yearEnd = monthEnd < monthStart ? yearStart + 1 : yearStart;

  return eachDayOfInterval({
    start: new Date(yearStart, monthStart, 1),
    end: lastDayOfMonth(new Date(yearEnd, monthEnd, 1)),
  }).map((day) => {
    const date = formatISO(day, { representation: "date" });

    if (daysMap.has(date)) {
      return daysMap.get(date) as Day;
    }

    return {
      date,
      count: 0,
      level: 0,
    };
  });
}

export function maybeAddLeadingZero(date: string): string {
  return date.length > 1 ? date : "0" + date;
}

export function listenLevel(listens: number) {
  switch (true) {
    case 0 < listens && listens < 3:
      return 1;
    case 3 < listens && listens < 6:
      return 2;
    case 6 < listens && listens < 10:
      return 3;
    case listens > 10:
      return 4;
  }
}

export function generateData(monthStart = 0, monthEnd = 11): Array<Day> {
  const MAX = 10;
  const LEVELS = 5;

  const yearStart = new Date().getFullYear();
  const yearEnd = monthEnd < monthStart ? yearStart + 1 : yearStart;

  const days = eachDayOfInterval({
    start: new Date(yearStart, monthStart, 1),
    end: lastDayOfMonth(new Date(yearEnd, monthEnd, 1)),
  });

  return days.map((date) => {
    const count = Math.max(
      0,
      Math.round(Math.random() * MAX - Math.random() * (0.8 * MAX))
    );
    const level = Math.ceil(count / (MAX / (LEVELS - 1))) as Level;

    return {
      date: formatISO(date, { representation: "date" }),
      count,
      level,
    };
  });
}
