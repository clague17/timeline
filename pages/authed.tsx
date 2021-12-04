import type { NextPage, InferGetStaticPropsType } from "next";
import styles from "../styles/Home.module.css";
import { Heading, Box, Text } from "@chakra-ui/react";

const userInfo = {};

export async function getStaticProps() {
  const res = await fetch("http://www.localhost:3000/api/get_user_info");
  const name: string = await res.json().then((json) => json.url);
  console.log(name);
  const user_name = "bob";
  console.log(user_name);
  return {
    props: {
      user_name,
    },
  };
}

const Authed = () => {
  return (
    <main className={styles.main}>
      <Box
        p="6"
        m="5"
        borderWidth="2px"
        rounded="lg"
        flexBasis={["auto", "45%"]}
      >
        Welcome {"bob"}
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