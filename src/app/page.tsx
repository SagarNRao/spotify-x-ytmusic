"use client";

import React, { useState, useEffect, FormEvent } from "react";
import axios from "axios";

export default function Home() {
  const ClientID = process.env.NEXT_PUBLIC_CLIENT_ID;
  const ClientSecret = process.env.NEXT_PUBLIC_CLIENT_SECRET;
  const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize";
  const RESPONSE_TYPE = "token";
  const REDIRECT_URI = "http://localhost:3000";

  const [token, setToken] = useState<string>("");
  const [SearchKey, setSearchKey] = useState<string>("");

  // useEffect(() => {
  //   axios("https://accounts.spotify.com/api/token", {
  //     headers: {
  //       "Content-Type": "application/x-www-form-urlencoded",
  //       Authorization:
  //         "Basic " +
  //         btoa(
  //           process.env.NEXT_PUBLIC_CLIENT_ID +
  //             ":" +
  //             process.env.NEXT_PUBLIC_CLIENT_SECRET
  //         ),
  //     },
  //     data: "grant_type=client_credentials",
  //     method: "POST",
  //   }).then((tokenResponse) => {
  //     console.log(tokenResponse.data.access_token);
  //     setToken(tokenResponse.data.access_token);
  //   });
  // }, []);

  const Search = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const { data } = await axios.get("https://api.spotify.com/v1/search", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        q: SearchKey,
        type: "artist",
      },
    });

    console.log(data);
  };

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      {!token ? (
        <>
          <button>
            <a
              href={`${AUTH_ENDPOINT}?client_id=${ClientID}&redirect_uri=${REDIRECT_URI}&response_type=${RESPONSE_TYPE}`}
            >
              Login to Spotify
            </a>
          </button>
        </>
      ) : (
        <form onSubmit={Search}>
          <input
            type="text"
            value={SearchKey}
            onChange={(e) => setSearchKey(e.target.value)}
          />
          <button type="submit">Search</button>
        </form>
      )}
    </div>
  );
}
