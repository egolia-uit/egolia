import { betterAuth } from 'better-auth';
import { genericOAuth } from 'better-auth/plugins';

type WebAuthSession = {
  user?: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
} | null;

type WebAuth = {
  handler: (request: Request) => Promise<Response>;
  api: {
    getSession: (options: { headers: Headers }) => Promise<WebAuthSession>;
  };
};

const authentikOAuthPrompts = [
  'none',
  'login',
  'create',
  'consent',
  'select_account',
  'select_account consent',
  'login consent',
] as const;

const authentikOAuthPrompt = authentikOAuthPrompts.find(
  (prompt) => prompt === process.env.AUTHENTIK_OAUTH_PROMPT
);

const authentikStaticOAuthConfig =
  process.env.AUTHENTIK_CLIENT_ISSUER &&
  process.env.AUTHENTIK_CLIENT_AUTHORIZATION_URL &&
  process.env.AUTHENTIK_CLIENT_TOKEN_URL &&
  process.env.AUTHENTIK_CLIENT_USERINFO_URL
    ? {
        issuer: process.env.AUTHENTIK_CLIENT_ISSUER,
        authorizationUrl: process.env.AUTHENTIK_CLIENT_AUTHORIZATION_URL,
        tokenUrl: process.env.AUTHENTIK_CLIENT_TOKEN_URL,
        userInfoUrl: process.env.AUTHENTIK_CLIENT_USERINFO_URL,
      }
    : {
        discoveryUrl: process.env.AUTHENTIK_CLIENT_DISCOVERY_URL!,
      };

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL,
  secret: process.env.BETTER_AUTH_SECRET,
  plugins: [
    genericOAuth({
      config: [
        {
          providerId: 'authentik',
          clientId: process.env.AUTHENTIK_CLIENT_ID!,
          clientSecret: process.env.AUTHENTIK_CLIENT_SECRET!,
          ...authentikStaticOAuthConfig,
          redirectURI: process.env.AUTHENTIK_REDIRECT_URI,
          scopes: ['openid', 'profile', 'email', 'entitlements'],
          prompt: authentikOAuthPrompt,
          pkce: true,
        },
      ],
    }),
  ],
}) as WebAuth;
