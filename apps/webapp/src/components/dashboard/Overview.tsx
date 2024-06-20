"use client";

import React from "react";
import Link from "next/link";
import { useToast } from "@/components/ui/use-toast";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { BsCopy } from "react-icons/bs";
import { FaTrophy } from "react-icons/fa6";
import { HiMiniUserGroup } from "react-icons/hi2";

type OverviewContent = {
  users: number;
  referrals: number;
  rank: number;
  referralCode: string;
};

const Overview = (props: OverviewContent) => {
  const { toast } = useToast();

  return (
    <div className="overview-container">
      <div className="flex items-center justify-start">
        <div className="rounded-md bg-white/15 p-2 text-xl text-white">
          <FaTrophy />
        </div>
        {/*<Link href="/dashboard/leaderboard">
          {" "}
          <div className="flex items-center gap-2 text-xl font-semibold text-[#ABABAB]">
            <HiMiniUserGroup />
            {props.users}
          </div>
        </Link>*/}
      </div>
      <div className="mt-2 flex h-full flex-col px-10">
        <div className="grid grid-cols-2">
          <div>
            <span className="text-lg text-[#ABABAB]">Referrals</span>
            <h2 className="mt-1 text-4xl text-white">{props.referrals}</h2>
          </div>
          <div>
            <span className="text-lg text-[#ABABAB]">Global Rank</span>
            <h2 className="mt-1 text-4xl text-white flex items-center">{props.rank}{props.rank >= 50 ? '+' : null}</h2>
          </div>
        </div>
        <CopyToClipboard
          text={props.referralCode}
          onCopy={() => {
            toast({
              title: "Referral Code: " + props.referralCode,
              description: "You have successfully copied your referral code",
            });
          }}
        >
          <button className="mt-auto flex items-center gap-1 text-left text-base text-white w-full">
            <span className="shrink-0">Referral Link:</span>{" "}
            <span className="truncate text-ellipsis flex items-center">{props.referralCode}</span>
            <BsCopy  />
          </button>
        </CopyToClipboard>
      </div>
    </div>
  );
};

export default Overview;
