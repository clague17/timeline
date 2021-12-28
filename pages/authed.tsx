import type { NextPage, InferGetStaticPropsType } from "next";
import { useState, useEffect } from "react";
import { get, set } from "@upstash/redis";
import styles from "../styles/Home.module.css";
import { Heading, Box, Text } from "@chakra-ui/react";
import ActivityCalendar from "react-activity-calendar";
import type { Day } from "../util/types";
import { generateData } from "../util/user_helpers";

export async function getServerSideProps() {
  var realname = await get("realname")
    .then((res) => res.data)
    .catch((error) => console.log(error));
  console.log("we're here! " + realname);

  var username = await get("username").then((res) => res.data);
  return {
    props: {
      realname,
      username,
    },
  };
}

const localhost = "http://localhost:3000";

const Authed = ({ realname, username }: any) => {
  var [isFetchingCalendarDays, setIsFetchingCalendarDays] = useState(true);
  var [calendarDays, setCalendarDays] = useState([]);
  var [songTitle, setSongTitle] = useState("");

  var numberDays = 5;

  useEffect(() => {
    // Update the document title using the browser API
    var req =
      localhost + `/api/get_songs?user=${username}&days=${numberDays}&calendar`;
    fetch(req)
      .then((res) => res.json())
      .then((data) => {
        var [songTitle, days] = Object.entries(data["payload"])[14];
        setSongTitle(songTitle);
        setCalendarDays(days as any);
        setIsFetchingCalendarDays(false);
      });
  }, []);

  return (
    <main className={styles.main}>
      <Box
        p="6"
        m="5"
        borderWidth="2px"
        rounded="lg"
        flexBasis={["auto", "45%"]}
      >
        Welcome {realname}
      </Box>
      <Box>
        <Text>{songTitle}</Text>
        <ActivityCalendar
          data={calendarDays}
          labels={{
            legend: {
              less: "Less",
              more: "More",
            },
            months: [
              "Jan",
              "Feb",
              "Mar",
              "Apr",
              "May",
              "Jun",
              "Jul",
              "Aug",
              "Sep",
              "Oct",
              "Nov",
              "Dec",
            ],
            totalCount: "{{count}} listens in {{year}}",
            weekdays: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
          }}
          loading={isFetchingCalendarDays}
        />
      </Box>
      <Box
        as="a"
        href="https://nextjs.org/docs"
        p="6"
        m="4"
        borderWidth="1px"
        rounded="lg"
        flexBasis={["auto", "45%"]}
        className={styles.card}
      >
        <Heading as="h3" size="lg" mb="2">
          AUTHENTICATED &rarr;
        </Heading>
        <Text fontSize="lg">
          Find in-depth information about Next.js features and API.
        </Text>
      </Box>
    </main>
  );
};

export default Authed;
