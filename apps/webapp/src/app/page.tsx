"use client";

import { useEffect } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import WebApp from "@twa-dev/sdk";
import { MainButton } from "@twa-dev/sdk/react";
import { useClient } from "@/lib/mountContext";

export default function Home() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const ref = searchParams.get("ref");
  const isClient = useClient();


  console.log("Client check from main page", isClient);

  useEffect(() => {
    console.log(isClient, ":::check if it is client");
    if (isClient) {

      setTimeout(() => {

        if (typeof window !== "undefined") {
          // @ts-ignore
          // @ts-ignore
          console.log(WebApp, ":::Telegram embeds");
          console.log("Inside telegram webview");
          if (!WebApp.isExpanded) {
            WebApp.expand();
          }
          return;
        } else {
          if (ref) {
            router.push(`/authentication?ref=${ref}`);
          } else {
            router.push("/authentication");
          }

        }
      }, 3000);
    }
  }, []);



  return (
    <main className="flex flex-col items-center justify-center gap-24 min-h-screen">
      <div className="flex shrink-0 flex-col items-center justify-center gap-3">
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
      {
        isClient && (typeof window !== "undefined") &&
        <MainButton text="Authorize app" onClick={() => {
          console.log(WebApp.initData, ":::Init data");
          WebApp.showPopup({ title: "User init data", message: WebApp.initData }, (id) => console.log("Dialog ID", id));
        }} />
      }
    </main>
  );
}
