import { mutation, query } from "./_generated/server";
import { v, ConvexError } from "convex/values";
import { auth } from "./auth";
import { logActivity } from "./actionLogs";

export const getUserByEmail = query({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .unique();
  },
});

export const viewer = query({
  args: {},
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx);
    if (userId === null) {
      return null;
    }
    return await ctx.db.get(userId);
  },
});

export const getAllUsers = query({
  args: {},
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      throw new ConvexError("Unauthorized");
    }
    const user = await ctx.db.get(userId);
    if (!user || user.role !== "admin") {
      throw new ConvexError("Unauthorized: Admins only");
    }
    return await ctx.db.query("users").collect();
  },
});

export const createUser = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    role: v.union(v.literal("employee"), v.literal("admin")),
    userStatus: v.union(v.literal("active"), v.literal("inactive"), v.literal("pending")),
  },
  handler: async (ctx, args) => {
    const currentUserId = await auth.getUserId(ctx);
    if (!currentUserId) {
      throw new ConvexError("Unauthorized");
    }
    const currentUser = await ctx.db.get(currentUserId);
    if (!currentUser || currentUser.role !== "admin") {
      throw new ConvexError("Unauthorized: Admins only");
    }

    const existing = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .unique();
    if (existing) {
      throw new ConvexError("User with this email already exists");
    }

    const newUserId = await ctx.db.insert("users", {
      name: args.name,
      email: args.email,
      role: args.role,
      userStatus: args.userStatus,
    });

    await logActivity(
      ctx,
      "create_user",
      `Created user ${args.name} (${args.email}) with role '${args.role}' and status '${args.userStatus}'`
    );

    return newUserId;
  },
});

export const updateUser = mutation({
  args: {
    userId: v.id("users"),
    name: v.string(),
    email: v.string(),
    role: v.union(v.literal("employee"), v.literal("admin")),
    userStatus: v.union(v.literal("active"), v.literal("inactive"), v.literal("pending")),
  },
  handler: async (ctx, args) => {
    const currentUserId = await auth.getUserId(ctx);
    if (!currentUserId) {
      throw new ConvexError("Unauthorized");
    }
    const currentUser = await ctx.db.get(currentUserId);
    if (!currentUser || currentUser.role !== "admin") {
      throw new ConvexError("Unauthorized: Admins only");
    }

    const targetUser = await ctx.db.get(args.userId);
    if (!targetUser) {
      throw new ConvexError("User not found");
    }

    // Check if email changed and is taken
    if (targetUser.email !== args.email) {
      const existing = await ctx.db
        .query("users")
        .withIndex("by_email", (q) => q.eq("email", args.email))
        .unique();
      if (existing) {
        throw new ConvexError("User with this email already exists");
      }
    }

    await ctx.db.patch(args.userId, {
      name: args.name,
      email: args.email,
      role: args.role,
      userStatus: args.userStatus,
    });

    const changes = [];
    if (targetUser.name !== args.name) changes.push(`name to '${args.name}'`);
    if (targetUser.email !== args.email) changes.push(`email to '${args.email}'`);
    if (targetUser.role !== args.role) changes.push(`role to '${args.role}'`);
    if (targetUser.userStatus !== args.userStatus) changes.push(`status to '${args.userStatus}'`);

    const details = changes.length > 0 
      ? `Updated user ${targetUser.name || args.name}: changed ${changes.join(", ")}`
      : `Updated user ${targetUser.name || args.name} (no fields changed)`;

    await logActivity(ctx, "update_user", details);
    return { success: true };
  },
});

export const deleteUser = mutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const currentUserId = await auth.getUserId(ctx);
    if (!currentUserId) {
      throw new ConvexError("Unauthorized");
    }
    const currentUser = await ctx.db.get(currentUserId);
    if (!currentUser || currentUser.role !== "admin") {
      throw new ConvexError("Unauthorized: Admins only");
    }

    const targetUser = await ctx.db.get(args.userId);
    if (!targetUser) {
      throw new ConvexError("User not found");
    }

    if (currentUserId === args.userId) {
      throw new ConvexError("You cannot delete your own admin account");
    }

    await ctx.db.delete(args.userId);
    await logActivity(ctx, "delete_user", `Deleted user ${targetUser.name || "Unknown"} (${targetUser.email || "No Email"})`);
    return { success: true };
  },
});
