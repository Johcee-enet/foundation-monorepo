import { cronJobs } from "convex/server";

import { internal } from "./_generated/api";

const crons = cronJobs();

// Define cron for updating user activities
// crons.weekly(
//   "Check leaderboard",
//   { hourUTC: 12, minuteUTC: 30, dayOfWeek: "saturday" },
//   internal.mutations.weeklyLeaderBoardCheck,
// );


crons.interval(
  "Aggregate mined tokens of active miners",
  {hours: 1},
  internal.mutations.mine
)

export default crons;
