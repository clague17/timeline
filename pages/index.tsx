import React, { useState } from "react";
import type { NextPage, InferGetStaticPropsType } from "next";
import Head from "next/head";
import Image from "next/image";
import styles from "../styles/Home.module.css";
import {
  Button,
  Stack,
  Input,
  InputRightElement,
  FormControl,
} from "@chakra-ui/react";
import Link from "next/link";

// spotify things

type UserProfile = {
  age: string;
  bootstrap: string;
  country: string;
  gender: string;
  image: [{}, {}, {}, {}];
  name: string;
  playcount: string;
  playlists: string;
  realname: string;
  registered: { unixtime: string; text: number };
  subscriber: string;
  type: string;
  url: string;
};

function Home() {
  const [text, setText] = useState("");
  const [isButtonLoading, setIsButtonLoading] = useState(false);

  const usernameHandler = (event: any) => {
    setText(event.target.value);
  };

  const validateUsername = async () => {
    var req = `http://localhost:3000/api/get_user_info?user=${text}`;
    setIsButtonLoading(true);
    // call the api with text
    await fetch(req).then(
      (value) =>
        new Promise((resolve) => {
          setTimeout(() => {
            resolve(value);
          }, 2000);
        })
    );

    setIsButtonLoading(false);
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>Timeline</title>
        <meta name="description" content="Get your music timeline" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={styles.main}>
        <FormControl id="usernameForm" className={styles.usernameForm}>
          <Stack spacing={4}>
            <Input
              placeholder="Lastfm username"
              onChange={usernameHandler}
              value={text}
            />
            <Button
              isLoading={isButtonLoading}
              onClick={validateUsername}
              loadingText="Loading"
            >
              Connect with Lastfm
            </Button>
          </Stack>
        </FormControl>
        <h1 className={styles.title}>
          I hate <a href="https://spotify.com">Spotify!</a>
        </h1>

        <p className={styles.description}>
          Get started by editing{" "}
          <code className={styles.code}>pages/index.tsx</code>
        </p>

        <div className={styles.grid}>
          <a href="https://nextjs.org/docs" className={styles.card}>
            <h2>Documentation &rarr;</h2>
            <p>Find in-depth information about Next.js features and API.</p>
          </a>

          <a href="https://nextjs.org/learn" className={styles.card}>
            <h2>Learn &rarr;</h2>
            <p>Learn about Next.js in an interactive course with quizzes!</p>
          </a>

          <a
            href="https://github.com/vercel/next.js/tree/master/examples"
            className={styles.card}
          >
            <h2>Examples &rarr;</h2>
            <p>Discover and deploy boilerplate example Next.js projects.</p>
          </a>

          <a
            href="https://vercel.com/new?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
            className={styles.card}
          >
            <h2>Deploy &rarr;</h2>
            <p>
              Instantly deploy your Next.js site to a public URL with Vercel.
            </p>
          </a>
        </div>
      </main>

      <footer className={styles.footer}>
        <a
          href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          Powered by{" "}
          <span className={styles.logo}>
            <Image src="/vercel.svg" alt="Vercel Logo" width={72} height={16} />
          </span>
        </a>
      </footer>
    </div>
  );
}

export default Home;
