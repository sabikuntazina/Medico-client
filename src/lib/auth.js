import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { db } from "./db.js";

const isProd = process.env.NODE_ENV === "production";

export const auth = betterAuth({
  database: mongodbAdapter(db),

  // Base URL of this server
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:5000",

  emailAndPassword: {
    enabled: true,
    autoSignIn: true
  },

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET
    }
  },

  // Cross-domain cookie config — CRITICAL for Vercel deployment
  // Client & server are on different subdomains so cookies must be SameSite=None + Secure
  advanced: {
    cookiePrefix: "medico",
    cookies: {
      session_token: {
        name: "medico_session_token",
        options: {
          httpOnly: true,
          secure: isProd,          // true in production (HTTPS)
          sameSite: isProd ? "none" : "lax",  // "none" required for cross-domain
          path: "/",
          maxAge: 60 * 60 * 24 * 7  // 7 days
        }
      }
    }
  },

  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "patient"
      },
      photo: {
        type: "string",
        required: false
      },
      phone: {
        type: "string",
        required: false
      },
      gender: {
        type: "string",
        required: false
      },
      status: {
        type: "string",
        required: false,
        defaultValue: "active"
      }
    }
  },

  trustedOrigins: [
    "http://localhost:3000",
    "https://medico-client-ochre.vercel.app"
  ]
});
