"use client";

import { useEffect } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import WebApp from "@twa-dev/sdk";
import { MainButton } from "@twa-dev/sdk/react";
import { useClient } from "@/lib/mountContext";
import { Button } from "@/components/ui/button";
import { useAction } from "convex/react";
import { api } from "@acme/api/convex/_generated/api";

export default function Home() {
  const router = useRouter();
  const isClient = useClient();

  const linkTelegram = useAction(api.onboarding.linkTelegram);


  useEffect(() => {

    if(isClient) {
      WebApp.showPopup({message: "Link an existing account or create a new one with telegram user information", title: "Link/Create Account"}, (id) => {console.log(id, ":::Id of pop up")});
    }
    
  }, [isClient]);

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
        (
          <div className="flex w-full items-center justify-between">
            <Button onClick={() => router.push(`/authentication?type=tg&initData=${WebApp.initData}`)}>Link telegram</Button>  
            <Button variant="secondary" onClick={async () => {
              //> TODO: cerate user account with TG details
            }} >Create Account</Button>  
          </div>
        )
      }
    </main>
  );
}
