import React, { useState } from "react";
import type { NextPage, InferGetStaticPropsType } from "next";
import Head from "next/head";
import Image from "next/image";
import styles from "../styles/Home.module.css";
import { Button, Stack, Input, FormControl } from "@chakra-ui/react";

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
    await fetch(req);
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
        <h1 className={styles.title}>
          I hate <a href="https://spotify.com">Spotify!</a>
        </h1>
      </main>
    </div>
  );
}

export default Home;
