"use client";
import React, { useState, useEffect, FormEvent } from "react";
import axios from "axios";
import { Input } from "@/components/ui/input";
import DropdownMenu from "@/components/ui/DropdownMenu";
import { Track } from "./types";

export default function Home() {
  const ClientID = process.env.NEXT_PUBLIC_CLIENT_ID;
  const ClientSecret = process.env.NEXT_PUBLIC_CLIENT_SECRET;
  const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize";
  const RESPONSE_TYPE = "token";
  const REDIRECT_URI = "http://localhost:3000";

  const [token, setToken] = useState<string | null>(null);
  const [searchType, setSearchType] = useState<string | null>(null);
  const [SearchKey, setSearchKey] = useState<string>("");

  const Search = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!token) {
      console.error("Cannot search artists, no access token available");
      return;
    }

    const { data } = await axios.get("https://api.spotify.com/v1/search", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        q: SearchKey,
        type: searchType,
        market: "ES",
        limit: 10,
        offset: 5,
      },
    });

    console.log(typeof data);
    console.log(data);
    Feed(JSON.stringify(data));
  };

  const Feed = (SearchResult: string) => {
    interface Track {
      name: string;
      url: string;
      artist: string;
      artisturl: string;
    }

    const ParsedData = JSON.parse(SearchResult);
    switch (searchType) {
      case "track": {
        ParsedData.tracks.items.forEach((track: Track) => {
          const name = track.name;
          console.log(name);
        });
        break;
      }
      // Add other cases as needed
      default: {
        console.log("Default case");
        break;
      }
    }
};

  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      const hashParams = new URLSearchParams(hash.substring(1));
      const accessToken = hashParams.get("access_token");
      const expiresIn = hashParams.get("expires_in"); // Usually in seconds

      if (accessToken && expiresIn) {
        const expiryTime = new Date().getTime() + parseInt(expiresIn) * 1000;
        window.localStorage.setItem("token", accessToken);
        window.localStorage.setItem("tokenExpiry", expiryTime.toString());
        setToken(accessToken);

        // Clear the hash from the URL
        window.location.hash = "";
      }
    } else {
      const storedToken = window.localStorage.getItem("token");
      const tokenExpiry = window.localStorage.getItem("tokenExpiry");

      if (storedToken && tokenExpiry) {
        const now = new Date().getTime();
        if (now < parseInt(tokenExpiry)) {
          setToken(storedToken);
        } else {
          // Token has expired, handle refresh logic here
          refreshAccessToken();
        }
      }
    }
  }, []);

  const refreshAccessToken = async () => {
    const refreshToken = window.localStorage.getItem("refreshToken");
    if (!refreshToken) {
      // Redirect to login if no refresh token is available
      window.location.href = `${AUTH_ENDPOINT}?client_id=${ClientID}&redirect_uri=${REDIRECT_URI}&response_type=${RESPONSE_TYPE}`;
      return;
    }

    try {
      const response = await axios.post(
        "https://accounts.spotify.com/api/token",
        null,
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization: `Basic ${btoa(`${ClientID}:${ClientSecret}`)}`,
          },
          params: {
            grant_type: "refresh_token",
            refresh_token: refreshToken,
          },
        }
      );

      const { access_token, expires_in } = response.data;
      const expiryTime = new Date().getTime() + expires_in * 1000;

      window.localStorage.setItem("token", access_token);
      window.localStorage.setItem("tokenExpiry", expiryTime.toString());
      setToken(access_token);
    } catch (error) {
      console.error("Failed to refresh access token", error);
      // Redirect to login if refresh fails
      window.location.href = `${AUTH_ENDPOINT}?client_id=${ClientID}&redirect_uri=${REDIRECT_URI}&response_type=${RESPONSE_TYPE}`;
    }
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
          <Input
            type="text"
            value={SearchKey}
            onChange={(e) => setSearchKey(e.target.value)}
          />
          <DropdownMenu
            options={[
              "album",
              "artist",
              "playlist",
              "track",
              "show",
              "episode",
              "audiobook",
            ]}
            onSelect={(option) => setSearchType(option)}
          />
          <button type="submit">Search</button>
        </form>
      )}
    </div>
  );
}
