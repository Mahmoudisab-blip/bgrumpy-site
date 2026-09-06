"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { recordSiteVisit } from "@/src/lib/adminAnalyticsStorage";

export default function AnalyticsTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname) {
      return;
    }

    const sessionKey = `bgrumpy-analytics:${pathname}`;
    if (window.sessionStorage.getItem(sessionKey)) {
      return;
    }

    window.sessionStorage.setItem(sessionKey, "1");
    recordSiteVisit(pathname);
  }, [pathname]);

  return null;
}
