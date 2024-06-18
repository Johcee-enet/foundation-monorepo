"use client";

import React, { FC, Suspense, useEffect, useState } from "react";
import { Loader } from "@/components/loader";
import ReturnHeader from "@/components/ReturnHeader";
import { useSession } from "@/lib/sessionContext";
import { useQuery } from "convex/react";
import { BiRedo } from "react-icons/bi";
import { IoTelescopeOutline } from "react-icons/io5";

import { api } from "@acme/api/convex/_generated/api";
import { Doc, Id } from "@acme/api/convex/_generated/dataModel";

const History = () => {
  const session = useSession();
  const activities: Doc<"activity">[] | null | undefined = useQuery(
    api.queries.getHistory,
    {
      userId: session?.userId as Id<"user">,
    },
  );

  console.log(session, activities, ":::Session object");

  return (
    <main className="pt-32">
      <ReturnHeader page="history" push="/dashboard" />
      <div className="history-content">
        <h4 className="mb-4 text-lg">Today</h4>
        {
          typeof activities === "undefined" && <Loader color="white" />
        }
        {typeof activities !== "undefined" && <HistoryItem activities={activities} />}
      </div>
    </main>
  );
};

export default History;

const HistoryItem: FC<{ activities: Doc<"activity">[] | undefined }> = ({
  activities,
}) => {


  if (activities && activities.length === 0) {
    return (
      <span className="text-lg text-center my-auto mx-auto text-white">No recorded history yet</span>
    )
  }


  return (
    <ul className="space-y-2">
      {activities && activities.map((history, ki) => (
        <li className="history-event" key={ki}>
          <div className="flex items-start gap-3">
            <div
              className={`p-2 text-3xl ${history.type == "xp" && "bg-[#E2DEF0] text-[#5F37E6]"
                } ${history.type == "rank" && "bg-[#D5EEF0] text-[#14BBCC]"
                } w-fit rounded-md`}
            >
              {history.type == "xp" && <BiRedo />}
              {history.type == "rank" && <IoTelescopeOutline />}
            </div>
            <div className="max-w-64">
              <h3 className="text-lg font-medium">{history.message}</h3>
              <span className="text-base text-[#989898]">
                {new Date(history._creationTime).toLocaleDateString("en-US", {
                  //   hour: "2-digit",
                  //   minute: "2-digit",
                  dateStyle: "full",
                })}
              </span>
            </div>
          </div>
          {history.type == "xp" && (
            <h3 className="text-lg font-semibold">{history.extra} XP</h3>
          )}
        </li>
      ))}
    </ul>
  );
};
