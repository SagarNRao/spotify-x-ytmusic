"use client";
import React, { useState, useEffect, FormEvent, useContext } from "react";

import { Button } from "@/components/ui/button";
import { AppContext } from "./../../app/AppContext";

interface PlayProps {
  SongURI: string;
}

const Play: React.FC<PlayProps> = ({ SongURI: propSongURI }) => {
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
    SongURI: contextSongURI,
    setSongURI,
  } = context;

  const PlaySong = async () => {
    const songURIToUse = propSongURI || contextSongURI;

    if (!songURIToUse) {
      console.error("SongURI not defined");
      return;
    }

    const response = await fetch("https://api.spotify.com/v1/me/player/play", {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ uris: [songURIToUse] }),
    });

    if (!response.ok) {
      console.error(`HTTP error! status: ${response.status}`);
    }
  };

  return (
    <div>
      <Button onClick={PlaySong}>Play</Button>
    </div>
  );
};

export default Play;