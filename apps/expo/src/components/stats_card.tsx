import type { FC } from "react";
import { useEffect, useState } from "react";
import { Text, View } from "react-native";
import { ImageBackground } from "expo-image";
import { useQuery } from "convex/react";
import { addHours, differenceInSeconds, format } from "date-fns";

import { api } from "@acme/api/convex/_generated/api";
import { Doc } from "@acme/api/convex/_generated/dataModel";

// import ClaimModal from "@/components/claim_modal";
// import LinearGradient from "react-native-linear-gradient";
// import { useMutation } from "convex/react";
// import { api } from "@acme/api/src/convex/_generated/api";
// import { useLocalSearchParams } from "expo-router";

// import type { Id } from "@acme/api/src/convex/_generated/dataModel";

interface IStatsCardProps {
  minedCount: number;
  miningRate: number;
  xpEarned: number;
  redeemableCount: number;
  userDetail: Doc<"user"> | null | undefined;
}
export const StatsCard: FC<IStatsCardProps> = ({
  minedCount,
  miningRate,
  xpEarned,
  redeemableCount,
  userDetail,
}) => {
  // const params = useLocalSearchParams();

  const appConfig = useQuery(api.queries.getAppConfigForApp);

  const [remaining, setRemaining] = useState<string>(
    formatTime(userDetail?.mineHours ?? 6),
  );
  const [minedCountSec, setMinedCountSec] = useState<number>(0);

  useEffect(() => {
    // Function to check if the countdown has ended

    if (userDetail && userDetail?.mineActive) {
      checkCountdown({
        startTime: userDetail.mineStartTime ?? Date.now(),
        countdownDuration: userDetail?.mineHours,
      });
      calculateMinedAmount(
        userDetail.miningRate,
        userDetail.mineStartTime as number,
      );
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
        setTimeout(() => {
          if (userDetail) {
            checkCountdown({ startTime, countdownDuration });
            calculateMinedAmount(userDetail.miningRate, startTime);
          }
        }, 1000);

        setRemaining(`${hours}h ${minutes}m ${seconds}s`);
        // setRemaining(formatTime(hours));
      }
    }
  }, [
    userDetail,
    remaining,
    minedCountSec,
    setMinedCountSec,
    userDetail?.mineActive,
    setRemaining,
  ]);

  return (
    <ImageBackground
      source={require("../../assets/main/stats-bg.png")}
      style={{
        justifyContent: "center",
        height: 171,
        width: "100%",
        backgroundColor: "#EBEBEB",
        borderRadius: 20,
        marginTop: 15,
      }}
      contentFit="contain"
      contentPosition="center"
      // className="bg-contain bg-center bg-no-repeat"
    >
      {/* States design */}
      <View className="flex h-full w-full flex-col items-start justify-end p-4">
        <View
          style={{ marginHorizontal: 40, marginBottom: 5 }}
          className="flex flex-row items-start justify-center gap-2"
        >
          <View className="flex flex-col items-start justify-center">
            <Text className="font-[nunito] text-lg font-light text-[#989898]">
              $FOUND Mined
            </Text>
            <Text className="font-[nunito] text-2xl font-bold text-black">
              {minedCount.toLocaleString("en-US", {
                maximumFractionDigits: 2,
                minimumFractionDigits: 2,
              })}
            </Text>
            <Text className="font-[nunito] text-lg font-light text-[#989898]">
              Mining:
            </Text>
            <Text className="font-[nunito] text-2xl font-bold text-black">
              {minedCountSec.toFixed(4)}
            </Text>

            {/* <Text className="font-[nunito] text-lg font-normal text-[#989898]">
              {redeemableCount}
            </Text> */}
          </View>
          <View style={{ marginHorizontal: 15 }} />
          <View className="flex flex-col items-start justify-center">
            <Text className="font-[nunito] text-lg font-light text-[#989898]">
              XP Earned
            </Text>
            <Text className="font-[nunito] text-2xl font-bold text-black">
              {xpEarned.toLocaleString("en-US", {
                maximumFractionDigits: 2,
                minimumFractionDigits: 2,
              })}
            </Text>
            <Text className="font-[nunito] text-lg font-light text-[#989898]">
              Countdown:
            </Text>
            <Text className="font-[nunito] text-2xl font-bold text-black">
              {remaining}
            </Text>
            {/* <Text className="font-[nunito] text-lg font-normal text-[#989898] opacity-0">
              0
            </Text> */}
          </View>
        </View>

        <View className="my-2" />
        <View className="rounded-lg bg-black px-4 py-2">
          <Text className="text-start font-[nunito] font-normal text-white">
            Mining rate: {miningRate} FOUND/hr
          </Text>
        </View>
      </View>
    </ImageBackground>
  );
};

const formatTime = (hours: number): string => {
  const wholeHours = Math.floor(hours);

  // calculate the fractional part of the hour
  const fractionalHours = hours - wholeHours;
  const minutes = Math.floor(fractionalHours * 60);

  // Calculate the remaining fractional part and convert it to seconds
  const remainingFractionalMinutes = fractionalHours * 60 - minutes;
  const seconds = Math.round(remainingFractionalMinutes * 60);

  // Format the result string
  return `${wholeHours}h ${minutes}m ${seconds}s`;
};
