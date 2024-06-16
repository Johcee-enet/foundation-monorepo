"use client";

import type { ReactNode } from "react";
import { SessionProvider } from "@convex-dev/convex-lucia-auth/react";
import { ConvexProvider, ConvexReactClient } from "convex/react";

import { AfterSSR } from "@acme/ui/src/components/helpers/AfterSSR";

import { env } from "~/env";

const convex = new ConvexReactClient(env.NEXT_PUBLIC_CONVEX_URL);

export default function ConvexClientProvider({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <AfterSSR>
      <SessionProvider>
        <ConvexProvider client={convex}>
          {children}
        </ConvexProvider>
      </SessionProvider>
    </AfterSSR>
  );
}
