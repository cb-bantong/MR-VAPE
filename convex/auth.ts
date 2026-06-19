// convex/auth.ts
import { Password } from "@convex-dev/auth/providers/Password";
import { convexAuth } from "@convex-dev/auth/server";
import { ConvexError } from "convex/values";

const customPasswordProvider = (config?: any) => {
  const provider = Password(config);

  const originalAuthorize = provider.authorize;
  provider.authorize = async (params: any, ctx: any) => {
    try {
      return await originalAuthorize(params, ctx);
    } catch (err) {
      if (err instanceof Error && !(err instanceof ConvexError)) {
        throw new ConvexError(err.message);
      }
      throw err;
    }
  };

  const opt = (provider as any).options;
  if (opt && typeof opt.authorize === "function") {
    const originalOptionsAuthorize = opt.authorize;
    opt.authorize = async (params: any, ctx: any) => {
      try {
        return await originalOptionsAuthorize(params, ctx);
      } catch (err) {
        if (err instanceof Error && !(err instanceof ConvexError)) {
          throw new ConvexError(err.message);
        }
        throw err;
      }
    };
  }

  return provider;
};

export const { auth, signIn, signOut, store } = convexAuth({
  providers: [customPasswordProvider],
  callbacks: {
    async createOrUpdateUser(ctx, args) {
      if (args.existingUserId) {
        return args.existingUserId;
      }

      return await ctx.db.insert("users", {
        name: args.profile.name ?? undefined,
        email: args.profile.email ?? undefined,
        image: args.profile.image ?? undefined,
        role: "employee",
        userStatus: "pending",
      });
    },

    async beforeSessionCreation(ctx, { userId }) {
      const user = await ctx.db.get(userId);

      if (user?.userStatus === "pending") {
        throw new ConvexError(
          "Your account is pending approval. Please wait for an administrator to activate your account."
        );
      }

      if (user?.userStatus === "inactive") {
        throw new ConvexError(
          "Your account has been deactivated. Please contact an administrator."
        );
      }

      // userStatus === "active" → allow login, do nothing
    },
  },
});
