"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import styles from "./MaintenanceGate.module.css";

type MaintenanceGateProps = {
  children: ReactNode;
};

const isAdminPath = (pathname: string | null) => pathname?.startsWith("/admin");
const isPublicQuotePath = (pathname: string | null) => pathname === "/devis";

export default function MaintenanceGate({ children }: MaintenanceGateProps) {
  const pathname = usePathname();

  if (isAdminPath(pathname) || isPublicQuotePath(pathname)) {
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
