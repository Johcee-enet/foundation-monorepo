"use client";

import { useEffect } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Analytics } from "@vercel/analytics/react";

export default function Home() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const ref = searchParams.get("ref");

  useEffect(() => {
    // if the person is logining in for the first time it should check if its an existing user to push either to dashboard or login
    setTimeout(() => {
      if (ref) {
        router.push(`/authentication?ref=${ref}`);
      } else {
        router.push("/authentication");
      }
    }, 3000);
  }, []);
  return (
    <html lang="en">
      <main className="flex flex-col items-center pb-10">
        <div className="my-auto flex shrink-0 flex-col items-center justify-center gap-3">
          <Image
            src="/foundation.svg"
            alt="Logo"
            height={130}
            width={130}
            priority
            className="shrink-0 invert dark:invert-0"
          />
          <div className="relative h-14 w-64 shrink-0 object-contain">
            <Image
              src="/foundation-text.png"
              alt="Logo"
              fill={true}
              sizes="100%"
              className="invert-0 dark:invert"
            />
          </div>
        </div>
        <div className="relative h-16 w-40 shrink-0 justify-self-end object-contain">
          <Image
            src="/powered.png"
            alt="Logo"
            fill={true}
            sizes="100%"
            className="invert dark:invert-0"
          />
        </div>
      </main>
      <SpeedInsights />
      <Analytics />
    </html>
  );
}
