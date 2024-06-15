import React, { useEffect, useState } from "react";
import Image from "next/image";
import Vector from "@/assets/Vector.svg";
import { useSession } from "@/lib/sessionContext";
import { useMutation, useQuery } from "convex/react";
import { PiTrendDownLight } from "react-icons/pi";

import { api } from "@acme/api/convex/_generated/api";
import { Doc, Id } from "@acme/api/convex/_generated/dataModel";

type TogglerSystem = {
  toggleru: boolean;
  userId: string | null;
  userDetail: Doc<"user"> | null | undefined;
 };

const Multiplier = (props: TogglerSystem) => {
  const session = useSession();
  const userDetails = props.userDetail;
  const [multipliers, setMultipliers] = useState([
    {
      value: 500000,
      percent: 5,
      achieved: false,
    },
    {
      value: 1000000,
      percent: 10,
      achieved: false,
    },
    {
      value: 10000000,
      percent: 15,
      achieved: false,
    },
    {
      value: 50000000,
      percent: 20,
      achieved: false,
    },
    {
      value: 100000000,
      percent: 25,
      achieved: false,
    },
  ]);

  useEffect(() => {
    if (userDetails?.multiplier) {
      if (userDetails?.multiplier === 5) {
        setMultipliers([
          {
            value: 500000,
            percent: 5,
            achieved: true,
          },
          {
            value: 1000000,
            percent: 10,
            achieved: false,
          },
          {
            value: 10000000,
            percent: 15,
            achieved: false,
          },
          {
            value: 50000000,
            percent: 20,
            achieved: false,
          },
          {
            value: 100000000,
            percent: 25,
            achieved: false,
          },
        ]);
      } else if (userDetails?.multiplier === 10) {
        setMultipliers([
          {
            value: 500000,
            percent: 5,
            achieved: true,
          },
          {
            value: 1000000,
            percent: 10,
            achieved: true,
          },
          {
            value: 10000000,
            percent: 15,
            achieved: false,
          },
          {
            value: 50000000,
            percent: 20,
            achieved: false,
          },
          {
            value: 100000000,
            percent: 25,
            achieved: false,
          },
        ]);
      } else if (userDetails?.multiplier === 15) {
        setMultipliers([
          {
            value: 500000,
            percent: 5,
            achieved: true,
          },
          {
            value: 1000000,
            percent: 10,
            achieved: true,
          },
          {
            value: 10000000,
            percent: 15,
            achieved: true,
          },
          {
            value: 50000000,
            percent: 20,
            achieved: false,
          },
          {
            value: 100000000,
            percent: 25,
            achieved: false,
          },
        ]);
      } else if (userDetails?.multiplier === 20) {
        setMultipliers([
          {
            value: 500000,
            percent: 5,
            achieved: true,
          },
          {
            value: 1000000,
            percent: 10,
            achieved: true,
          },
          {
            value: 10000000,
            percent: 15,
            achieved: true,
          },
          {
            value: 50000000,
            percent: 20,
            achieved: true,
          },
          {
            value: 100000000,
            percent: 25,
            achieved: false,
          },
        ]);
      } else if (userDetails?.multiplier === 25) {
        setMultipliers([
          {
            value: 500000,
            percent: 5,
            achieved: true,
          },
          {
            value: 1000000,
            percent: 10,
            achieved: true,
          },
          {
            value: 10000000,
            percent: 15,
            achieved: true,
          },
          {
            value: 50000000,
            percent: 20,
            achieved: true,
          },
          {
            value: 100000000,
            percent: 25,
            achieved: true,
          },
        ]);
      } else {
        setMultipliers([
          {
            value: 500000,
            percent: 5,
            achieved: false,
          },
          {
            value: 1000000,
            percent: 10,
            achieved: false,
          },
          {
            value: 10000000,
            percent: 15,
            achieved: false,
          },
          {
            value: 50000000,
            percent: 20,
            achieved: false,
          },
          {
            value: 100000000,
            percent: 25,
            achieved: false,
          },
        ]);
      }
    } else {
      setMultipliers([
        {
          value: 500000,
          percent: 5,
          achieved: false,
        },
        {
          value: 1000000,
          percent: 10,
          achieved: false,
        },
        {
          value: 10000000,
          percent: 15,
          achieved: false,
        },
        {
          value: 50000000,
          percent: 20,
          achieved: false,
        },
        {
          value: 100000000,
          percent: 25,
          achieved: false,
        },
      ]);
    }
  }, [userDetails]);

  return (
    <div
      className={` mx-auto my-3 max-w-lg ${props.toggleru ? "block" : "hidden"} flex items-center gap-4 overflow-y-scroll px-5 pb-5`}
    >
      {multipliers.map((items, idx) => (
        <div
          key={idx}
          className={`h-48 w-36 ${items.achieved ? " " : "opacity-20"} relative flex shrink-0 items-center justify-center object-contain text-[11px] text-white`}
        >
          <Image src={Vector} alt="multiplier" fill={true} sizes="100%" />
          <div className="relative z-10 text-center font-semibold">
            <p>
              {Number(items.value).toLocaleString("en-US", {
                maximumFractionDigits: 0,
                minimumFractionDigits: 0,
              })}
            </p>
            <p>XP</p>
            <span className="text-sm text-[#18EAFF]">+{items.percent}%</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Multiplier;
