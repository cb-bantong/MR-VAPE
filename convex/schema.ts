import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";

import { v } from "convex/values";

const schema = defineSchema({
  ...authTables,
  users: defineTable({
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    emailVerificationTime: v.optional(v.number()),
    phone: v.optional(v.string()),
    phoneVerificationTime: v.optional(v.number()),
    image: v.optional(v.string()),
    role: v.union(v.literal("employee"), v.literal("admin")),
    userStatus: v.optional(
      v.union(v.literal("active"), v.literal("inactive"), v.literal("pending")),
    ),
  }).index("by_email", ["email"]),
  products: defineTable({
    company: v.string(),
    productName: v.string(),
    description: v.string(),
    flavor: v.string(),
    stock: v.number(),
    price: v.number(),
    productStatus: v.union(v.literal("available"), v.literal("out_of_stock")),
    imageUrl: v.optional(v.string()),
    storageId: v.optional(v.id("_storage")),
  })
    .index("by_company", ["company"])
    .index("by_productName", ["productName"])
    .index("by_flavor", ["flavor"]),
  sales: defineTable({
    productId: v.optional(v.id("products")),
    company: v.string(),
    productName: v.string(),
    flavor: v.string(),
    quantity: v.number(),
    priceAtSale: v.number(),
    timestamp: v.number(),
    sellerId: v.optional(v.string()),
    sellerName: v.optional(v.string()),
  }).index("by_timestamp", ["timestamp"]),
  actionLogs: defineTable({
    userId: v.string(),
    userName: v.string(),
    userEmail: v.string(),
    action: v.string(),
    details: v.string(),
    timestamp: v.number(),
  }).index("by_timestamp", ["timestamp"]),
});

export default schema;
