"use client";

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useClient } from "./mountContext";
import WebApp from "@twa-dev/sdk";

type ISession = {
  userId: string | undefined;
  isTgUser: boolean | null | undefined,
  isLoading: boolean | undefined
};

const SessionContext = createContext<ISession | null>({ userId: undefined, isTgUser: null, isLoading: true });

interface SessionProps {
  children: ReactNode;
}
export default function SessionProvider({ children }: SessionProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const ref = searchParams.get("ref");

  const [session, setSession] = useState<ISession | null>(
    null,
  );
  const [sessionLoading, setSessionLoading] = useState<boolean>(true);
  const isClient = useClient();

  useEffect(() => {
    console.log("Called on every route change");

    //TODO: check TG localStorage for userId and auto log user in
    // @ts-ignore
    if (isClient && typeof window !== "undefined") {
      console.log("Check from session provider");
      WebApp.expand();

      setTimeout(() => {
        if (("WebApp" in window.Telegram && !!WebApp.initData.length)) {
          console.log(WebApp, ":::Telegram embeds");
          console.log("inside telegram webview", WebApp.initData, WebApp.initDataUnsafe);
          const _session = localStorage.getItem("fd-session");
          if (_session && !pathname.includes("authentication")) {
            const session = JSON.parse(_session);
            console.log(session, ":::Web app session");
            console.log(session, ":::from localStorage Tg APP", window.Telegram);
            setSession(session);
            setSessionLoading(false);
            if (!session?.isOnboarded) {
              router.replace("/")
            }
          }          return;
        } else {
          const _session = localStorage.getItem("fd-session");
          if (_session && !pathname.includes("authentication")) {
            const session = JSON.parse(_session);
            setSession(session);
            setSessionLoading(false);

            if (!session?.isOnboarded) {
              router.replace("/authentication")
            }
          }
          // if (ref) {
          //   router.push(`/authentication?ref=${ref}`);
          // } else {
          //   router.push("/authentication");
          // }
        }

      }, 3000);
    }
  }, [router, isClient, setSession, pathname]);

  return (
    <SessionContext.Provider
      value={{ userId: session?.userId as string | undefined, isTgUser: session?.isTgUser, isLoading: sessionLoading }}
    >
      {children}
    </SessionContext.Provider>
  );
}

const useSession = () => useContext(SessionContext);

export { useSession };
