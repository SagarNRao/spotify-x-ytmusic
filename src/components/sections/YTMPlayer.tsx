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

// const reYTMPlayer: React.FC<YTMProps> = ({ videoID, Name }) => {
//   const { playerDetails, actions } = useYoutube({
//     id: videoID,
//     type: "video",
//   });

//   const renderVolumeIcon = () => {
//     if (playerDetails.volume === 0) {
//       return <IoVolumeMute />;
//     }
//     if (playerDetails.volume <= 30) {
//       return <IoVolumeLow />;
//     }
//     if (playerDetails.volume <= 60) {
//       return <IoVolumeMedium />;
//     }
//     return <IoVolumeHigh />;
//   };

//   return (
//     <Card className="App">
//       <CardHeader className="video-title">
//         {playerDetails.title}
//         <br />
//         <br />
//         {videoID}
//       </CardHeader>
//       <div className="player-controls">
//         <Button onClick={actions.previousVideo}>
//           <IoPlaySkipBack />
//         </Button>
//         {playerDetails.state === PlayerState.PLAYING ? (
//           <Button className="emphasised" onClick={actions.pauseVideo}>
//             <IoPause />
//           </Button>
//         ) : (
//           <Button className="emphasised" onClick={actions.playVideo}>
//             <IoPlay />
//           </Button>
//         )}
//         <Button onClick={actions.stopVideo}>
//           <IoStop />
//         </Button>
//         <Button onClick={actions.nextVideo}>
//           <IoPlaySkipForward />
//         </Button>
//         <div className="volume-control">
//           {renderVolumeIcon()}
//           <input
//             type="range"
//             value={playerDetails.volume ?? 0}
//             min={0}
//             max={100}
//             onChange={(event) => actions.setVolume(event.target.valueAsNumber)}
//           />
//         </div>
//       </div>
//     </Card>
//   );
// };

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
