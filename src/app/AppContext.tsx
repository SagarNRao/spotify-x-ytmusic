"use client"
import React, { createContext, useState, ReactNode } from "react";

interface AppContextProps {
  QDetails: string;
  setQDetails: (value: string) => void;
}

export const AppContext = createContext<AppContextProps | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [QDetails, setQDetails] = useState("");

  return (
    <AppContext.Provider value={{ QDetails, setQDetails }}>
      {children}
    </AppContext.Provider>
  );
};
