// TODO: Create convex action to store user data, create OTP and send email with novu
import bcrypt from "bcryptjs";
import { ConvexError, v } from "convex/values";
import { customAlphabet } from "nanoid";

import type { Doc, Id } from "./_generated/dataModel";
import { internal } from "./_generated/api";
import { action, internalMutation, mutation } from "./_generated/server";
import { activateMultiplier } from "./mutations";

// Random OTP code
const generateOTPCode = customAlphabet("0123456789", 6);

export const initializeNewUser = action({
  args: { email: v.string(), referreeCode: v.optional(v.string()) },
  handler: async (ctx, args): Promise<string> => {
    const userId: Id<"user"> = await ctx.runMutation(
      internal.mutations.storeEmail,
      {
        email: args.email,
        referreeCode: args.referreeCode,
      },
    );

    // DONE:✅ Create OTP
    // const otp = generateOTPCode();

    // await ctx.runMutation(internal.mutations.storeOTPSecret, {
    //   userId,
    //   secret: otp ?? generateOTPCode(),
    // });

    // // DONE:✅ call novu action
    // await ctx.runAction(internal.novu.triggerOTPWorkflow, {
    //   otp: otp ?? generateOTPCode(),
    //   userId: userId,
    //   email: args.email,
    // });

    return userId;
  },
});

export const resendOTPCode = action({
  args: { email: v.string(), userId: v.string() },
  handler: async (ctx, args) => {
    // TODO: Create OTP
    const otp = generateOTPCode();
    console.log(otp, ":::User OTP");

    await ctx.runMutation(internal.mutations.storeOTPSecret, {
      userId: args.userId as Id<"user">,
      secret: otp,
    });

    // TODO: call novu action
    await ctx.runAction(internal.novu.triggerOTPWorkflow, {
      otp,
      userId: args.userId,
      email: args.email,
    });
  },
});

export const verifyUserOTP = action({
  args: { otp: v.string(), userId: v.id("user") },
  handler: async (ctx, args) => {
    // Call query to get secretstring
    const secretString: string = await ctx.runQuery(
      internal.queries.getOTPSecret,
      { userId: args.userId },
    );

    console.log(secretString, args.otp, args.userId, ":::OPT values");

    const isValid = args.otp === secretString;
    return isValid;
  },
});

export const storePassword = action({
  args: { userId: v.id("user"), password: v.string() },
  handler: async (ctx, args) => {
    const hashedPassword = await bcrypt.hash(args.password, 10);

    await ctx.runMutation(internal.mutations.saveUserPassword, {
      userId: args.userId,
      hashedPassword: hashedPassword,
    });
  },
});

export const loginUser = action({
  args: { email: v.string(), password: v.string() },
  handler: async ({ runQuery, runMutation }, { email, password }) => {
    // console.log(email, "::::Loging email");
    try {
      const user: any = await runQuery(internal.queries.getUserWithEmail, {
        email: email.toLowerCase(),
      });
      if (!user) {
        throw new ConvexError({
          message: "User not found",
          code: 404,
          status: "failed",
        });
      }

      // Compare password
      if (await bcrypt.compare(password, user?.password)) {
        // Update users lastActive
        await runMutation(internal?.onboarding.updateUserLastActive, {
          userId: user?._id,
        });
        return user;
      } else {
        throw new ConvexError({
          message: "Invalid email or password",
          code: 401,
          status: "failed",
        });
      }
    } catch (e: any) {
      console.log(e, ":::Error getting user detail");
      const message =
        e instanceof ConvexError
          ? (e.data as { message: string })?.message
          : "Issue with getting user";
      throw new ConvexError({ message, code: 500, status: "failed" });
    }
  },
});

export const updateUserLastActive = internalMutation({
  args: { userId: v.id("user") },
  handler: async ({ db }, { userId }) => {
    await db.patch(userId, { lastActive: Date.now() });
  },
});

export const loginTwitterUser = action({
  args: { nickname: v.string() },
  handler: async ({ runQuery }, { nickname }): Promise<Doc<"user">> => {
    // console.log(email, "::::Loging email");
    try {
      const user: Doc<"user"> | null = await runQuery(
        internal.queries.getUserWithNickname,
        {
          nickname,
        },
      );
      if (!user) {
        throw new ConvexError({
          message: "User not found",
          code: 404,
          status: "failed",
        });
      }

      return user;
    } catch (e: any) {
      throw new ConvexError({
        message: "Issue with getting user",
        code: 500,
        status: "failed",
      });
    }
  },
});

export const storeNickname = mutation({
  args: {
    nickname: v.string(),
    userId: v.optional(v.id("user")),
    referreeCode: v.optional(v.string()),
  },
  handler: async (ctx, { nickname, userId, referreeCode }) => {
    try {
      const referralCode = generateReferralCode();
      const config = await ctx.db.query("config").first();

      if (!referralCode) {
        throw new ConvexError({
          message: "Could not cerate referral code for user",
          code: 500,
          status: "failed",
        });
      }

      if (!userId) {
        throw new ConvexError({
          message: "No user has been created",
          code: 500,
          status: "failed",
        });
      }

      // if (userId) {
      const user = await ctx.db.get(userId);

      // If user already has a referralCode and a referreeCode and deleted is true then re-initialize account
      if (user?.deleted && user?.referreeCode === referreeCode) {
        console.log("Existing referreeCode and deleted account");
        await ctx.db.patch(user._id, {
          ...user,
          nickname,
          referralCode: referralCode ?? generateReferralCode(),
          deleted: false,
        });

        return user?._id;
      } else {
        console.log("New user created and is not deleted");
        await ctx.db.patch(userId, {
          nickname: nickname,
          referralCode: referralCode ?? generateReferralCode(),
        });

        // Increment users referree count
        // Get new user data
        const referree = await ctx.db
          .query("user")
          .filter((q) =>
            q.eq(q.field("referralCode"), user?.referreeCode?.toUpperCase()),
          )
          .first();

        if (referree) {
          // Patch referree count
          console.log(referree, ":::Update referree xpCount");
          const currentMultiEffectReward = referree?.multiplier
            ? (config?.referralXpCount ?? 5000) * (referree?.multiplier / 100)
            : 0;
          const totalXpCount =
            (referree?.claimedXp ?? 0) +
            (config?.referralXpCount ?? 5000) +
            currentMultiEffectReward +
            (referree?.referralXp ?? 0);
          const multiplier = activateMultiplier(totalXpCount);

          await ctx.db.patch(referree?._id as Id<"user">, {
            referralCount: Number(referree?.referralCount) + 1,
            referralXp:
              (config?.referralXpCount ?? 5000) +
              currentMultiEffectReward +
              (referree?.referralXp ?? 0),
            xpCount: totalXpCount,
            multiplier,
          });

          await ctx.db.insert("activity", {
            userId: referree?._id,
            message: `${nickname} Joined using your referral code`,
            extra: (
              (config?.referralXpCount ?? 5000) + currentMultiEffectReward
            ).toLocaleString("en-US"),
            type: "xp", // Can be xp and rank
          });

          // Add multiplier activity
          if (multiplier) {
            await ctx.db.insert("activity", {
              userId: userId,
              message: `You got a multiplier of ${multiplier}%`,
              extra: `${multiplier}%`,
              type: "xp", // Can be xp and rank
            });
          }
        }

        return userId;
      }
      // } else {
      //   const previouslyDeleted = await ctx.db
      //     .query("user")
      //     .filter((q) =>
      //       q.and(
      //         q.eq(q.field("nickname"), nickname),
      //         q.eq(q.field("deleted"), true),
      //       ),
      //     )
      //     .first();

      //   // If user was previously deleted update fields
      //   if (previouslyDeleted) {
      //     await ctx.db.patch(previouslyDeleted._id, {
      //       minedCount: 0,
      //       miningRate: 2.0,
      //       mineActive: false,
      //       referralCount: 0,
      //       mineHours: config?.miningHours ?? 6,
      //       redeemableCount: 0,
      //       xpCount: config?.xpCount ?? 1000,
      //       deleted: false,
      //     });
      //     return previouslyDeleted._id;
      //   }

      //   const userId = await ctx.db.insert("user", {
      //     // email: args.email,
      //     nickname,
      //     referreeCode: referreeCode,
      //     referralCode,
      //     minedCount: 0,
      //     miningRate: 2.0,
      //     mineActive: false,
      //     referralCount: 0,
      //     mineHours: config?.miningHours ?? 6,
      //     redeemableCount: 0,
      //     xpCount: config?.xpCount ?? 1000,
      //   });

      //   // Increment users referree count
      //   // Get new user data
      //   const referree = await ctx.db
      //     .query("user")
      //     .filter((q) =>
      //       q.eq(q.field("referralCode"), referreeCode?.toUpperCase().trim()),
      //     )
      //     .first();

      //   if (referree) {
      //     // Patch referree count
      //     console.log(referree, ":::Update referree xpCount");
      //     await ctx.db.patch(referree?._id as Id<"user">, {
      //       referralCount: Number(referree?.referralCount) + 1,
      //       xpCount: config?.referralXpCount ?? 5000 + referree.xpCount,
      //     });
      //     await ctx.db.insert("activity", {
      //       userId: referree?._id,
      //       message: `${nickname} Joined using your referral code`,
      //       extra: (config?.referralXpCount ?? 5000).toLocaleString("en-US"),
      //       type: "xp", // Can be xp and rank
      //     });
      //   }

      //   console.log(userId, ":::User id");
      //   return userId;
      // }
    } catch (e: any) {
      console.log(e.message ?? e.toString());
      throw new ConvexError({
        message: e.message ?? e.toString(),
        code: 500,
        status: "failed",
      });
    }
  },
});

export const isNicknameValid = mutation({
  args: { nickname: v.string() },
  handler: async (ctx, { nickname }) => {
    // Check if the email already exists in the user table

    const users = await ctx.db.query("user").collect();

    if (!users.length) return true;

    const isNotValid: boolean = users.some(
      (user) => user?.nickname === nickname,
    );

    return !isNotValid;
  },
});

const generateReferralCode = (): string => {
  const nanoid = customAlphabet("1234567890abcdefghijklmnopqrstuvwxyz", 6);
  const referralCode = nanoid().toUpperCase();
  return referralCode;
};
