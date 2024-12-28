"use client"
import React, { createContext, useState, ReactNode } from "react";

interface Song {
  platform: string;
  uri: string | null;
  id: string | null;
  name: string;
  duration: number;
}

interface AppContextProps {
  QDetails: string | null;
  setQDetails: (value: string) => void;
  songs: Song[];
  setSongs: (value: Song[]) => void;
}

export const AppContext = createContext<AppContextProps | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [QDetails, setQDetails] = useState("");
  const [songs, setSongs] = useState<Song[]>([]);

  return (
    <AppContext.Provider value={{ QDetails, setQDetails, songs, setSongs }}>
      {children}
    </AppContext.Provider>
  );
};
