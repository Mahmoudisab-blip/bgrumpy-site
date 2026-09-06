"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { recordSiteVisit } from "@/src/lib/adminAnalyticsStorage";
import {
  analyticsConsentChangedEventName,
  readAnalyticsConsentRecord,
} from "@/src/lib/analyticsConsent";

export default function AnalyticsTracker() {
  const pathname = usePathname();

  useEffect(() => {
    const trackCurrentPage = () => {
      const consentRecord = readAnalyticsConsentRecord();
      if (!pathname || consentRecord?.decision !== "accepted") {
        return;
      }

      const sessionKey = `bgrumpy-analytics:${pathname}`;
      if (window.sessionStorage.getItem(sessionKey)) {
        return;
      }

      window.sessionStorage.setItem(sessionKey, "1");
      recordSiteVisit(pathname);
    };

    trackCurrentPage();
    window.addEventListener(analyticsConsentChangedEventName, trackCurrentPage);

    return () => {
      window.removeEventListener(analyticsConsentChangedEventName, trackCurrentPage);
    };
  }, [pathname]);

  return null;
}
