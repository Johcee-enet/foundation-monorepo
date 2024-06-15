"use client";

import { FC, useState } from "react";
import Multiplier from "@/components/dashboard/Multiplier";
import Boost from "@/components/dashboard/task/Boost";
import Events from "@/components/dashboard/task/Events";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BiCoinStack } from "react-icons/bi";
import { FaChevronUp } from "react-icons/fa6";
import { RiArrowRightDoubleLine } from "react-icons/ri";
import { TiFlash } from "react-icons/ti";

import Tasks from "./task/Tasks";
import { Doc } from "@acme/api/convex/_generated/dataModel";

const PlannedTask: FC<{ userId: string | null, userDetail: Doc<"user"> | null | undefined }> = ({ userId, userDetail }) => {
  const [showMultiplier, setShowMultiplier] = useState(false);
  return (
    <Tabs defaultValue="socialXps" className="drop-shadow-sm">
      <div className="tasktab-container">
        <TabsList className="tasktab-container-tabcontroller">
          <TabsTrigger
            value="socialXps"
            className="tasktab-container-tabcontroller-tab data-[state=active]:bg-[#131721] data-[state=active]:text-white data-[state=active]:dark:text-white"
          >
            <BiCoinStack className="shrink-0 text-lg" />
            Tasks
          </TabsTrigger>
          <TabsTrigger
            value="events"
            className="tasktab-container-tabcontroller-tab data-[state=active]:bg-[#131721] data-[state=active]:text-white data-[state=active]:dark:text-white"
          >
            <RiArrowRightDoubleLine className="shrink-0 text-lg" />
            Events
          </TabsTrigger>
          <TabsTrigger
            value="boost"
            className="tasktab-container-tabcontroller-tab data-[state=active]:bg-[#131721] data-[state=active]:text-white data-[state=active]:dark:text-white"
          >
            <TiFlash className="shrink-0 text-lg" />
            Boosts
          </TabsTrigger>
        </TabsList>
        <Button
          className="mx-auto flex h-fit w-fit items-center gap-2 py-3 text-lg"
          onClick={() => setShowMultiplier(!showMultiplier)}
        >
          Multiplier{" "}
          <FaChevronUp
            className={`transition-all ${!showMultiplier && "rotate-180"} duration-300 ease-linear`}
          />
        </Button>
      </div>
      <Multiplier userDetail={userDetail} toggleru={showMultiplier} userId={userId} />
      <TabsContent value="socialXps" className="tasktab-container-content">
        <Tasks userId={userId} />
      </TabsContent>
      <TabsContent value="events" className="tasktab-container-content">
        <Events userId={userId} />
      </TabsContent>
      <TabsContent value="boost" className="tasktab-container-content">
        <Boost userId={userId} />
      </TabsContent>
    </Tabs>
  );
};

export default PlannedTask;
