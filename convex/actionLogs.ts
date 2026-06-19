import { query } from "./_generated/server";
import { auth } from "./auth";

export async function logActivity(
  ctx: any,
  action: string,
  details: string
) {
  const userId = await auth.getUserId(ctx);
  let userName = "System";
  let userEmail = "system@mrvape.internal";

  if (userId) {
    const user = await ctx.db.get(userId);
    if (user) {
      userName = user.name || "Unknown User";
      userEmail = user.email || "unknown@user.com";
    }
  }

  await ctx.db.insert("actionLogs", {
    userId: userId || "system",
    userName,
    userEmail,
    action,
    details,
    timestamp: Date.now(),
  });
}

export const getLogs = query({
  args: {},
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      throw new Error("Unauthorized");
    }
    const user = await ctx.db.get(userId);
    if (!user || user.role !== "admin") {
      throw new Error("Unauthorized: Admins only");
    }
    return await ctx.db
      .query("actionLogs")
      .order("desc")
      .take(100);
  },
});
