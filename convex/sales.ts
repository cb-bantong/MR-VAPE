import { mutation, query } from "./_generated/server";
import { v, ConvexError } from "convex/values";
import { auth } from "./auth";
import { logActivity } from "./actionLogs";

export const createSale = mutation({
  args: {
    productId: v.id("products"),
    quantity: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      throw new ConvexError("Unauthorized");
    }

    const user = await ctx.db.get(userId);
    if (!user) {
      throw new ConvexError("User not found");
    }

    const product = await ctx.db.get(args.productId);
    if (!product) {
      throw new ConvexError("Product not found");
    }

    if (args.quantity <= 0) {
      throw new ConvexError("Quantity must be greater than zero");
    }

    if (product.stock < args.quantity) {
      throw new ConvexError(
        `Insufficient stock! Only ${product.stock} units of '${product.productName}' (${product.flavor}) are available.`
      );
    }

    const newStock = product.stock - args.quantity;
    const newStatus = newStock > 0 ? "available" : "out_of_stock";

    await ctx.db.patch(args.productId, {
      stock: newStock,
      productStatus: newStatus,
    });

    const saleId = await ctx.db.insert("sales", {
      productId: args.productId,
      company: product.company,
      productName: product.productName,
      flavor: product.flavor,
      quantity: args.quantity,
      priceAtSale: product.price,
      timestamp: Date.now(),
      sellerId: userId,
      sellerName: user.name || user.email || "Unknown User",
    });

    await logActivity(
      ctx,
      "create_sale",
      `Logged sale: ${args.quantity}x '${product.productName}' (${product.flavor}) by ${
        user.name || user.email
      }`
    );

    return saleId;
  },
});

export const getSales = query({
  args: {},
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      return [];
    }
    return await ctx.db.query("sales").order("desc").collect();
  },
});
