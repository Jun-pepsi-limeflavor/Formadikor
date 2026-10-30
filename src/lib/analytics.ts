export const GA_MEASUREMENT_ID =
  process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID ?? "";

// Set NEXT_PUBLIC_GA_DEBUG=true to send events from non-production (e.g. localhost) to GA DebugView.
export const GA_DEBUG = process.env.NEXT_PUBLIC_GA_DEBUG?.trim().toLowerCase() === "true";

export function isAnalyticsEnabled() {
  return Boolean(GA_MEASUREMENT_ID) && (process.env.NODE_ENV === "production" || GA_DEBUG);
}
