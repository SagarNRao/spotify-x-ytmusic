"use client";
import React, { useState, useEffect, FormEvent } from "react";
import axios from "axios";
import { Input } from "@/components/ui/input";
import DropdownMenu from "@/components/ui/DropdownMenu";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Player from "./player";
import { Button } from "@/components/ui/button";

interface Artist {
  name: string;
}

interface Track {
  name: string;
  external_urls: {
    spotify: string;
  };
  uri: string;
  artists: Artist[];
}

// eslint-disable-next-line prefer-const
let results: Track[] = [];

interface PlayProps {
  SongURI: string;
}

const Play: React.FC<PlayProps> = ({ SongURI }) => {
  const [res, setRes] = useState("");

  // console.log("SongURI", SongURI);

  // const searchURI = "spotify:track:" + SongURI;

  const PlaySong = async () => {
    if (!SongURI) {
      console.error("SongURI not defined");
      return;
    }

    try {
      console.log("calling");
      const response = await fetch("http://localhost:5000/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ data: SongURI }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.text();
      setRes(result);
      console.log(result);
    } catch (error) {
      console.error("Error:", error);
      setRes("Error fetching data from Python server");
    }
  };

  return (
    <>
      <div>
        <Button onClick={PlaySong}>Play</Button>
      </div>
    </>
  );
};
export default function Home() {
  const [inputData, setInputData] = useState("");
  const [res, setRes] = useState("");

  const ClientID = process.env.NEXT_PUBLIC_CLIENT_ID;
  const ClientSecret = process.env.NEXT_PUBLIC_CLIENT_SECRET;
  const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize";
  const RESPONSE_TYPE = "token";
  const REDIRECT_URI = "http://localhost:3000";

  const [token, setToken] = useState<string | null>(null);
  const [searchType, setSearchType] = useState<string | null>(null);
  const [SearchKey, setSearchKey] = useState<string>("");
  const [TrackSearchResults, setTrackSearchResults] = useState<Track[]>([]);
  const [playingTrack, setPlayingTrack] = useState();

  const [artist, setArtist] = useState<string | null>(null);
  const [SongURI, setSongURI] = useState<string | null>(null);

  const [searchEngine, setSearchEngine] = useState<string>();

  // const [Load]

  const Search = async (event: FormEvent<HTMLFormElement>) => {
    if (searchEngine == "Spotify") {
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
    } else if (searchEngine == "YTMusic") {
      // Feed(JSON.stringify(data));
    }
  };

  const YTMSearch = async (event: FormEvent<HTMLFormElement>) => {};

  const Feed = (SearchResult: string) => {
    const ParsedData = JSON.parse(SearchResult);
    switch (searchType) {
      case "track": {
        const results: Track[] = ParsedData.tracks.items.map((item: Track) => ({
          name: item.name,
          external_urls: item.external_urls,
          uri: item.uri,
          artists: item.artists.map((artist: Artist) => ({
            name: artist.name,
          })),
        }));

        console.log(results);

        setTrackSearchResults(results);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        <>
          <form onSubmit={Search}>
            <div>
              <div className="flex">
                {" "}
                <Input
                  type="text"
                  value={SearchKey}
                  onChange={(e) => setSearchKey(e.target.value)}
                />
                <div className="max-w-full">
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
                </div>
                <div className="flex">
                  <Button
                    type="submit"
                    onClick={() => setSearchEngine("Spotify")}
                  >
                    Spotify
                  </Button>
                  <Button
                    type="submit"
                    onClick={() => setSearchEngine("YTMusic")}
                  >
                    YTMusic
                  </Button>
                </div>
              </div>
            </div>
          </form>

          <div>
            {TrackSearchResults.length > 0 ? (
              TrackSearchResults.map((track, index) => (
                <Card key={index} className="mb-4 p-4">
                  <a
                    href={track.external_urls.spotify}
                    target="_blank"
                    rel="noopener noreferrer"
                  ></a>
                  <CardTitle>{track.name}</CardTitle>
                  <br />
                  <CardDescription>
                    Track URI: {track.uri}
                    <Play SongURI={track.uri} />
                    {track.artists.map((artist, artistIndex) => (
                      <span key={artistIndex}>{artist.name} on spotify</span>
                    ))}
                  </CardDescription>
                </Card>
              ))
            ) : (
              <p>No results found</p>
            )}
          </div>
        </>

        // Search results will be displayed here
      )}
    </div>
  );
}
