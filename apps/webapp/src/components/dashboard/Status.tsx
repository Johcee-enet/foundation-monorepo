"use client";

import { FC, useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { useSession } from "@/lib/sessionContext";
// import { useQuery } from "convex/react";
import { addHours, differenceInSeconds } from "date-fns";

// import { api } from "@acme/api/convex/_generated/api";
import { Doc } from "@acme/api/convex/_generated/dataModel";

import MiningStats from "./MiningStats";
import SocialStats from "./SocialStats";

const Status: FC<{
  minedCount: number;
  mineRate: number;
  mineHours: number;
  userId: string | null;
  userDetail: Doc<"user"> | null | undefined;
}> = ({ minedCount, mineRate, mineHours, userId, userDetail }) => {
  // const session = useSession();

  // const userDetail = useQuery(api.queries.getUserDetails, {
  //   userId: (session?.userId ?? userId) as Id<"user">,
  // });
  // Embeding
  // const [tweetEmbedHeight, setTweetEmbedHeight] = useState<number>();
  const [remaining, setRemaining] = useState<string>(formatTime(userDetail?.mineHours ?? 6));
  const [minedCountSec, setMinedCountSec] = useState<number>(0);

  useEffect(() => {
    if (
      !(userDetail?.mineActive ?? false) &&
      (userDetail?.redeemableCount ?? 0) > 0
    ) {
      // setClaimModalVisible(true);
    }
  }, [userDetail?.mineActive, userDetail?.redeemableCount, userDetail]);

  // countdown
  useEffect(() => {
    // Function to check if the countdown has ended

    if (userDetail && userDetail?.mineActive) {
      checkCountdown({
        startTime: userDetail.mineStartTime ?? Date.now(),
        countdownDuration: userDetail?.mineHours,
      });
      calculateMinedAmount(userDetail.miningRate, userDetail.mineStartTime as number);
    }


    function calculateMinedAmount(miningRate: number, startTime: number) {


      const elapsedSecs = differenceInSeconds(Date.now(), startTime);
      // console.log(elapsedSecs, ":::Elapsed seconds");
      const minedCountInASec = miningRate / 3600;
      // console.log(minedCountInASec, ":::Seconds mine count");
      const totalMinedCountSince = elapsedSecs * minedCountInASec;
      // console.log(totalMinedCountSince, ":::Total mined in seconds", totalMinedCountSince.toLocaleString('en-US', {minimumFractionDigits: 3, maximumFractionDigits: 3}));
      setMinedCountSec(totalMinedCountSince);

    }

    function checkCountdown({
      startTime,
      countdownDuration = 6,
    }: {
      startTime: number;
      countdownDuration: number;
    }) {
      // Set the start time of the countdown
      // const startTime = new Date();

      // Define the duration for the countdown (6 hours)
      // const countdownDuration = 6;

      // Calculate the end time for the countdown
      const endTime = addHours(startTime, countdownDuration);

      const currentTime = Date.now();
      const remainingTime = differenceInSeconds(endTime, currentTime);

      if (remainingTime <= 0) {
        // Perform the action here
      } else {
        // const formattedRemainingTime = formatDuration(
        //   { seconds: remainingTime },
        //   { format: ["hours", "minutes", "seconds"] },
        // );
        const hours = Math.floor(remainingTime / 3600);
        const minutes = Math.floor((remainingTime % 3600) / 60);
        const seconds = remainingTime % 60;

        // Check again after 1 second
        setTimeout(
          () => {
            if (userDetail) {
              checkCountdown({ startTime, countdownDuration });
              calculateMinedAmount(userDetail.miningRate, startTime);
            }
          },
          1000,
        );

        setRemaining(`${hours}h ${minutes}m ${seconds}s`);
        // setRemaining(formatTime(hours));
      }
    }


  }, [userDetail, remaining, minedCountSec, setMinedCountSec, userDetail?.mineActive, setRemaining]);

  return (
    <>
      <Tabs defaultValue="mining" className="drop-shadow-sm">
        <TabsList className="grid w-full grid-cols-2 p-0">
          <TabsTrigger value="mining" className="tabs-trigger">
            Mining
          </TabsTrigger>
          <TabsTrigger value="social" className="tabs-trigger">
            Social Xps
          </TabsTrigger>
        </TabsList>
        <TabsContent value="mining" className="tab-content">
          {/* props for mining stats info */}
          <MiningStats
            mined={Number(minedCount ?? 0)}
            mining={Number(minedCountSec ?? 6)}
            mineHours={Number(mineHours ?? 0)}
            time={remaining}
            rate={Number(mineRate ?? 0.25)}
            userId={userId}
            userDetail={userDetail}
          />
        </TabsContent>
        <TabsContent value="social" className="tab-content">
          {/* props for social stats info */}
          <SocialStats
            earned={userDetail?.xpCount ?? 0}
            claimed={userDetail?.claimedXp ?? 0}
            referral={userDetail?.referralXp ?? 0}
            multiplier={userDetail?.multiplier ?? 0}
          />
        </TabsContent>
      </Tabs>
    </>
  );
};

export default Status;


const formatTime = (hours: number): string => {

  const wholeHours = Math.floor(hours);

  // calculate the fractional part of the hour
  const fractionalHours = hours - wholeHours;
  const minutes = Math.floor(fractionalHours * 60);

  // Calculate the remaining fractional part and convert it to seconds
  const remainingFractionalMinutes = (fractionalHours * 60) - minutes;
  const seconds = Math.round(remainingFractionalMinutes * 60);

  // Format the result string
  return `${wholeHours}h ${minutes}m ${seconds}s`;

}
