"use client";
import React, { useState, useEffect, FormEvent, useContext } from "react";
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
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import Player from "./player";
import { Button } from "@/components/ui/button";
import YTMPlayer from "@/components/sections/YTMPlayer";
import { AppContext } from "./AppContext";
import Queue from "@/components/sections/queue";
import { METHODS } from "http";
import Play from "@/components/sections/play";

interface Song {
  platform: string;
  uri: string | null;
  id: string | null;
  name: string;
  duration: number;
}

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

interface YouTubeVideo {
  items: {
    id: string;
    contentDetails: {
      duration: string;
    };
  }[];
}

export default function Home() {
  // eslint-disable-next-line prefer-const
  let Qcounter = 0;

  const [inputData, setInputData] = useState("");
  const [res, setRes] = useState("");
  const [codeVerifier, setCodeVerifier] = useState("");

  const ClientSecret = process.env.NEXT_PUBLIC_CLIENT_SECRET;
  const CLIENTID = process.env.NEXT_PUBLIC_CLIENT_ID;
  const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize";
  const RESPONSE_TYPE = "code";
  const REDIRECT_URI = "http://localhost:3000";
  const SCOPES =
    "user-read-private user-read-email user-top-read user-read-currently-playing user-read-playback-state user-modify-playback-state";

  // eslint-disable-next-line no-var
  let urlCode: string;

  const [searchType, setSearchType] = useState<string | null>(null);
  const [SearchKey, setSearchKey] = useState<string>("");
  const [TrackSearchResults, setTrackSearchResults] = useState<Track[]>([]);
  const [YTMResults, setYTMResults] = useState<YTMTrack[]>([]);
  const [playingTrack, setPlayingTrack] = useState<boolean>(false);

  const [artist, setArtist] = useState<string | null>(null);

  const [searchEngine, setSearchEngine] = useState<string>();
  const [spotSongAdd, setSpotSongAdd] = useState<string>();

  // const [Load]

  const context = useContext(AppContext);

  if (!context) {
    throw new Error("AppContext must be used within an AppProvider");
  }

  const {
    QDetails,
    setQDetails,
    songs,
    setSongs,
    actions,
    setActions,
    token,
    setToken,
    SongURI,
    setSongURI,
  } = context;

  const [playingStates, setPlayingStates] = useState<{
    [key: string]: boolean;
  }>({});

  const setPlayingState = (videoID: string, isPlaying: boolean) => {
    setPlayingStates((prevStates) => ({
      ...prevStates,
      [videoID]: isPlaying,
    }));
  };

  const Search = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
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
    } else if (searchEngine == "YTM") {
      console.log("YTM Search");
      event.preventDefault();
      try {
        const data = await axios.get(
          `https://www.googleapis.com/youtube/v3/search/?key=${process.env.NEXT_PUBLIC_YTDATA_API_KEY}&q=${SearchKey}&part=snippet&videoDuration=any`
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
        Authorization: `Bearer ${window.localStorage.getItem("access_token")}`,
      },
    });

    console.log("GUYS DATA: ", data);
    setQDetails(JSON.stringify(data));
  };

  const addQSpotify = async (uri: string) => {
    const response = await fetch(
      `https://api.spotify.com/v1/me/player/queue?uri=${encodeURIComponent(
        uri
      )}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    Qcounter++;
    getQ();
  };

  const addQYTM = async (videoID: string) => {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?id=${videoID}&part=contentDetails&key=${process.env.NEXT_PUBLIC_YTDATA_API_KEY}`
    );

    const data: YouTubeVideo = await response.json();
    function isoDurationToMilliseconds(duration: string): number {
      const durationRegex =
        /P(?:\d+Y)?(?:\d+M)?(?:\d+W)?(?:\d+D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?)?/;
      const match = duration.match(durationRegex);

      if (!match) {
        throw new Error("Invalid ISO 8601 duration format");
      }

      const hours = parseInt(match[1] || "0", 10);
      const minutes = parseInt(match[2] || "0", 10);
      const seconds = parseInt(match[3] || "0", 10);

      // Convert to milliseconds
      return hours * 60 * 60 * 1000 + minutes * 60 * 1000 + seconds * 1000;
    }

    const duration = isoDurationToMilliseconds(
      data.items[0]?.contentDetails?.duration
    );

    const video = YTMResults.find((video) => video.finalID == videoID);
    const title = video ? video.finalTitle : "Not found";

    const songsArray = [...songs];

    songsArray.splice(Qcounter + 1, 0, {
      platform: "YTM",
      uri: null,
      id: videoID,
      name: title,
      duration: duration,
    });
    setSongs(songsArray);
    console.log(songs);
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
      const results: YTMTrack[] = ParsedData.data.items.map(
        (item: YTMTrack) => {
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
        }
      );

      setYTMResults(results);

      console.log("YTM Search results: ", YTMResults);
    }
  };

  const setCode = async () => {
    const queryString = window.location.search;

    if (queryString.length > 0) {
      const urlParams = new URLSearchParams(queryString);

      urlCode = urlParams.get("code") as string;
      console.log("URL CODE HERE ", urlCode);
    }
  };

  const getAccessToken = async () => {
    const response = await axios.post(
      "https://accounts.spotify.com/api/token",

      new URLSearchParams({
        grant_type: "authorization_code",
        code: urlCode,
        // redirect_uri: REDIRECT_URI,
        // client_id: ClientID,
        // client_secret: ClientSecret,
      }).toString(),

      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );
  };

  const handleCallback = async () => {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const code = urlParams.get("code");
    // const state = urlParams.get("state");

    // if (!state) {
    //   window.location.href =
    //     "/#" + querystring.stringify({ error: "state_mismatch" });
    //   return;
    // }

    const authOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization:
          "Basic " +
          btoa(`${process.env.NEXT_PUBLIC_CLIENT_ID}:${ClientSecret}`),
      },
      body: new URLSearchParams({
        code: code || "",
        redirect_uri: REDIRECT_URI,
        grant_type: "authorization_code",
      }),
    };

    try {
      const response = await fetch(
        "https://accounts.spotify.com/api/token",
        authOptions
      );
      const data = await response.json();
      console.log(data);
      // Handle the response data
    } catch (error) {
      console.error("Error fetching the token:", error);
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
      } else {
        const storedToken = window.localStorage.getItem("token");
        const tokenExpiry = window.localStorage.getItem("tokenExpiry");

        if (storedToken && tokenExpiry) {
          const now = new Date().getTime();
          if (now < parseInt(tokenExpiry)) {
            setToken(storedToken);
          } else {
            // Token has expired, handle refresh logic here
          }
        }
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }
  }, []);

  useEffect(() => {
    // handleCallback();
  }, []);

  const currentToken = {
    get access_token() {
      return localStorage.getItem("access_token") || null;
    },
    get refresh_token() {
      return localStorage.getItem("refresh_token") || null;
    },
    get expires_in() {
      return localStorage.getItem("refresh_in") || null;
    },
    get expires() {
      return localStorage.getItem("expires") || null;
    },

    save: function (response: {
      access_token: string;
      refresh_token: string;
      expires_in: number;
    }) {
      const { access_token, refresh_token, expires_in } = response;
      localStorage.setItem("access_token", access_token);
      setToken(localStorage.getItem("access_token") as string);
      localStorage.setItem("refresh_token", refresh_token);
      localStorage.setItem("expires_in", expires_in.toString());

      const now = new Date();
      const expiry = new Date(now.getTime() + expires_in * 1000);
      localStorage.setItem("expires", expiry.toISOString());
    },
  };

  // On page load, try to fetch auth code from current browser search URL
  let args: URLSearchParams | undefined;

  if (typeof window !== "undefined") {
    args = new URLSearchParams(window.location.search);
  }
  const code = args?.get("code");

  async function checkCode() {
    console.log("CODE HERE", code);

    if (code) {
      const token = await getToken(code);
      currentToken.save(token);

      // Remove code from URL so we can refresh correctly.
      const url = new URL(window.location.href);
      url.searchParams.delete("code");

      const updatedUrl = url.search ? url.href : url.href.replace("?", "");
      window.history.replaceState({}, document.title, updatedUrl);
    } else {
      console.error("no code");
    }
  }

  // useEffect(() => {
  //   checkCode();
  // }, []);

  async function getToken(code: string) {
    // const code_verifier = localStorage.getItem("code_verifier") || undefined;

    try {
      console.log(
        "CODE VERIFIER HERE",
        window.localStorage.getItem("code_verifier")
      );
      const response = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          client_id: CLIENTID || "",
          grant_type: "authorization_code",
          code: code || "",
          redirect_uri: REDIRECT_URI,
          code_verifier: window.localStorage.getItem("code_verifier") || "",
        }),
      });

      console.log(response);

      return await response.json();
    } catch (e) {
      console.error(e);
    }
  }

  async function redirectToSpotifyAuthorize() {
    console.log("is it here?");
    const possible =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const randomValues = crypto.getRandomValues(new Uint8Array(64));
    const randomString = randomValues.reduce(
      (acc, x) => acc + possible[x % possible.length],
      ""
    );

    const code_verifier = randomString;
    setCodeVerifier(code_verifier);

    const data = new TextEncoder().encode(code_verifier);
    const hashed = await crypto.subtle.digest("SHA-256", data);

    const code_challenge_base64 = btoa(
      String.fromCharCode(...new Uint8Array(hashed))
    )
      .replace(/=/g, "")
      .replace(/\+/g, "-")
      .replace(/\//g, "_");

    window.localStorage.setItem("code_verifier", code_verifier);

    const authUrl = new URL("https://accounts.spotify.com/authorize");
    const clientId = process.env.NEXT_PUBLIC_CLIENT_ID;
    if (!clientId) {
      throw new Error("Client ID is not defined");
    }

    const params: Record<string, string> = {
      response_type: "code",
      client_id: clientId,
      scope: SCOPES,
      code_challenge_method: "S256",
      code_challenge: code_challenge_base64,
      redirect_uri: REDIRECT_URI,
    };

    authUrl.search = new URLSearchParams(
      params as Record<string, string>
    ).toString();
    window.location.href = authUrl.toString(); // Redirect the user to the authorization server for login
  }

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      {!token ? (
        <>
          <Button onClick={redirectToSpotifyAuthorize}>Login to Spotify</Button>
          <Button onClick={checkCode}>Check Code</Button>
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
                    <CardDescription className="flex">
                      <Play SongURI={track.uri} />
                      <div className="p-1"></div>
                      <Button onClick={() => addQSpotify(track.uri)}>
                        Add to Queue
                      </Button>
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
                        playing={!!playingStates[track.finalID as string]}
                        setPlayingState={setPlayingState}
                      />
                      <Button onClick={() => addQYTM(track.finalID)}>
                        Add to Queue
                      </Button>
                    </Card>
                  ))
                ) : (
                  <div></div>
                )}
              </div>
            )}
          </div>

          <Button onClick={getQ}>Get queue details</Button>
          <Queue />
        </>

        // Search results will be displayed here
      )}
    </div>
  );
}
