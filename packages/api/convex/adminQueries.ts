import { queryWithAuth } from "@convex-dev/convex-lucia-auth";
import { Id, Doc } from "./_generated/dataModel";

export const dashboardData = queryWithAuth({
  args: {},
  handler: async ({ db }) => {
    const users: Doc<"user">[] = await db.query("user")
    .withIndex("by_deleted", (q: any) => q.eq("deleted", false))
      // .filter((q: any) => q.eq(q.field("deleted"), false))
      .order("asc").collect();

    // Filter and extract
    const totalMined = users.reduce((c, obj) => c + (obj.minedCount ?? 0), 0);
    const totalXp = users.reduce((c, obj) => c + (obj.xpCount ?? 0), 0);
    const totalReferrals = users.reduce(
      (c, obj) => c + (obj.referralCount ?? 0),
      0
    );
    const totalUsers = users.length;
    const recentUsers = users.slice(0, 5);

    return { totalMined, totalXp, totalReferrals, totalUsers, recentUsers };
  },
});

export const fetchUsers = queryWithAuth({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("user")
      .withIndex("by_deleted", (q: any) => q.eq("deleted", false))
      .collect();
  },
});

// Tasks
export const fetchTasks = queryWithAuth({
  args: {},
  handler: async (ctx) => await ctx.db.query("tasks").collect(),
});

// Events
export const fetchEvents = queryWithAuth({
  args: {},
  handler: async (ctx) => {
    const events: Doc<"events">[] = await ctx.db.query("events").collect();

    return await Promise.all(
      events.map(async (event) => {
        const company = await ctx.db.get(event.companyId);
        // if(!company) {
        //   throw new Error("No company found");
        // }
        const logoUrl = await ctx.storage.getUrl(
          company?.logoStorageId as Id<"_storage">
        );

        return {
          ...event,
          company: {
            ...company,
            logoUrl: logoUrl ?? "",
          },
        };
      })
    );
  },
});

// Company
export const fetchCompanies = queryWithAuth({
  args: {},
  handler: async (ctx) => await ctx.db.query("company").collect(),
});
