"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
const IsClientCtx = createContext(false);

export const MountCtxProvider = ({ children }: { children: ReactNode }) => {
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    console.log("Updating client componenet:", isClient);
    setIsClient(true)
  }, []);


  useEffect(() => {
    console.log("Client change listener", isClient);
  }, [isClient]);
  return (
    <IsClientCtx.Provider value={isClient}>{children}</IsClientCtx.Provider>
  );
};

export function useClient() {
  return useContext(IsClientCtx);
}
