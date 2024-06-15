"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Overview from "@/components/dashboard/Overview";
import PlannedTask from "@/components/dashboard/PlannedTask";
import Status from "@/components/dashboard/Status";
import ClaimXP from "@/components/dashboard/task/ClaimXP";
import TwitterProfile from "@/components/dashboard/TwitterProfile";
import Header from "@/components/Header";
import { useSession } from "@/lib/sessionContext";
import { useAction, useMutation, useQuery } from "convex/react";
import { ConvexError } from "convex/values";
import { HiMiniUserGroup } from "react-icons/hi2";

import type { Doc, Id } from "@acme/api/convex/_generated/dataModel";
import { api } from "@acme/api/convex/_generated/api";

export type EventType = Partial<Doc<"events">> & {
  company: Partial<Doc<"company">> & { logoUrl: string };
};

const Dashboard = () => {
  const session = useSession();
  const searchParams = useSearchParams();

  const userId = searchParams.get("userId");

  // Fetch users data
  const userDetail = useQuery(api.queries.getUserDetails, {
    userId: (session?.userId ?? userId) as Id<"user"> | undefined,
  });

  const claimReward = useMutation(api.mutations.claimRewards);
  const triggerMiner = useAction(api.mutations.triggerMining);

  // console.log(bottom, top, ":::Bottom Top, size", height, height - top);

  // handle tasks cycle
  const [isLoadingModalVisible, setLoadingModalVisible] = useState(false);
  const rewardTaskXpCount = useMutation(api.mutations.rewardTaskXp);
  const rewardEventXpCount = useMutation(api.mutations.rewardEventXp);
  const updateEventAction = useMutation(api.mutations.updateEventsForUser);
  const activateBoost = useMutation(api.mutations.activateBoost);

  // refLInk
  const [refLink, setRefLink] = useState<string>();

  useEffect(() => {
    if (userDetail) {
      console.log(userDetail?.mineHours, ":::Mine hours");
      setRefLink(
        process.env.NODE_ENV === "development"
          ? `http://localhost:3000?ref=${userDetail?.referralCode}`
          : `https://app.enetfoundation.com?ref=${userDetail?.referralCode}`,
      );
    }
  }, [userDetail]);

  return (
    <main className="container pb-10 pt-32">
      <Header nickname={userDetail?.nickname} />
      <Status
        mineRate={userDetail?.miningRate ?? 0}
        minedCount={userDetail?.minedCount ?? 0}
        mineHours={userDetail?.mineHours ?? 0}
        userId={userId}
        userDetail={userDetail}
      />
      <h3 className="mb-2 mt-7 text-base font-semibold">Overview</h3>
      <Overview
        rank={userDetail?.globalRank ?? 1000}
        referrals={userDetail?.referralCount ?? 16}
        users={0}
        referralCode={refLink ?? "gzrhjtw5"}
      />
      <div className="my-10">
        <Link
          href={
            userId
              ? `/dashboard/referral?userId=${userId}`
              : "/dashboard/referral"
          }
          className="referral-container"
        >
          <div className="rounded-lg bg-[#f5f5f5] p-3 dark:bg-[#23262D]">
            <HiMiniUserGroup className="text-4xl text-black dark:text-white" />
          </div>
          <div>
            <h3>Invite Friends</h3>
            <p className="text-base text-[#989898]">
              The more users you refer , the more $FOUND you earn
            </p>
          </div>
        </Link>
      </div>
      <PlannedTask userDetail={userDetail} userId={userId} />
      <TwitterProfile />
      {/* <ClaimXP /> */}
    </main>
  );
};

export default Dashboard;
