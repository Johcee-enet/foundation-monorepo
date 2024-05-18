"use client";

import Image from "next/image";
import Link from "next/link";
import Event from "@/assets/eventimg.png";
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
import { useSession } from "@/lib/sessionContext";
import { useQuery } from "convex/react";
import { BsGlobe } from "react-icons/bs";
import { FaDiscord, FaTelegramPlane } from "react-icons/fa";
import { FaCircleCheck, FaXTwitter } from "react-icons/fa6";
import { HiMiniUserGroup } from "react-icons/hi2";
import { IoIosArrowForward } from "react-icons/io";

import { api } from "@acme/api/convex/_generated/api";
import { Id } from "@acme/api/convex/_generated/dataModel";

import TaskCompleted from "../TaskCompleted";

const Events = () => {
  const session = useSession();

  // Get tasks and events
  const fetchEvents = useQuery(api.queries.fetchEvents, {
    userId: session?.userId as Id<"user">,
  });

  const user = useQuery(api.queries.getUserDetails, {
    userId: session?.userId as Id<"user">,
  });

  return (
    <div>
      <ul className="grid gap-4">
        {fetchEvents &&
          fetchEvents.map((item, ki) => {
            const completedEvent = user?.eventsJoined?.find(
              (joined) => joined?.eventId === item?._id,
            );

            return (
              <li key={ki} className="task-list">
                <Drawer>
                  <DrawerTrigger asChild>
                    <button
                      className={`w-full px-5 py-4 ${
                        completedEvent ? "opacity-30" : ""
                      } block space-y-2`}
                      onClick={(e) => {
                        if (completedEvent) {
                          e.preventDefault();
                        }
                      }}
                    >
                      <div className="flex w-full items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="icon-container">
                            {/* {item.type == "invite" && !items.completed && (
                          <HiMiniUserGroup />
                        )}
                        {items.type == "twitter" && !items.completed && (
                          <FaXTwitter />
                        )}
                        {items.type == "discord" && !items.completed && (
                          <FaDiscord />
                        )}
                        {items.type == "telegram" && !items.completed && (
                          <FaTelegramPlane />
                        )}
                        {items.completed && <FaCircleCheck />} */}

                            <Image
                              src={item?.company?.logoUrl}
                              alt="Company logo"
                              className="h-6 w-6"
                            />
                          </div>
                          <div className="text-left">
                            <h4 className="text-[22px] font-semibold">
                              {item?.title}
                            </h4>
                          </div>
                        </div>
                        <div>
                          {!completedEvent && (
                            <IoIosArrowForward className="text-xl text-black dark:text-white" />
                          )}
                        </div>{" "}
                      </div>
                      <div className="text-left">
                        <p className="background inline-block rounded-full px-2 py-1 text-lg font-semibold text-[#767676]">
                          {completedEvent ? (
                            "Completed"
                          ) : (
                            <span>
                              +
                              {Number(item?.reward ?? 0).toLocaleString(
                                "en-US",
                                {
                                  maximumFractionDigits: 2,
                                  minimumFractionDigits: 2,
                                },
                              )}{" "}
                              XP
                            </span>
                          )}
                        </p>
                      </div>
                    </button>
                  </DrawerTrigger>

                  <DrawerContent className="foreground large-screen pb-4">
                    <div className="mx-auto h-fit max-h-[85vh] w-full overflow-y-auto px-5">
                      <DrawerHeader>
                        {item?.company?.logoUrl && (
                          <DrawerTitle className="relative h-52 ">
                            <Image
                              src={item?.company?.logoUrl}
                              fill={true}
                              sizes="100%"
                              alt="event"
                            />
                          </DrawerTitle>
                        )}

                        <DrawerDescription className="flex items-center justify-between pt-2 text-black dark:text-white">
                          <h2 className="text-xl font-semibold">
                            Enetecosystem
                          </h2>{" "}
                          <span className="text-base text-[#989898]">
                            Reward:{" "}
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
                          {item?.actions?.map((action, idx) => {
                            const completedAction =
                              completedEvent?.actions?.find(
                                (val) => val?.name === action?.name,
                              );

                            return (
                              <li key={idx}>
                                <Link
                                  href={action?.link}
                                  target="_blank"
                                  className={`flex items-center justify-between py-2 ${
                                    completedAction?.completed && "opacity-30"
                                  }`}
                                  onClick={(e) => {
                                    if (completedAction?.completed) {
                                      e.preventDefault();
                                    }
                                  }}
                                >
                                  <div className="flex items-center gap-3">
                                    <div className="icon-container">
                                      {/* Can be replaced with an image tag if image is to be rendered instead */}
                                      {action.channel == "website" && (
                                        <BsGlobe />
                                      )}
                                      {/* {action.channel == "invite" && <HiMiniUserGroup />} */}
                                      {action.channel == "twitter" && (
                                        <FaXTwitter />
                                      )}
                                      {action.channel == "discord" && (
                                        <FaDiscord />
                                      )}
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
                        <DrawerClose asChild>
                          <TaskCompleted reward={item?.reward} />
                        </DrawerClose>
                      </DrawerFooter>
                    </div>
                  </DrawerContent>
                </Drawer>
              </li>
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

export default Events;

const ecosystemTaskList = [
  {
    name: "Join Discord",
    reward: 2000,
    link: "https://discord.gg/RQqVWPxuwq",
    type: "discord",
    completed: false,
    details: {
      image: Event,
      title: "Enetecosystem",
      reward: 100000,
      description:
        "E•network/Enetecosystem is a web3 company delivering an extensive array of infrastructural products and technology solutions",
      tasks: [
        {
          task: "Visit Website",
          type: "website",
          completed: true,
        },
        {
          task: "Follow On X (Twitter)",
          type: "twitter",
          completed: true,
        },
        {
          task: "Join Telegram",
          type: "telegram",
          completed: false,
        },
        {
          task: "Join Telegram Channel",
          type: "telegram",
          completed: false,
        },
        {
          task: "Join Discord",
          type: "discord",
          completed: false,
        },
      ],
    },
  },

  {
    name: "Join Telegram Channel",
    reward: 2000,
    link: "https://t.me/enetecosystem",
    type: "telegram",
    completed: false,
  },
  {
    name: "Invite 10 Friends",
    reward: 10000,
    link: "/",
    type: "invite",
    completed: false,
  },
  {
    name: "Join Telegram",
    reward: 2000,
    link: "https://t.me/enetworkchannel",
    type: "telegram",
    completed: false,
  },
  {
    name: "Follow On X(Twitter)",
    reward: 2000,
    link: "https://twitter.com/Enetecosystem",
    type: "twitter",
    completed: true,
  },
];