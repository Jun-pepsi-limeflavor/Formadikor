"use client";

import { useCallback, useState } from "react";
import { GoogleAnalytics as NextGoogleAnalytics, sendGAEvent } from "@next/third-parties/google";
import { GA_DEBUG, GA_MEASUREMENT_ID, isAnalyticsEnabled } from "@/lib/analytics";
import { SUPPORT_EMAIL } from "@/lib/constants/support";

export function GoogleAnalytics() {
  if (!isAnalyticsEnabled()) return null;

  return <NextGoogleAnalytics gaId={GA_MEASUREMENT_ID} debugMode={GA_DEBUG} />;
}

export type EmailClickLocation =
  | "footer"
  | "contact_page"
  | "home_cta"
  | "dashboard_sidebar";

export function trackEvent(name: string, params: Record<string, unknown> = {}) {
  const enabled = isAnalyticsEnabled();
  if (process.env.NODE_ENV !== "production") {
    console.debug(`[GA] ${enabled ? "sent" : "skipped (GA disabled)"}:`, name, params);
  }
  if (!enabled) return;
  sendGAEvent("event", name, GA_DEBUG ? { ...params, debug_mode: true } : params);
}

export const trackEmailClick = (click_location: EmailClickLocation) =>
  trackEvent("email_click", { click_location, email: SUPPORT_EMAIL });

export const trackContactSubmit = () =>
  trackEvent("generate_lead", { lead_source: "contact_form" });

export const trackQuoteSubmit = (params: Record<string, unknown> = {}) =>
  trackEvent("generate_lead", { lead_source: "quote_submit", ...params });

export const trackSignUp = (method = "email") => trackEvent("sign_up", { method });

export function CopyEmailButton({
  location,
  className,
  children,
}: {
  location: EmailClickLocation;
  className?: string;
  children?: React.ReactNode;
}) {
  const [copied, setCopied] = useState(false);

  const onClick = useCallback(async () => {
    trackEmailClick(location);
    try {
      await navigator.clipboard.writeText(SUPPORT_EMAIL);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard unavailable (insecure context / denied)
    }
  }, [location]);

  return (
    <button type="button" onClick={onClick} className={className} title="Click to copy email">
      {copied ? "Copied!" : (children ?? SUPPORT_EMAIL)}
    </button>
  );
}
