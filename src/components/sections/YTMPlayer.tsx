"use client";
import { PlayerState, useYoutube } from "react-youtube-music-player";
import {
  IoPause,
  IoPlay,
  IoPlaySkipBack,
  IoPlaySkipForward,
  IoStop,
  IoVolumeHigh,
  IoVolumeMedium,
  IoVolumeLow,
  IoVolumeMute,
} from "react-icons/io5";
import React from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ReactPlayer from "react-player";
import { useState, useContext } from "react";
import { AppContext } from "@/app/AppContext";

interface YTMProps {
  videoID: string;
  Name: string;
}

const YTMPlayer: React.FC<YTMProps> = ({ videoID, Name }) => {
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
  return (
    <Card>
      <CardHeader>{Name}</CardHeader>
      <ReactPlayer
        playing={playingOrNah}
        url={`https://www.youtube.com/watch?v=${videoID}`}
        width={"447px"}
        height={"245px"}
      ></ReactPlayer>
      {playingOrNah == false ? (
        <Button
          onClick={() => {
            setPlayingOrNah(true);
          }}
        >
          Play
        </Button>
      ) : (
        <Button
          onClick={() => {
            setPlayingOrNah(false);
          }}
        >
          Pause
        </Button>
      )}{" "}
    </Card>
  );
};

export default YTMPlayer;
