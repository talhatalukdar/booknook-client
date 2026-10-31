import { betterAuth } from "better-auth";
import { APIError, createAuthMiddleware } from "better-auth/api";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { nextCookies } from "better-auth/next-js";
import { jwt } from "better-auth/plugins";
import { MongoClient } from "mongodb";

// The client connects lazily, so the app builds and boots without credentials. Auth calls will
// fail with a clear error until MONGODB_URI is configured.
const globalForMongo = globalThis as unknown as { __booknookMongo?: MongoClient };
const client =
  globalForMongo.__booknookMongo ??
  new MongoClient(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017");
if (process.env.NODE_ENV !== "production") globalForMongo.__booknookMongo = client;

const baseURL = process.env.BETTER_AUTH_URL?.replace(/\/+$/, "");
const googleId = process.env.GOOGLE_CLIENT_ID;
const googleSecret = process.env.GOOGLE_CLIENT_SECRET;

export const auth = betterAuth({
  baseURL,
  secret: process.env.BETTER_AUTH_SECRET,
  database: mongodbAdapter(client.db(process.env.DB_NAME || "booknook")),
  trustedOrigins: baseURL ? [baseURL] : [],

  emailAndPassword: {
    enabled: true,
    minPasswordLength: 6,
    // Assignment flow: after registering the user is sent to the Login page.
    autoSignIn: false,
  },

  socialProviders:
    googleId && googleSecret ? { google: { clientId: googleId, clientSecret: googleSecret } } : {},

  // Server-side password rule (the client form enforces the same rule for friendlier errors).
  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      if (ctx.path !== "/sign-up/email") return;
      const password = String((ctx.body as { password?: unknown } | undefined)?.password ?? "");
      if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || password.length < 6) {
        throw new APIError("BAD_REQUEST", {
          message: "Password needs an uppercase letter, a lowercase letter and 6+ characters",
        });
      }
    }),
  },

  plugins: [
    jwt({
      jwt: {
        // Issuer and audience default to the base URL; the Express server verifies the same values.
        expirationTime: "15m",
        // The Express middleware reads id, email and name from the verified payload.
        definePayload: ({ user }) => ({
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image ?? undefined,
        }),
      },
    }),
    nextCookies(), // keep last
  ],
});
