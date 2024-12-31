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
import { useState } from "react";

interface YTMProps {
  videoID: string;
  Name: string;
}

const YTMPlayer: React.FC<YTMProps> = ({ videoID, Name }) => {
  const [playingOrNah, setPlayingOrNah] = useState(false);
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
