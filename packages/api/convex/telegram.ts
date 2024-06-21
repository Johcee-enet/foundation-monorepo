"use node";
import crypto from "node:crypto";
import bcrypt from "bcryptjs";

import { mutation, action, internalMutation } from "./_generated/server";
import { ConvexError, v } from "convex/values";
import { internal } from "./_generated/api";
import { Doc } from "./_generated/dataModel";




// link to tg users account and store their tgUsername
// auth user details sent to bot
export const linkTelegram: any = action({
  args: { email: v.string(), password: v.string(), initData: v.string() },
  handler: async ({ runMutation, runQuery }, { email, password, initData }) => {

    // Sample initData string to be validated
    // query_id=AAHhvbU6AAAAAOG9tToA9NpU&user=%7B%22id%22%3A984989153%2C%22first_name%22%3A%22Mimi_%22%2C%22last_name%22%3A%22%22%2C%22username%22%3A%22afullsnack%22%2C%22language_code%22%3A%22en%22%2C%22allows_write_to_pm%22%3Atrue%7D&auth_date=1718925398&hash=5ed3e41cff5856e8f73f3b3862269f0e3e19161956368d4c9b5fe186fdb32540
    // "query_id=AAHhvbU6AAAAAOG9tToA9NpU&user=%7B%22id%22%3A984989153%2C%22first_name%22%3A%22Mimi_%22%2C%22last_name%22%3A%22%22%2C%22username%22%3A%22afullsnack%22%2C%22language_code%22%3A%22en%22%2C%22allows_write_to_pm%22%3Atrue%7D&auth_date=1718925398&hash=5ed3e41cff5856e8f73f3b3862269f0e3e19161956368d4c9b5fe186fdb32540"


    if (authFromTelegram(initData)) {
      // move on
      console.log("Data from telegram is valid");
      //> auth user
      const user: Doc<"user"> | null | undefined = await runQuery(internal.queries.getUserWithEmail, { email: email.toLowerCase() });

      if (!user) {
        throw new ConvexError({
          message: "User not found",
          code: 404,
          status: "failed",
        })
      }

      // Compare password
      if (user?.password) {
        if (await bcrypt.compare(password, user.password)) {
          // Update users lastActive
          await runMutation(internal?.onboarding.updateUserLastActive, {
            userId: user?._id,
          });

          // Decode the user object
          const splitString = initData.split("&");
          const userSplit = splitString[1].split("=");
          const userObject = JSON.parse(decodeURLString(userSplit[1]));

          console.log(userObject, ":::Decoded string of user");

          //> store tgUsername
          await runMutation(internal.mutations.updateUserTgObject, {
            userId: user._id,
            tgUsername: userObject["username"],
            tgUserId: userObject["id"],
          })

          //> return userId to be stored in telegram
          return user;
        } else {
          throw new ConvexError({
            message: "Invalid email or password",
            code: 401,
            status: "failed",
          });
        }
      } else {
        throw new ConvexError({
          message: "Something went wrong validating this user",
          code: 500,
          status: "failed"
        });
      }
    } else {
      console.log("Data from telegram is invalid");
      throw new ConvexError({
        message: "Invalid telegram data",
        code: 401,
        status: "failed",
      })
    }
  },
})



const decodeURLString = (encodedString: string): string => {
  return decodeURIComponent(encodedString);

}

const authFromTelegram = (initData: string): boolean => {
  const splitInitString = initData.split('&');
  const hashSet = splitInitString[-1];
  const splitHashSet = hashSet.split('=');

  const isHash = splitHashSet[0] === "hash";

  const hash = isHash ? splitHashSet[1] : null;
  console.log(hash, ":::Test hash");
  // compute secrete_key to be compared
  const secret_key = crypto.createHmac('sha256', 'WebAppData').update(process.env.TG_BOT_TOKEN as string).digest();

  // compute hex representation of the initData
  const hex = crypto.createHmac('sha256', secret_key).update(initData).digest('hex');

  if (hash) {
    return hex === hash; // compare and return true if match
  }

  return false;

}

