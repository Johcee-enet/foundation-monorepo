import { authTables } from "@convex-dev/convex-lucia-auth";
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema(
  {
    ...authTables({
      user: {
        email: v.string(),
      },
      session: {},
    }),
    // This definition matches the example query and mutation code:
    user: defineTable({
      email: v.optional(v.string()),
      minedCount: v.optional(v.float64()),
      miningRate: v.float64(),
      nickname: v.optional(v.string()),
      otpSecret: v.optional(v.string()),
      password: v.optional(v.string()),
      mineActive: v.boolean(),
      mineHours: v.number(),
      redeemableCount: v.float64(),
      mineStartTime: v.optional(v.number()),
      referreeCode: v.optional(v.string()),
      referralCode: v.optional(v.string()),
      referralCount: v.number(),
      xpCount: v.number(),
      referralXp: v.optional(v.number()),
      claimedXp: v.optional(v.number()),
      multiplier: v.optional(v.number()),
      boostStatus: v.optional(
        v.array(
          v.object({
            boostId: v.string(),
            isActive: v.boolean(),
            currentXpCost: v.optional(v.number()),
            currentLevel: v.optional(v.number()),
          }),
        ),
      ),
      completedTasks: v.optional(v.array(v.id("tasks"))),
      eventsJoined: v.optional(
        v.array(
          v.object({
            eventId: v.id("events"),
            completed: v.boolean(),
            actions: v.array(
              v.object({
                completed: v.boolean(),
                name: v.string(),
                link: v.string(),
                type: v.union(
                  v.literal("visit"),
                  v.literal("follow"),
                  v.literal("post"),
                  v.literal("join"),
                ),
                channel: v.union(
                  v.literal("twitter"),
                  v.literal("telegram"),
                  v.literal("discord"),
                  v.literal("website"),
                ),
              }),
            ),
          }),
        ),
      ),
      deleted: v.optional(v.boolean()),
      lastActive: v.optional(v.number()),
    })
      .index("by_xpCount", ["xpCount"])
      .index("by_email", ["email"])
      .index("by_nickname", ["nickname"])
      .index("by_claimedXp_xpCount", ["claimedXp", "xpCount"])
      .index("by_mineActive", ["mineActive"])
      .index("by_deleted", ["deleted"]),
    activity: defineTable({
      userId: v.id("user"),
      message: v.string(),
      extra: v.optional(v.string()),
      type: v.union(v.literal("xp"), v.literal("rank")),
    })
    .index("by_userId", ["userId"])
    .index("by_userId_xp", ["userId", "type"]),
    ads: defineTable({
      link: v.string(),
      storageId: v.id("_storage"),
      color: v.optional(v.string()),
      expiresAt: v.optional(v.number()),
    }),
    tasks: defineTable({
      name: v.string(),
      reward: v.number(),
      action: v.object({
        link: v.string(),
        type: v.union(
          v.literal("visit"),
          v.literal("follow"),
          v.literal("post"),
          v.literal("join"),
        ),
        channel: v.union(
          v.literal("twitter"),
          v.literal("telegram"),
          v.literal("discord"),
          v.literal("website"),
        ),
      }),
    }),
    events: defineTable({
      title: v.string(),
      reward: v.number(),
      description: v.optional(v.string()),
      coverStorageId: v.optional(v.id("_storage")),
      companyId: v.id("company"),
      actions: v.array(
        v.object({
          name: v.string(),
          link: v.string(),
          type: v.union(
            v.literal("visit"),
            v.literal("follow"),
            v.literal("post"),
            v.literal("join"),
          ),
          channel: v.union(
            v.literal("twitter"),
            v.literal("telegram"),
            v.literal("discord"),
            v.literal("website"),
          ),
        }),
      ),
    }),
    company: defineTable({
      name: v.string(),
      logoStorageId: v.id("_storage"),
      isApproved: v.boolean(),
    }),
    config: defineTable({
      miningCount: v.float64(),
      miningHours: v.number(),
      xpCount: v.float64(),
      referralXpCount: v.float64(),
      xpPerToken: v.optional(v.float64()),
      minimumSaleToken: v.optional(v.float64()),
      boosts: v.optional(
        v.array(
          v.object({
            uuid: v.string(),
            rate: v.float64(),
            xpCost: v.number(),
            title: v.string(),
            type: v.union(
              v.literal("bot"),
              v.literal("rate"),
              v.literal("duration"),
            ),
            totalLevel: v.optional(v.number()),
          }),
        ),
      ),
    }),
  },
  // If you ever get an error about schema mismatch
  // between your data and your schema, and you cannot
  // change the schema to match the current data in your database,
  // you can:
  //  1. Use the dashboard to delete tables or individual documents
  //     that are causing the error.
  //  2. Change this option to `false` and make changes to the data
  //     freely, ignoring the schema. Don't forget to change back to `true`!
  { schemaValidation: true },
);
