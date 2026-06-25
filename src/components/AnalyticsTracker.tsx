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

    recordSiteVisit(pathname);
  }, [pathname]);

  return null;
}
