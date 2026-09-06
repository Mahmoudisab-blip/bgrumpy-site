"use client";

import { resetAnalyticsConsent } from "@/src/lib/analyticsConsent";

export default function CookiePreferencesButton() {
  const changePreferences = () => {
    resetAnalyticsConsent();
    void fetch("/api/analytics/track", { method: "DELETE", keepalive: true }).catch(() => undefined);
  };

  return (
    <button type="button" className="btn btn-secondary" onClick={changePreferences}>
      Modifier mes choix statistiques
    </button>
  );
}
