"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { recordSiteVisit } from "@/src/lib/adminAnalyticsStorage";

export default function AnalyticsTracker() {
  const pathname = usePathname();
  const recordedPath = useRef<string | null>(null);

  useEffect(() => {
    if (!pathname || pathname.startsWith("/admin") || recordedPath.current === pathname) {
      return;
    }

    recordedPath.current = pathname;
    void fetch("/api/analytics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: pathname }),
      keepalive: true,
    }).catch(() => {
      recordSiteVisit(pathname);
    });
  }, [pathname]);

  return null;
}
