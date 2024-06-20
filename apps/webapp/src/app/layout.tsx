import { Plus_Jakarta_Sans as FontSans } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Analytics } from "@vercel/analytics/react";


import "./globals.css";

import type { Viewport } from "next";
import ConvexClientProvider from "@/app/ConvexClientProvider";
import { Toaster } from "@/components/ui/toaster";
import SessionProvider from "@/lib/sessionContext";
import Script from "next/script";
import { cn } from "@/lib/utils";
import { MountCtxProvider } from "@/lib/mountContext";
import { Telegram } from "@twa-dev/types";


declare global {
  interface Window {
    Telegram: Telegram;
  }
}


const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata = {
  title: "Foundation || A New Web3 Experience",
  description:
    "Foundation is designed to usher newcomers into the dynamic world of Web3. With an emphasis on web3 education, practical experience and Campaigns",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 0.7,
  userScalable: true,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6929781309402895" crossOrigin="anonymous"></script>
        <script async src="https://telegram.org/js/telegram-web-app.js"></script>
      </head>
      <body
        className={cn(
          "background min-h-screen font-sans antialiased",
          fontSans.variable,
        )}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <ConvexClientProvider>
            <MountCtxProvider>
              <SessionProvider>{children}</SessionProvider>
            </MountCtxProvider>
          </ConvexClientProvider>
          <Toaster />
        </ThemeProvider>
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
