"use client";

import { AsyncHook } from "async_hooks";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { useRouter, usePathname } from "next/navigation";

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
  const [session, setSession] = useState<{ userId: string | null } | null>(
    null,
  );
  useEffect(() => {
    // @ts-ignore
    if (window && "WebApp" in window.Telegram) {
      console.log("Check from session provider");
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

    }
  }, [router]);

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
