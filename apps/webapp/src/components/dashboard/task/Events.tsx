"use client";

import { FC, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Event from "@/assets/eventimg.png";
import { Loader } from "@/components/loader";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { useToast } from "@/components/ui/use-toast";
import { useSession } from "@/lib/sessionContext";
import { delay, getErrorMsg } from "@/lib/utils";
import { useMutation, useQuery } from "convex/react";
import { Shovel } from "lucide-react";
import { BsGlobe } from "react-icons/bs";
import { FaDiscord, FaTelegramPlane } from "react-icons/fa";
import { FaCircleCheck, FaXTwitter } from "react-icons/fa6";
import { HiMiniUserGroup } from "react-icons/hi2";
import { IoIosArrowForward } from "react-icons/io";

import { api } from "@acme/api/convex/_generated/api";
import { Id } from "@acme/api/convex/_generated/dataModel";
import { rewardEventXp } from "@acme/api/convex/mutations";

import TaskCompleted from "../TaskCompleted";

const Events: FC<{ userId: string | null }> = ({ userId }) => {
  const session = useSession();
  const { toast } = useToast();

  // Get tasks and events
  const fetchEvents = useQuery(api.queries.fetchEvents, {
    userId: (session?.userId ?? userId) as Id<"user">,
  });

  const user = useQuery(api.queries.getUserDetails, {
    userId: (session?.userId ?? userId) as Id<"user">,
  });

  // Event interaction api functions
  const completeEvent = useMutation(api.mutations.rewardEventXp);
  const updateEventTaskStatus = useMutation(api.mutations.updateEventsForUser);

  // Loader controls
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div>
      <Dialog open={isLoading}>
        <DialogContent
          hideCloseBtn
          className="border-none bg-transparent shadow-none"
        >
          <Loader color="white" />
        </DialogContent>
      </Dialog>
      <ul className="grid gap-4">
        {fetchEvents &&
          fetchEvents.map((item, ki) => {
            const event = user?.eventsJoined?.find(
              (joined) => joined?.eventId === item?._id,
            );

            return (
              <EventItem
                item={item}
                event={event}
                key={ki}
                setIsLoading={setIsLoading}
                ki={ki}
                userId={(user?._id ?? userId) as string}
                updateEventTaskStatus={updateEventTaskStatus}
                completeEvent={completeEvent}
              />
            );
          })}
      </ul>
      {fetchEvents && !fetchEvents?.length && (
        <p className="text-center text-lg font-medium text-black dark:text-white">
          There are no events at this time, check back later
        </p>
      )}
    </div>
  );
};

const EventItem: FC<{
  item: any;
  event: any;
  setIsLoading: any;
  ki: number;
  userId: string;
  updateEventTaskStatus: any;
  completeEvent: any;
}> = ({
  item,
  event,
  setIsLoading,
  ki,
  userId,
  updateEventTaskStatus,
  completeEvent,
}) => {
  // drawer controls
  const [drawerOpen, setDrawerOpen] = useState(false);
  // completed dialog controls
  const [showCompletedDialog, setShowCompletedDialog] = useState(false);
  const { toast } = useToast();

  return (
    <li key={ki} className="task-list">
      <Drawer open={drawerOpen} onOpenChange={(open) => setDrawerOpen(open)}>
        <DrawerTrigger asChild>
          <button
            className={`w-full px-5 py-4 ${
              event?.completed ? "opacity-30" : ""
            } block space-y-2`}
            onClick={(e) => {
              console.log(":::Dialog trigger clicked");
              setDrawerOpen(true);
              // if (event) {
              //   e.preventDefault();
              // }
            }}
          >
            <div className="flex w-full items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="icon-container rounded-md border border-white/20 p-1">
                  <img
                    src={item?.company?.logoUrl}
                    width={"100%"}
                    height={"100%"}
                    alt="Company logo"
                    className="rounded-sm"
                  />
                </div>
                <div className="text-left">
                  <h4 className="text-[22px] font-semibold">{item?.title}</h4>
                </div>
              </div>
              <div>
                {!event?.completed && (
                  <IoIosArrowForward className="text-xl text-black dark:text-white" />
                )}
              </div>{" "}
            </div>
            <div className="text-left">
              <p className="background inline-block rounded-full px-2 py-1 text-lg font-semibold text-[#767676]">
                {event?.completed ? (
                  "Completed"
                ) : (
                  <span>
                    +
                    {Number(item?.reward ?? 0).toLocaleString("en-US", {
                      maximumFractionDigits: 2,
                      minimumFractionDigits: 2,
                    })}{" "}
                    XP
                  </span>
                )}
              </p>
            </div>
          </button>
        </DrawerTrigger>

        <DrawerContent className="foreground large-screen pb-4">
          <div className="mx-auto h-fit max-h-[85vh] w-full overflow-y-auto px-5">
            <DrawerHeader className="h-auto">
              {/* {!item?.company?.logoUrl && ( */}
              {/* <DrawerTitle className="max-h-16 w-full"> */}
              <div className="relative">
                <img
                  src={item?.company?.logoUrl}
                  sizes="100%"
                  alt="event"
                  className="absolute left-2 top-2 h-14 w-14 rounded-md"
                />
                <img
                  src={item?.coverUrl!}
                  sizes="100%"
                  alt="cover-img"
                  className="rounded-lg"
                />
              </div>
              {/* </DrawerTitle> */}
              {/* )} */}

              <DrawerDescription className="flex items-center justify-between pt-2 text-black dark:text-white">
                <h2 className="text-2xl font-semibold text-white">
                  {item?.title}
                </h2>{" "}
                <span className="text-bold rounded-2xl bg-[#D9D9D9] px-4 py-1 text-[#767676]">
                  {Number(item?.reward ?? 0).toLocaleString("en-US", {
                    maximumFractionDigits: 2,
                    minimumFractionDigits: 2,
                  })}{" "}
                  XP
                </span>
              </DrawerDescription>
              <p className="text-left text-black dark:text-[#989898]">
                {item?.description}
              </p>
            </DrawerHeader>
            <div className="p-4 pb-0">
              <ul className="grid gap-5">
                {item?.actions?.map((action: any, idx: number) => {
                  const completedAction = event?.actions?.find(
                    (val: any) => val?.name === action?.name,
                  );

                  return (
                    <li key={idx}>
                      <Link
                        href={action?.link}
                        target="_blank"
                        className={`flex items-center justify-between py-2 ${
                          completedAction?.completed && "opacity-30"
                        }`}
                        onClick={async (e) => {
                          if (completedAction?.completed) {
                            e.preventDefault();
                          } else {
                            await delay(5);
                            await updateEventTaskStatus({
                              userId: userId as Id<"user">,
                              eventId: item?._id,
                              actionName: action?.name!,
                            });
                          }
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <div className="icon-container">
                            {/* Can be replaced with an image tag if image is to be rendered instead */}
                            {action.channel == "website" && <BsGlobe />}
                            {/* {action.channel == "invite" && <HiMiniUserGroup />} */}
                            {action.channel == "twitter" && <FaXTwitter />}
                            {action.channel == "discord" && <FaDiscord />}
                            {action.channel == "telegram" && (
                              <FaTelegramPlane />
                            )}
                          </div>
                          <div>
                            <h4 className="text-lg font-semibold">
                              {action.name}
                            </h4>
                          </div>
                        </div>
                        <div className="text-2xl">
                          {!completedAction?.completed ? (
                            <IoIosArrowForward className="text-black dark:text-white" />
                          ) : (
                            <FaCircleCheck className="text-black dark:text-white" />
                          )}
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
            <DrawerFooter>
              {/* Close event Drawer sheet and complete event if all tasks are completed */}
              {/* <DrawerClose asChild> */}
              <button
                className="block rounded-xl bg-black p-6 text-xl font-medium text-white dark:bg-white dark:text-black"
                onClick={async () => {
                  try {
                    setIsLoading(true);

                    if (event?.completed) {
                      setIsLoading(false);
                      setDrawerOpen(false);
                      toast({
                        title: "All tasks in event has been completed!",
                      });
                    } else {
                      await completeEvent({
                        userId: userId as Id<"user">,
                        eventId: item?._id,
                        xpCount: item?.reward,
                      });
                      setIsLoading(false);
                      setShowCompletedDialog(true);
                    }
                  } catch (err: any) {
                    setIsLoading(false);
                    console.log(err, ":::OnEventComplete_error");
                    const errMsg = getErrorMsg(err);
                    setShowCompletedDialog(false);
                    toast({
                      title: errMsg,
                    });
                  }
                }}
              >
                Completed
              </button>
              <TaskCompleted
                showCompletedDialog={showCompletedDialog}
                setShowCompletedDialog={setShowCompletedDialog}
                setDrawerOpen={setDrawerOpen}
                reward={item?.reward}
              />
              {/* </DrawerClose> */}
            </DrawerFooter>
          </div>
        </DrawerContent>
      </Drawer>
    </li>
  );
};

export default Events;
