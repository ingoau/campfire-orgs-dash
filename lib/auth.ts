import "server-only";

import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { genericOAuth } from "better-auth/plugins";

import { isEmailAllowlisted } from "@/lib/email-allowlist";

const baseURL = process.env.BETTER_AUTH_URL;
const secret = process.env.BETTER_AUTH_SECRET;
const oauthClientId = process.env.HACKCLUB_OAUTH_CLIENT_ID;
const oauthClientSecret = process.env.HACKCLUB_OAUTH_CLIENT_SECRET;

if (!baseURL) {
  throw new Error("Missing BETTER_AUTH_URL environment variable.");
}

if (!secret) {
  throw new Error("Missing BETTER_AUTH_SECRET environment variable.");
}

if (!oauthClientId) {
  throw new Error("Missing HACKCLUB_OAUTH_CLIENT_ID environment variable.");
}

if (!oauthClientSecret) {
  throw new Error("Missing HACKCLUB_OAUTH_CLIENT_SECRET environment variable.");
}

export const auth = betterAuth({
  appName: "Campfire Canberra Participants Dashboard",
  baseURL,
  secret,
  trustedOrigins: [baseURL],
  session: {
    cookieCache: {
      enabled: true,
      strategy: "jwe",
      maxAge: 60 * 60 * 24 * 7,
      refreshCache: true,
    },
  },
  account: {
    storeStateStrategy: "cookie",
    storeAccountCookie: true,
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          if (!isEmailAllowlisted(user.email)) {
            return false;
          }
        },
      },
    },
  },
  advanced: {
    useSecureCookies: process.env.NODE_ENV === "production",
    disableOriginCheck: false,
    disableCSRFCheck: false,
  },
  plugins: [
    genericOAuth({
      config: [
        {
          providerId: "hackclub",
          discoveryUrl:
            "https://auth.hackclub.com/.well-known/openid-configuration",
          clientId: oauthClientId,
          clientSecret: oauthClientSecret,
          scopes: ["openid", "profile", "email"],
          pkce: true,
          requireIssuerValidation: false,
        },
      ],
    }),
    nextCookies(),
  ],
});
