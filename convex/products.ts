import { mutation, query } from "./_generated/server";
import { v, ConvexError } from "convex/values";
import { logActivity } from "./actionLogs";

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

export const createProduct = mutation({
  args: {
    company: v.string(),
    productName: v.string(),
    description: v.optional(v.string()),
    flavor: v.string(),
    stock: v.number(),
    price: v.number(),
    imageUrl: v.optional(v.string()),
    storageId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    const initialStatus = args.stock > 0 ? "available" : "out_of_stock";
    
    let finalImageUrl = args.imageUrl;
    if (args.storageId) {
      const url = await ctx.storage.getUrl(args.storageId);
      if (url) {
        finalImageUrl = url;
      }
    }

    const productId = await ctx.db.insert("products", {
      company: args.company,
      productName: args.productName,
      description: args.description || "",
      flavor: args.flavor,
      stock: args.stock,
      price: args.price,
      productStatus: initialStatus,
      imageUrl: finalImageUrl,
      storageId: args.storageId,
    });
    
    await logActivity(
      ctx, 
      "create_product", 
      `Added new product '${args.productName}' (${args.company}) with ${args.stock} in stock at ₱${args.price.toFixed(2)}`
    );
    
    return productId;
  },
});

export const updateProduct = mutation({
  args: {
    productId: v.id("products"),
    company: v.string(),
    productName: v.string(),
    description: v.optional(v.string()),
    flavor: v.string(),
    stock: v.number(),
    price: v.number(),
    imageUrl: v.optional(v.string()),
    storageId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    const product = await ctx.db.get(args.productId);
    if (!product) {
      throw new ConvexError("Product not found");
    }

    let finalImageUrl = args.imageUrl;
    if (args.storageId && product.storageId !== args.storageId) {
      // New storage ID uploaded! Delete old one if it exists.
      if (product.storageId) {
        try {
          await ctx.storage.delete(product.storageId);
        } catch (e) {
          console.error("Failed to delete old product image:", e);
        }
      }
      const url = await ctx.storage.getUrl(args.storageId);
      if (url) {
        finalImageUrl = url;
      }
    } else if (product.storageId && !args.storageId && !args.imageUrl) {
      // Clear out image completely
      try {
        await ctx.storage.delete(product.storageId);
      } catch (e) {
        console.error("Failed to delete cleared product image:", e);
      }
    }

    const adjustedStatus = args.stock > 0 ? "available" : "out_of_stock";
    await ctx.db.patch(args.productId, {
      company: args.company,
      productName: args.productName,
      description: args.description || "",
      flavor: args.flavor,
      stock: args.stock,
      price: args.price,
      productStatus: adjustedStatus,
      imageUrl: finalImageUrl,
      storageId: args.storageId || undefined,
    });

    const changes = [];
    if (product.company !== args.company) changes.push(`brand from '${product.company}' to '${args.company}'`);
    if (product.productName !== args.productName) changes.push(`name from '${product.productName}' to '${args.productName}'`);
    if (product.flavor !== args.flavor) changes.push(`flavor from '${product.flavor}' to '${args.flavor}'`);
    if (product.stock !== args.stock) changes.push(`stock from ${product.stock} to ${args.stock}`);
    if (product.price !== args.price) changes.push(`price from ₱${product.price.toFixed(2)} to ₱${args.price.toFixed(2)}`);
    if (product.description !== args.description) changes.push(`description`);
    if (product.imageUrl !== finalImageUrl) changes.push(`image`);

    const details = changes.length > 0
      ? `Updated product '${product.productName}': changed ${changes.join(", ")}`
      : `Updated product '${product.productName}' (no fields changed)`;

    await logActivity(ctx, "update_product", details);
    return { success: true };
  },
});

export const getTotalSupply = query({
  args: {},
  handler: async (ctx) => {
    const products = await ctx.db.query("products").collect();
    return products.reduce((total, product) => total + product.stock, 0);
  },
});

export const getCompanies = query({
  args: {},
  handler: async (ctx) => {
    const products = await ctx.db.query("products").collect();
    const companiesSet = new Set(products.map((product) => product.company));
    return Array.from(companiesSet);
  },
});

export const deleteProduct = mutation({
  args: {
    productId: v.id("products"),
  },
  handler: async (ctx, args) => {
    const product = await ctx.db.get(args.productId);
    if (!product) {
      throw new ConvexError("Product not found");
    }

    if (product.storageId) {
      try {
        await ctx.storage.delete(product.storageId);
      } catch (e) {
        console.error("Failed to delete product storage asset:", e);
      }
    }

    await ctx.db.delete(args.productId);
    await logActivity(ctx, "delete_product", `Deleted product '${product.productName}' by brand '${product.company}'`);
    return { success: true };
  },
});

export const getProducts = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("products").collect();
  },
});
