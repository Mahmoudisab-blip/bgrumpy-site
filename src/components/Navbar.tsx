"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  House,
  Zap,
  ClipboardList,
  HelpCircle,
  Images,
  MessageSquareText,
  UserRound,
} from "lucide-react";
import {
  countClientUnreadMessages,
  getScopedMessagerieStorageKey,
  messagerieStorageEventName,
  type StoredMessagerie,
} from "@/src/lib/messagerieStorage";
import styles from "./Navbar.module.css";

const tabs = [
  { href: "/", label: "Accueil", icon: House },
  { href: "/flash", label: "Flashs", icon: Zap },
  { href: "/devis", label: "Devis", icon: ClipboardList },
  { href: "/messagerie", label: "Messagerie", icon: MessageSquareText },
  { href: "/profil", label: "Profil", icon: UserRound },
];

const desktopTabs = [
  { href: "/portfolio", label: "Réalisations", icon: Images },
  { href: "/flash", label: "Flashs", icon: Zap },
  { href: "/devis", label: "Devis", icon: ClipboardList },
  { href: "/faq", label: "FAQ", icon: HelpCircle },
];

export default function Navbar() {
  const pathname = usePathname();
  const [unreadMessages, setUnreadMessages] = useState(0);
  const isAdmin = pathname?.startsWith("/admin");
  const isHome = pathname === "/";
  const visibleTabs = isAdmin
    ? [{ ...tabs[0], href: "/admin", label: "Tableau de bord" }, ...tabs.slice(1)]
    : tabs;

  useEffect(() => {
    const refreshUnreadMessages = () => {
      try {
        const raw = window.localStorage.getItem(getScopedMessagerieStorageKey());
        const parsed = raw ? (JSON.parse(raw) as Partial<StoredMessagerie>) : {};

        setUnreadMessages(countClientUnreadMessages(parsed));
      } catch {
        setUnreadMessages(0);
      }
    };

    refreshUnreadMessages();
    window.addEventListener("storage", refreshUnreadMessages);
    window.addEventListener(messagerieStorageEventName, refreshUnreadMessages);
    window.addEventListener("focus", refreshUnreadMessages);

    return () => {
      window.removeEventListener("storage", refreshUnreadMessages);
      window.removeEventListener(messagerieStorageEventName, refreshUnreadMessages);
      window.removeEventListener("focus", refreshUnreadMessages);
    };
  }, []);

  return (
    <div className={`${styles.wrapper} ${isHome ? styles.homeWrapper : ""}`}>
      <nav
        className={`${styles.desktopNavbar} ${isHome ? styles.homeDesktopNavbar : ""}`}
        aria-label="Navigation principale"
      >
        <Link href="/" className={styles.desktopBrand} aria-label="B.Grumpy Tattoo, accueil">
          <span>B.Grumpy</span>
          <small>TATOUAGE</small>
        </Link>

        <div className={styles.desktopLinks}>
          {desktopTabs.map((tab) => {
            const Icon = tab.icon;
            const active = pathname === tab.href || pathname.startsWith(`${tab.href}/`);

            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`${styles.desktopLink} ${active ? styles.desktopLinkActive : ""}`}
              >
                <Icon strokeWidth={1.7} aria-hidden />
                <span>{tab.label}</span>
              </Link>
            );
          })}
        </div>

        <div className={styles.desktopActions}>
          <Link href="/messagerie" className={styles.desktopIconLink} aria-label="Ouvrir la messagerie">
            <MessageSquareText strokeWidth={1.7} aria-hidden />
            {unreadMessages > 0 ? (
              <span className={styles.desktopBadge} aria-label={`${unreadMessages} message${unreadMessages > 1 ? "s" : ""} non lu${unreadMessages > 1 ? "s" : ""}`}>
                {unreadMessages > 9 ? "9+" : unreadMessages}
              </span>
            ) : null}
          </Link>
          <Link href="/profil" className={styles.desktopIconLink} aria-label="Ouvrir mon profil">
            <UserRound strokeWidth={1.7} aria-hidden />
          </Link>
          <Link href="/devis" className={styles.desktopCta}>
            Demander un devis
          </Link>
        </div>
      </nav>

      <nav
        className={`${styles.navbar} ${isHome ? styles.homeNavbar : ""}`}
        aria-label="Navigation mobile"
      >
        <div className={styles.row}>
          {visibleTabs.map((tab) => {
            const Icon = tab.icon;
            const active =
              pathname === tab.href ||
              (tab.href !== "/" && pathname.startsWith(tab.href));

            return (
              <Link key={tab.href} href={tab.href} className={styles.link}>
                <div className={`${styles.tab} ${active ? styles.tabActive : ""}`}>
                  <Icon
                    className={`${styles.icon} ${active ? styles.iconActive : ""}`}
                    strokeWidth={1.65}
                  />
                  {tab.href === "/messagerie" && unreadMessages > 0 ? (
                    <span className={styles.badge} aria-label={`${unreadMessages} message${unreadMessages > 1 ? "s" : ""} non lu${unreadMessages > 1 ? "s" : ""}`}>
                      {unreadMessages > 9 ? "9+" : unreadMessages}
                    </span>
                  ) : null}

                  <span
                    className={`${styles.label} ${
                      active ? styles.labelActive : ""
                    }`}
                  >
                    {tab.label}
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
