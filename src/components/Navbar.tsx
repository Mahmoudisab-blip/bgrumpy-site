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
    <header className="fixed bottom-[calc(1rem_+_env(safe-area-inset-bottom))] left-0 right-0 z-50 px-3 sm:px-5">
      <nav
        aria-label="Navigation principale"
        className="liquid-nav mx-auto w-full max-w-[430px] px-2 py-2 sm:max-w-[520px] sm:px-3"
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
                  className={`liquid-nav-link flex h-14 items-center justify-center transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--paper-glow)] ${
                    isActive ? "liquid-nav-link-active" : ""
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
    </header>
  );
}

function NavIcon({ name }: { name: NavIconName }) {
  const sharedClasses = "h-5 w-5";

  if (name === "home") {
    return (
      <svg className={sharedClasses} viewBox="0 0 24 24" aria-hidden="true" fill="none">
        <path d="M4 10.7 12 4l8 6.7V20a1 1 0 0 1-1 1h-5v-6h-4v6H5a1 1 0 0 1-1-1v-9.3Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      </svg>
    );
  }

  if (name === "flash") {
    return (
      <svg className={sharedClasses} viewBox="0 0 24 24" aria-hidden="true" fill="none">
        <path d="M13 3 5.8 13h5.3L10 21l8.2-11h-5.5L13 3Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (name === "simulator") {
    return (
      <svg className={sharedClasses} viewBox="0 0 24 24" aria-hidden="true" fill="none">
        <path d="M6 3h12a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" stroke="currentColor" strokeWidth="1.8" />
        <path d="M8 7h8M8 11h2M12 11h2M16 11h.1M8 15h2M12 15h2M16 15h.1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    );
  }

  if (name === "quote") {
    return (
      <svg className={sharedClasses} viewBox="0 0 24 24" aria-hidden="true" fill="none">
        <path d="M5 5h14v10H8l-3 3V5Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
        <path d="M8 9h8M8 12h5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    );
  }

  return (
    <svg className={sharedClasses} viewBox="0 0 24 24" aria-hidden="true" fill="none">
      <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" stroke="currentColor" strokeWidth="1.8" />
      <path d="M4.5 21a7.5 7.5 0 0 1 15 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
