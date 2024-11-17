import React from 'react';
import SpotifyWebPlayer from 'react-spotify-web-playback';

interface PlayerProps {
  access_token: string;
  trackUri:string
}

const Player: React.FC<PlayerProps> = ({ access_token, trackUri }) => {
  return (
    <div>
      <SpotifyWebPlayer token={access_token}
      showSaveIcon
      uris={trackUri?[trackUri]:[]} />
    </div>
  );
};

export default Player;