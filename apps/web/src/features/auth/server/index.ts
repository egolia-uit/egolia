import { betterAuth } from "better-auth";
import { genericOAuth } from "better-auth/plugins";

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL,
  secret: process.env.BETTER_AUTH_SECRET,
  plugins: [
    genericOAuth({
      config: [
        {
          providerId: "authentik",
          clientId: process.env.AUTHENTIK_CLIENT_ID!,
          clientSecret: process.env.AUTHENTIK_CLIENT_SECRET!,
          discoveryUrl: process.env.AUTHENTIK_CLIENT_DISCOVERY_URL!,
          redirectURI: process.env.AUTHENTIK_REDIRECT_URI,
          scopes: ["openid", "profile", "email", "entitlements"],
          pkce: true,
        },
      ],
    }),
  ],
});
