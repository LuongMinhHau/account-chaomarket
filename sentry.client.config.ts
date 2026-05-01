import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  sendDefaultPii: true,
  tracesSampleRate: process.env.NODE_ENV === "development" ? 1.0 : 0.1,

  // Only block errors originating from browser extensions / third-party scripts
  // All errors from our own code will still be reported
  denyUrls: [
    /^chrome-extension:\/\//,
    /^moz-extension:\/\//,
    /^safari-extension:\/\//,
    /sp\.zalo\.me/,
  ],

  enableLogs: true,
});
