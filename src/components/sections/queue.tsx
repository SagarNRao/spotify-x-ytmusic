"use client";
import React, { useContext, useEffect } from "react";
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
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("AppContext must be used within an AppProvider");
  }
  const { QDetails, songs, setSongs } = context;

  useEffect(() => {
    if (QDetails) {
      const spotifyData: SpotifyResponse = JSON.parse(QDetails);

      const newSongs: Song[] = [];

      // Add currently playing track to the array
      newSongs.push({
        platform: "Spotify",
        uri: spotifyData.data.currently_playing.uri?.split(":").pop() || null,
        id: null,
        name: spotifyData.data.currently_playing.name,
        duration: spotifyData.data.currently_playing.duration_ms,
      });

      // Add queued tracks to the array
      spotifyData.data.queue.forEach((track) => {
        newSongs.push({
          platform: "Spotify",
          uri: track.uri?.split(":").pop() || null,
          id: null,
          name: track.name,
          duration: track.duration_ms,
        });
      });

      setSongs(newSongs);
    }
  }, [QDetails, setSongs]);

  return (
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
            song.platform === "Spotify" && (
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
            )
          ))}
        </ul>
      </SheetContent>
    </Sheet>
  );
}
