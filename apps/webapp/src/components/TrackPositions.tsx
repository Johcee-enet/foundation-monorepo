import React, { FC } from "react";
import Image from "next/image";
import { FaCrown } from "react-icons/fa";

const TrackPositions: FC<{
  leaderBoards: Record<string, any> | null | undefined;
}> = ({ leaderBoards }) => {
  const sortedRank = leaderBoards?.sortedUsers;
  return (
    <>
      <ul className="my-5  space-y-5">
        {sortedRank &&
          sortedRank.map(
            (ranking: any, idx: number) =>
              idx <= 2 && (
                <li className="flex items-center gap-2" key={idx}>
                  <div
                    className={`flex items-center justify-between ${
                      idx == 0 && "w-[65%] bg-[#268f9b]"
                    } ${idx == 1 && "w-[55%] bg-[#5F37E6]"} ${idx == 2 && "w-[45%] bg-black"} rounded-r-3xl p-2 pl-3`}
                  >
                    <div className="flex items-center">
                      <span className="flex items-center gap-2 text-base font-bold text-white">
                        <FaCrown
                          className={`text-base ${idx == 0 && "text-[#F79E1B]"} ${idx == 1 && "text-[#C0C0C0]"} ${idx == 2 && "text-[#9c6630]"}`}
                        />
                      </span>
                      <span className="ml-3 text-lg font-semibold text-white">
                        {Number(ranking?.referralCount ?? 0).toLocaleString(
                          "en-US",
                          {
                            maximumFractionDigits: 0,
                            minimumFractionDigits: 0,
                          },
                        )}
                      </span>
                    </div>
                    <Image
                      src="/user.png"
                      alt="profile"
                      width={50}
                      height={50}
                      className="rounded-full border-2 border-white "
                    />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold">
                      {ranking?.nickname}
                    </h2>
                    <p className="text-base text-[#767676]">
                      {Number(ranking?.xpCount).toLocaleString("en-US", {
                        maximumFractionDigits: 2,
                        minimumFractionDigits: 2,
                      })}{" "}
                      XP
                    </p>
                  </div>
                </li>
              ),
          )}
      </ul>
      <div className="other-positions">
        <p>User</p>
        <p>Global Rank</p>
      </div>
      <ul className="container space-y-3">
        {sortedRank &&
          sortedRank.map(
            (ranking: any, idx: number) =>
              idx >= 3 && (
                <li
                  key={idx}
                  className="flex items-center justify-between py-2"
                >
                  <div className="flex items-center gap-3">
                    <Image
                      src="/user.png"
                      alt="profile"
                      width={50}
                      height={50}
                      className="rounded-full border-2 border-white "
                    />
                    <div>
                      <h2 className="mb-1 text-lg font-semibold text-black dark:text-white">
                        @{ranking?.nickname}
                      </h2>
                      <span className="dark:bg-primary-dark rounded-md bg-primary px-2 py-1 text-base font-bold text-black dark:text-white">
                        {" "}
                        {idx + 1}
                      </span>
                    </div>
                  </div>
                  <div className="text-end">
                    <h4 className="text-lg font-bold">
                      {" "}
                      {Number(ranking?.referralCount ?? 0).toLocaleString(
                        "en-US",
                        { maximumFractionDigits: 0, minimumFractionDigits: 0 },
                      )}
                    </h4>
                    <p className="text-base text-[#767676]">
                      {Number(ranking?.xpCount ?? 0).toLocaleString("en-US", {
                        maximumFractionDigits: 2,
                        minimumFractionDigits: 2,
                      })}{" "}
                      XP
                    </p>
                  </div>
                </li>
              ),
          )}
      </ul>
      <div className="personal-container mx-auto max-w-4xl">
        <div className="flex flex-nowrap items-center gap-3">
          <Image
            src="/user.png"
            alt="profile"
            width={55}
            height={55}
            className="rounded-full border-2 border-white "
          />
          <div className="flex w-fit items-center gap-3">
            <div className="grid gap-1">
              <h3>Referrals</h3> <h3>XP</h3>
            </div>
            <div className="grid gap-1">
              <h3>
                {Number(leaderBoards?.user?.referralCount ?? 0).toLocaleString(
                  "en-US",
                  { maximumFractionDigits: 0, minimumFractionDigits: 0 },
                )}
              </h3>{" "}
              <h3>
                {Number(leaderBoards?.user?.xpCount ?? 0).toLocaleString(
                  "en-US",
                  { maximumFractionDigits: 2, minimumFractionDigits: 2 },
                )}{" "}
                Xp
              </h3>
            </div>
          </div>
        </div>
        <div className="grid gap-1">
          <div className="grid grid-cols-2 text-center">
            <h3>Position</h3>
          </div>
          <div className="flex justify-between gap-1 rounded-lg bg-white p-1 text-center dark:bg-black">
            <h3>
              {Number(leaderBoards?.globalRank ?? 0).toLocaleString("en-US", {
                maximumFractionDigits: 2,
                minimumFractionDigits: 2,
              })}
            </h3>
            {/*<span className="h-full w-[1px] bg-black dark:bg-white"></span>
            <h3>
              {Number(leaderBoards?.totalUsers ?? 0).toLocaleString("en-US", {
                maximumFractionDigits: 2,
                minimumFractionDigits: 2,
              })}
            </h3> */}
          </div>
        </div>
      </div>
    </>
  );
};

export default TrackPositions;
const rankings = [
  {
    title: "Amazinglanky",
    rank: "10000",
    value: "5678890",
  },
  {
    title: "Amazinglanky",
    rank: "10000",
    value: "5678890",
  },
  {
    title: "Amazinglanky",
    rank: "10000",
    value: "5678890",
  },
  {
    title: "Amazinglanky",
    rank: "10000",
    value: "5678890",
  },
  {
    title: "Amazinglanky",
    rank: "10000",
    value: "5678890",
  },
  {
    title: "Amazinglanky",
    rank: "10000",
    value: "5678890",
  },
  {
    title: "Amazinglanky",
    rank: "10000",
    value: "5678890",
  },
  {
    title: "Amazinglanky",
    rank: "10000",
    value: "5678890",
  },
  {
    title: "Amazinglanky",
    rank: "10000",
    value: "5678890",
  },
  {
    title: "Amazinglanky",
    rank: "10000",
    value: "5678890",
  },
];
