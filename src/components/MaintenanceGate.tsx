"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import styles from "./MaintenanceGate.module.css";

type MaintenanceGateProps = {
  children: ReactNode;
};

const isAdminPath = (pathname: string | null) => pathname?.startsWith("/admin");
const isPublicQuotePath = (pathname: string | null) =>
  pathname === "/devis"
  || pathname === "/flash-septembre"
  || pathname?.startsWith("/flash-septembre/")
  || pathname === "/mentions-legales"
  || pathname === "/politique-confidentialite"
  || pathname === "/cookies"
  || pathname === "/cgv"
  || pathname === "/cgv/flash-septembre";

export default function MaintenanceGate({ children }: MaintenanceGateProps) {
  const pathname = usePathname();
  const [previewAccess, setPreviewAccess] = useState(false);
  const [loginRequested, setLoginRequested] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const requestedLogin = new URLSearchParams(window.location.search).get("login") === "1";
    const loginFrame = window.requestAnimationFrame(() => {
      if (!cancelled) {
        setLoginRequested(requestedLogin);
      }
    });

    if (isAdminPath(pathname) || isPublicQuotePath(pathname) || pathname === "/profil" || requestedLogin) {
      return () => {
        cancelled = true;
        window.cancelAnimationFrame(loginFrame);
      };
    }

    fetch("/api/client/session", {
      cache: "no-store",
      credentials: "same-origin",
    })
      .then((response) => (response.ok ? response.json() : null))
      .then((payload: { previewAccess?: boolean } | null) => {
        if (!cancelled) {
          setPreviewAccess(Boolean(payload?.previewAccess));
        }
      })
      .catch(() => {
        if (!cancelled) {
          setPreviewAccess(false);
        }
      });

    return () => {
      cancelled = true;
      window.cancelAnimationFrame(loginFrame);
    };
  }, [pathname]);

  if (isAdminPath(pathname) || isPublicQuotePath(pathname) || pathname === "/profil" || loginRequested || previewAccess) {
    return <>{children}</>;
  }

  return (
    <main className={styles.page} data-maintenance-page>
      <section className={styles.card} aria-labelledby="maintenance-title">
        <p className={styles.kicker}>B.Grumpy Tattoo</p>
        <span className={styles.mark} aria-hidden="true">✦</span>
        <h1 className={styles.title} id="maintenance-title">En cours de maintenance</h1>
        <p className={styles.text}>
          Le site est en préparation. Les demandes de devis restent ouvertes depuis le lien dédié.
        </p>
        <Link className={styles.button} href="/devis">
          Accéder à la demande de devis
          <span aria-hidden="true">→</span>
        </Link>
      </section>
    </main>
  );
}
