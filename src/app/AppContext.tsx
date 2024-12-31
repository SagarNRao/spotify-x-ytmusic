"use client";
import React, { createContext, useState, ReactNode } from "react";

interface Song {
  platform: string;
  uri: string | null;
  id: string | null;
  name: string;
  duration: number;
}

interface Actions {
  playing: boolean;
  pause: boolean;
  playNext: boolean;
  // playPrev: boolean; ill add this later
}

interface AppContextProps {
  QDetails: string | null;
  setQDetails: (value: string) => void;
  songs: Song[];
  setSongs: (value: Song[]) => void;
  actions: Actions;
  setActions: (value: Actions) => void;
  token: string | null;
  setToken: (value: string) => void;
  SongURI: string | null;
  setSongURI: (value: string) => void;
}

export const AppContext = createContext<AppContextProps | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [QDetails, setQDetails] = useState("");
  const [songs, setSongs] = useState<Song[]>([]);
  const [actions, setActions] = useState<Actions>({
    playing: false,
    pause: false,
    playNext: false,
  });
  const [token, setToken] = useState<string | null>(null);
  const [SongURI, setSongURI] = useState<string | null>(null);

  return (
    <AppContext.Provider
      value={{
        QDetails,
        setQDetails,
        songs,
        setSongs,
        actions,
        setActions,
        token,
        setToken,
        SongURI,
        setSongURI
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
