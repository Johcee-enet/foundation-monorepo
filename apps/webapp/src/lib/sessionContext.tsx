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
  userId: string | null;
};

const SessionContext = createContext<ISession | null>({ userId: null });

interface SessionProps {
  children: ReactNode;
}
export default function SessionProvider({ children }: SessionProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const ref = searchParams.get("ref");

  const [session, setSession] = useState<{ userId: string | null } | null>(
    null,
  );
  const isClient = useClient();

  useEffect(() => {
    // @ts-ignore
    if (isClient && typeof window !== "undefined") {
      console.log("Check from session provider");
      WebApp.expand();

      setTimeout(() => {
        if (("WebApp" in window.Telegram && WebApp.initData.length)) {
          console.log(WebApp, ":::Telegram embeds");
          console.log("inside telegram webview");
          return;
        } else {
          const _session = localStorage.getItem("fd-session");
          if (_session && !pathname.includes("authentication")) {
            const session = JSON.parse(_session);
            if (session?.isOnboarded) {
              setSession(session);
              router.replace("/dashboard");
            } else {
              router.replace("/authentication")
            }
          } else {
            router.replace("/authentication")
          }

          // if (ref) {
          //   router.push(`/authentication?ref=${ref}`);
          // } else {
          //   router.push("/authentication");
          // }
        }

      }, 4000);
    }
  }, [router, isClient]);

  return (
    <SessionContext.Provider
      value={{ userId: session?.userId as string | null }}
    >
      {children}
    </SessionContext.Provider>
  );
}

const useSession = () => useContext(SessionContext);

export { useSession };
