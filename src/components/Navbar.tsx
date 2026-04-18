"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  {
    href: "/",
    label: "Accueil",
    icon: "home",
  },
  {
    href: "/flash",
    label: "Flashs dispos",
    shortLabel: "Flashs",
    icon: "flash",
  },
  {
    href: "/simulateur",
    label: "Simulateur",
    icon: "simulator",
  },
  {
    href: "/devis",
    label: "Devis",
    icon: "quote",
  },
  {
    href: "/profil",
    label: "Profil",
    icon: "profile",
  },
] as const;

type NavIconName = (typeof navItems)[number]["icon"];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Navigation principale"
      className="glass-nav fixed bottom-[calc(1.25rem_+_env(safe-area-inset-bottom))] left-1/2 z-50 w-[calc(100%_-_1.5rem)] max-w-[430px] -translate-x-1/2 px-3 py-2"
    >
      <ul className="grid grid-cols-5 gap-1">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(`${item.href}/`));

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-label={item.label}
                aria-current={isActive ? "page" : undefined}
                className={`glass-nav-link relative flex h-14 items-center justify-center px-1 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--paper-glow)] ${
                  isActive ? "glass-nav-link-active" : ""
                }`}
              >
                <NavIcon name={item.icon} />
                <span className="sr-only">{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function NavIcon({ name }: { name: NavIconName }) {
  const sharedClasses = "h-7 w-7";

  if (name === "home") {
    return (
      <svg className={sharedClasses} viewBox="0 0 24 24" aria-hidden="true" fill="none">
        <path d="M4 10.7 12 4l8 6.7V20a1 1 0 0 1-1 1h-5v-6h-4v6H5a1 1 0 0 1-1-1v-9.3Z" fill="currentColor" opacity="0.94" />
      </svg>
    );
  }

  if (name === "flash") {
    return (
      <svg className={sharedClasses} viewBox="0 0 24 24" aria-hidden="true" fill="none">
        <path d="M13 3 5.8 13h5.3L10 21l8.2-11h-5.5L13 3Z" fill="currentColor" opacity="0.92" />
        <path d="M18 4v5M15.5 6.5h5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }

  if (name === "simulator") {
    return (
      <svg className={sharedClasses} viewBox="0 0 24 24" aria-hidden="true" fill="none">
        <path d="M5 6a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6Z" stroke="currentColor" strokeWidth="2" />
        <path d="M8 15.2 10.4 13l2 1.8L16.2 11 19 13.7V18H5v-1.6l3-1.2Z" fill="currentColor" opacity="0.86" />
      </svg>
    );
  }

  if (name === "quote") {
    return (
      <svg className={sharedClasses} viewBox="0 0 24 24" aria-hidden="true" fill="none">
        <path d="M6 4h9.5L19 7.5V20H6V4Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        <path d="M15.5 4V8H19M9 10h6M9 13h5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="m14.5 17.3 2.7-2.7 1.5 1.5-2.7 2.7-2 .5.5-2Z" fill="currentColor" opacity="0.9" />
      </svg>
    );
  }

  return (
    <svg className={sharedClasses} viewBox="0 0 24 24" aria-hidden="true" fill="none">
      <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" fill="currentColor" opacity="0.92" />
      <path d="M4.8 21a7.2 7.2 0 0 1 14.4 0" fill="currentColor" opacity="0.92" />
    </svg>
  );
}
