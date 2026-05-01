import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  output: 'standalone',
  serverExternalPackages: ['pg'],
};

export default withSentryConfig(nextConfig, {
  org: "chao-wb",
  project: "account-chaomarket",

  // Source map upload auth token
  authToken: process.env.SENTRY_AUTH_TOKEN,

  // Upload wider set of client source files for better stack traces
  widenClientFileUpload: true,

  // Proxy route to bypass ad-blockers
  tunnelRoute: "/monitoring",

  // Suppress non-CI output
  silent: !process.env.CI,
});
