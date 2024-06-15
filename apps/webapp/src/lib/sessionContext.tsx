"use client";

import { AsyncHook } from "async_hooks";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/navigation";

type ISession = {
  userId: string | null;
};

const SessionContext = createContext<ISession | null>({ userId: null });

interface SessionProps {
  children: ReactNode;
}
export default function SessionProvider({ children }: SessionProps) {
  const router = useRouter();
  const [session, setSession] = useState<{ userId: string | null } | null>(
    null,
  );
  useEffect(() => {
    const _session = localStorage.getItem("fd-session");
    if (_session) {
      setSession(JSON.parse(_session));
      router.replace("/dashboard");
    } else {
      router.replace("/authentication")
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
