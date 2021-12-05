import type { NextPage, InferGetStaticPropsType } from "next";
import { get, set } from "@upstash/redis";
import styles from "../styles/Home.module.css";
import { Heading, Box, Text } from "@chakra-ui/react";

const userInfo = {};

export async function getStaticProps() {
  // TODO somehow get the username from the last page onto here
  console.log(name);
  var realname = get(name + "realname");
  return {
    props: {
      realname,
    },
  };
}

interface Props {
  realname: string;
}

const Authed = ({ realname }: Props) => {
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
