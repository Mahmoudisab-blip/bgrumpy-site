"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  analyticsConsentChangedEventName,
  readAnalyticsConsent,
  setAnalyticsConsent,
  type AnalyticsConsent,
} from "@/src/lib/analyticsConsent";
import styles from "./CookieConsent.module.css";

export default function CookieConsent() {
  const [consent, setConsent] = useState<AnalyticsConsent | null>(null);

  useEffect(() => {
    const syncConsent = () => setConsent(readAnalyticsConsent());

    syncConsent();
    window.addEventListener(analyticsConsentChangedEventName, syncConsent);
    return () => window.removeEventListener(analyticsConsentChangedEventName, syncConsent);
  }, []);

  if (consent !== null) {
    return null;
  }

  const choose = (value: AnalyticsConsent) => {
    const record = setAnalyticsConsent(value);

    if (record) {
      void fetch("/api/analytics/consent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(record),
        keepalive: true,
      }).catch(() => undefined);
    }

    if (value === "refused") {
      void fetch("/api/analytics/track", { method: "DELETE", keepalive: true }).catch(() => undefined);
    }
  };

  return (
    <aside className={styles.banner} aria-labelledby="cookie-consent-title" role="dialog">
      <h2 className={styles.title} id="cookie-consent-title">Tes choix de confidentialité</h2>
      <p className={styles.text}>
        Ce site utilise les éléments nécessaires au compte et au paiement. Avec ton accord, nous mesurons de façon pseudonyme les pages consultées pour améliorer le site. Aucun cookie publicitaire, et ton choix ne bloque pas la navigation, les devis ou le paiement.
      </p>
      <div className={styles.actions}>
        <button type="button" className={styles.button} onClick={() => choose("refused")}>
          Refuser les statistiques
        </button>
        <button type="button" className={`${styles.button} ${styles.buttonPrimary}`} onClick={() => choose("accepted")}>
          Accepter les statistiques
        </button>
        <Link className={styles.link} href="/cookies">En savoir plus</Link>
      </div>
    </aside>
  );
}
