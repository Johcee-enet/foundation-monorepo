import React, { FC } from "react";
import { useSession } from "@/lib/sessionContext";
import { useAction, useMutation, useQuery } from "convex/react";
import { BiCoinStack } from "react-icons/bi";

import { api } from "@acme/api/convex/_generated/api";
import { Id } from "@acme/api/convex/_generated/dataModel";

import { Button } from "../ui/button";
import { useToast } from "../ui/use-toast";

type Mining = {
  mined: number;
  mining: number;
  mineHours: number;
  time: string;
  rate: number;
  userId: string | null;
};

const MiningStats: FC<Mining> = ({ mined, mining, mineHours, time, rate, userId }) => {
  const { toast } = useToast();
  const session = useSession();

  // Call start miner function
  const triggerMiner = useAction(api.mutations.triggerMining);
  // claim mine reward
  const claimReward = useMutation(api.mutations.claimRewards);

  const userDetail = useQuery(api.queries.getUserDetails, {
    userId: (session?.userId ?? userId) as Id<"user"> | undefined,
  });

  return (
    <div className="mining-stats">
      <h3 className="text-lg">
        $FOUND Mined: <span>{mined}</span>
      </h3>
      <p>Mining: {mining.toFixed(4)}</p>
      <p>{time}</p>
      <div>
        <div className="tag">
          Mining rate : <span className="font-normal">{rate} FOUND/hr</span>
        </div>
        {!userDetail?.redeemableCount && !userDetail?.mineActive && (
          <Button
            className={`tag gap-2`}
            style={{
              backgroundColor: userDetail?.mineActive ? "white" : "black",
              color: userDetail?.mineActive ? "black" : "white",
            }}
            onClick={async () => {
              if (!userDetail?.mineActive) {
                await triggerMiner({
                  userId: (session?.userId ?? userId) as Id<"user">,
                });
              } else {
                return toast({
                  title: "There is a mining session currently active",
                });
              }
            }}
          >
            {!userDetail?.mineActive && (
              <>
                Start Mining <BiCoinStack className="shrink-0" />
              </>
            )}
          </Button>
        )}
        {userDetail?.mineActive && !userDetail?.redeemableCount && (
          <Button
            className="h-fit gap-2 bg-white py-4 text-black"
            // disabled
            onClick={() => {
              toast({
                title: "There is a mining session currently active",
              });
            }}
          >
            <span className="text-black">Mining Active</span>{" "}
            <BiCoinStack className="shrink-0" color="black" />
          </Button>
        )}
        {!!userDetail?.redeemableCount && !userDetail?.mineActive && (
          <Button
            className={`tag h-fit gap-2 py-4`}
            style={{
              backgroundColor: userDetail?.redeemableCount ? "white" : "black",
              color: userDetail?.redeemableCount ? "black" : "white",
            }}
            onClick={async () => {
              if (!userDetail?.mineActive) {
                await claimReward({
                  userId: (session?.userId ?? userId) as Id<"user">,
                });
                toast({
                  title: "Mine reward successfully claimed!",
                });
              } else {
                toast({ title: "Mining is still ongoing" });
              }
            }}
          >
            Claim $FOUND {userDetail?.redeemableCount ?? 0}{" "}
            <BiCoinStack className="shrink-0" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default MiningStats;
