"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  House,
  Zap,
  ClipboardList,
  MessageSquareText,
  UserRound,
} from "lucide-react";
import styles from "./Navbar.module.css";

const tabs = [
  { href: "/", label: "Accueil", icon: House },
  { href: "/flash", label: "Flashs", icon: Zap },
  { href: "/simulateur", label: "Simulateur", icon: ClipboardList },
  { href: "/devis", label: "Devis", icon: MessageSquareText },
  { href: "/profil", label: "Profil", icon: UserRound },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <div className={styles.wrapper}>
      <nav className={styles.navbar}>
        <div className={styles.edgeFlow} />
        <div className={styles.edgeFlowBottom} />
        <div className={styles.row}>
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active =
              pathname === tab.href ||
              (tab.href !== "/" && pathname.startsWith(tab.href));

            return (
              <Link key={tab.href} href={tab.href} className={styles.link}>
                <div className={`${styles.tab} ${active ? styles.tabActive : ""}`}>
                  <span className={styles.tabContent}>
                    <Icon
                      className={`${styles.icon} ${active ? styles.iconActive : ""}`}
                      strokeWidth={1.6}
                    />
                    <span
                      className={`${styles.label} ${
                        active ? styles.labelActive : ""
                      }`}
                    >
                      {tab.label}
                    </span>
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
