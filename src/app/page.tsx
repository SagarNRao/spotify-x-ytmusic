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
import YTMPlayer from "./ytmusic/page";

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

interface YTMTrack {
  snippet: {
    title: string | undefined;
  };
  id: {
    videoId: string | undefined;
  };

  finalTitle: string;
  finalID: string;
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
  const SCOPES = "user-top-read";

  // eslint-disable-next-line no-var
  let urlCode: string;

  const [token, setToken] = useState<string | null>(null);
  const [searchType, setSearchType] = useState<string | null>(null);
  const [SearchKey, setSearchKey] = useState<string>("");
  const [TrackSearchResults, setTrackSearchResults] = useState<Track[]>([]);
  const [YTMResults, setYTMResults] = useState<YTMTrack[]>([]);
  const [playingTrack, setPlayingTrack] = useState();

  const [artist, setArtist] = useState<string | null>(null);
  const [SongURI, setSongURI] = useState<string | null>(null);

  const [searchEngine, setSearchEngine] = useState<string>();

  // const [Load]

  const Search = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (searchEngine == "Spotify") {
      event.preventDefault();

      if (!token) {
        console.error("Cannot search artists, no access token available");
        return;
      }

      const authOptions = {
        url: "https://accounts.spotify.com/api/token",
        headers: {
          Authorization:
            "Basic " +
            Buffer.from(
              process.env.NEXT_PUBLIC_CLIENT_ID +
                ":" +
                process.env.NEXT_PUBLIC_CLIENT_SECRET
            ).toString("base64"),
        },
        form: {
          redirect_uri: REDIRECT_URI,
          grant_type: "authorization_code",
        },
        json: true,
      };

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
    } else if (searchEngine == "YTM") {
      console.log("YTM Search");
      event.preventDefault();
      try {
        const { data } = await axios.get(
          `https://www.googleapis.com/youtube/v3/search/?key=${process.env.NEXT_PUBLIC_YTDATA_API_KEY}&q=${SearchKey}&part=snippet`
        );
        console.log("calling that feed function");
        Feed(JSON.stringify(data));

        // return data;
      } catch (error) {
        console.error("Error fetching data from YouTube API", error);
        throw error;
      }
    }
  };

  const getQ = async () => {
    const data = await axios.get("https://api.spotify.com/v1/me/player/queue", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log("GUYS DATA: ", data);
  };

  const Feed = (SearchResult: string) => {
    if (searchEngine == "Spotify") {
      const ParsedData = JSON.parse(SearchResult);
      switch (searchType) {
        case "track": {
          const results: Track[] = ParsedData.tracks.items.map(
            (item: Track) => ({
              name: item.name,
              external_urls: item.external_urls,
              uri: item.uri,
              artists: item.artists.map((artist: Artist) => ({
                name: artist.name,
              })),
            })
          );

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
    } else if (searchEngine == "YTM") {
      console.log("using", searchEngine);
      const ParsedData = JSON.parse(SearchResult);
      console.log("ParsedData HERE: ", ParsedData);
      const results: YTMTrack[] = ParsedData.items.map((item: YTMTrack) => {
        const title = item.snippet.title;
        const videoId = item.id.videoId;

        return {
          snippet: {
            title: title,
          },
          id: {
            videoId: videoId,
          },
          finalTitle: title,
          finalID: videoId,
        };
      });

      setYTMResults(results);

      console.log("YTM Search results: ", YTMResults);
    }
  };

  const setCode = async () => {
    const queryString = window.location.search;

    if (queryString.length > 0) {
      const urlParams = new URLSearchParams(queryString);

      urlCode = urlParams.get("code") as string;
      console.log("URL CODE HERE ",urlCode)
    }
  };

  const getAccessToken = async () => {

    const response = await axios.post(

      'https://accounts.spotify.com/api/token',

      new URLSearchParams({
        grant_type: 'authorization_code',
        code: urlCode,
        // redirect_uri: REDIRECT_URI,
        // client_id: ClientID,
        // client_secret: ClientSecret,
      }).toString(),

      {

        headers: {

          'Content-Type': 'application/x-www-form-urlencoded',

        },

      }

    );

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

        const handleAuthentication = async () => {

          await setCode();
    
          if (urlCode) {
    
            try {
    
              await getAccessToken();
    
              window.history.pushState({}, '', '/');
    
            } catch (error) {
    
              console.error('Error retrieving access token:', error);
    
            }
    
          }

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
    const generateRandomString = (length: number) => {
      const possible =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
      const values = crypto.getRandomValues(new Uint8Array(length));
      return values.reduce((acc, x) => acc + possible[x % possible.length], "");
    };

    const codeVerifier = generateRandomString(64);

    const sha256 = async (plain: string) => {
      const encoder = new TextEncoder();
      const data = encoder.encode(plain);
      return window.crypto.subtle.digest("SHA-256", data);
    };

    const base64Encode = (input: ArrayBuffer): string => {
      const uint8Array = new Uint8Array(input);
      let binary = "";
      for (let i = 0; i < uint8Array.byteLength; i++) {
        binary += String.fromCharCode(uint8Array[i]);
      }
      return btoa(binary)
        .replace(/=/g, "")
        .replace(/\+/g, "-")
        .replace(/\//g, "_");
    };

    const hashed = await sha256(codeVerifier);
    const codeChallenge = base64Encode(hashed);

    const scope =
      "user-read-private user-read-email user-read-currently-playing user-read-playback-state";
    const authUrl = new URL("https://accounts.spotify.com/authorize");

    const refreshToken = window.localStorage.getItem("refreshToken");
    if (!refreshToken) {
      // Redirect to login if no refresh token is available
      window.location.href = `${AUTH_ENDPOINT}?client_id=${ClientID}&redirect_uri=${REDIRECT_URI}&response_type=${RESPONSE_TYPE}`;
      return;
    }

    

    try {
      const response = await axios.post(
        "https://accounts.spotify.com/api/token",

        new URLSearchParams({
          grant_type: 'authorization_code',
          code: urlCode,
        })
      );
      const token = response.data.access_token;
      setToken(token);

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
                  <Button type="submit" onClick={() => setSearchEngine("YTM")}>
                    YTMusic
                  </Button>
                </div>
              </div>
            </div>
          </form>

          <div>
            {TrackSearchResults.length > 0 && searchEngine == "Spotify" ? (
              TrackSearchResults.map((track, index) => (
                <Card key={index} className="mb-4 p-4">
                  <>
                    <a
                      href={track.external_urls.spotify}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {track.name}
                    </a>
                    <CardDescription>
                      {track.artists.map((artist, artistIndex) => (
                        <span key={artistIndex}>
                          {artist.name} on spotify <br />
                        </span>
                      ))}
                    </CardDescription>
                    <CardDescription>
                      <Play SongURI={track.uri} />
                    </CardDescription>
                  </>
                </Card>
              ))
            ) : (
              <div>
                {YTMResults.length > 0 ? (
                  YTMResults.map((track, index) => (
                    <Card key={index}>
                      <YTMPlayer
                        Name={track.finalTitle}
                        videoID={track.finalID}
                      ></YTMPlayer>
                    </Card>
                  ))
                ) : (
                  <p>o no</p>
                )}
              </div>
            )}
          </div>
        </>

        // Search results will be displayed here
      )}
      {token}
      <Button onClick={getQ}>Get queue details</Button>
    </div>
  );
}
