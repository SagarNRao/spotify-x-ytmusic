"use client";
import React, { useContext, useEffect, useMemo, useState } from "react";
import { AppContext } from "@/app/AppContext";
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
import { Button } from "@/components/ui/button";
import axios from "axios";
import Play from "./play";
import YTMPlayer from "./YTMPlayer";

interface Song {
  platform: string;
  uri: string | null;
  id: string | null;
  name: string;
  duration: number;
}

interface SpotifyResponse {
  data: {
    currently_playing: {
      uri: string;
      name: string;
      duration_ms: number;
    };
    queue: {
      uri: string;
      name: string;
      duration_ms: number;
    }[];
  };
}

const mixQ: Song[] = [];

export default function Queue() {
  const [activePlatform, setActivePlatform] = useState("Spotify");
  const [YTMTrackID, setYTMTrackID] = useState("");
  const [YTMTrackName, setYTMTrackName] = useState("");

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
    playingOrNah,
    setPlayingOrNah
  } = context;

  const newSongs: Song[] = useMemo(() => {
    if (!QDetails) return [];

    const spotifyData: SpotifyResponse = JSON.parse(QDetails);

    const songsArray: Song[] = [];

    // Add currently playing track to the array
    songsArray.push({
      platform: "Spotify",
      uri: spotifyData.data.currently_playing.uri?.split(":").pop() || null,
      id: null,
      name: spotifyData.data.currently_playing.name,
      duration: spotifyData.data.currently_playing.duration_ms,
    });

    // Add queued tracks to the array
    spotifyData.data.queue.forEach((track) => {
      if (track.uri != null) {
        songsArray.push({
          platform: "Spotify",
          uri: track.uri?.split(":").pop() || null,
          id: null,
          name: track.name,
          duration: track.duration_ms,
        });
      }
    });

    setSongs(songsArray);
    return songsArray;
  }, [QDetails, setSongs]);

  const getQRe = async () => {
    // yes yes i know ill change it later
    const data = await axios.get("https://api.spotify.com/v1/me/player/queue", {
      headers: {
        Authorization: `Bearer ${window.localStorage.getItem("access_token")}`,
      },
    });

    console.log("GUYS DATA: ", data);
    setQDetails(JSON.stringify(data));
  };

  const timeSkippyBoi = async () => {
    const wait = (ms: number) =>
      new Promise((resolve) => setTimeout(resolve, ms));

    for (
      let i = 0;
      i < 100;
      i++ // let it be up to 100 for now ill take care of it later
    ) {
      if (
        songs[i].platform == "Spotify" &&
        songs[i + 1].platform != "Spotify"
      ) {
        setActivePlatform("Spotify");
        setYTMTrackID(songs[i].id as string);
        setYTMTrackName(songs[i].name);
        await wait(songs[i].duration + 2000);
        const response = await fetch(
          "https://api.spotify.com/v1/me/player/pause",
          {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        songs.shift();
        setActivePlatform("YTM");

        setPlayingOrNah(true);
      }
      // if (activePlatform == "YTM") {
      //   await songs[i].duration;
      //   if (songs[i + 1].platform == "YTM")
      //   {

      //   }
      //   else
      //   {
      //     setActivePlatform("Spotify")
      //   }
      // }
    }
  };

  useEffect(() => {
    if (songs[0] && songs[0].platform != undefined) {
      timeSkippyBoi();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activePlatform, QDetails, songs]);

  return (
    <section className="flex">
      <div>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline">Queue</Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <h2>Songs</h2>
            </SheetHeader>
            <ul>
              {songs.map((song, index) => (
                <li key={index}>
                  <Card>
                    <CardHeader>
                      <CardTitle>{song.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription>On {song.platform}</CardDescription>
                    </CardContent>
                  </Card>
                </li>
              ))}
            </ul>
          </SheetContent>
        </Sheet>
      </div>
      <div className="box">
        {activePlatform == "Spotify" ? (
          <p>Playing from Spotify</p>
        ) : (
          <>
            <p>Playing from YTM</p>
            <YTMPlayer videoID={YTMTrackID} Name={YTMTrackName}></YTMPlayer>
          </>
        )}
      </div>
    </section>
  );
}
