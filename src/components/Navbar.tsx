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
    href: "/portfolio",
    label: "Tatouages réalisés",
    shortLabel: "Réalisés",
    icon: "portfolio",
  },
  {
    href: "/flash",
    label: "Flashs dispos",
    shortLabel: "Flashs",
    icon: "flash",
  },
  {
    href: "/devis",
    label: "Simulateur & devis",
    shortLabel: "Devis",
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
      className="fixed inset-x-0 bottom-0 z-50 border-t border-neutral-200 bg-white/95 px-2 pb-[calc(0.6rem_+_env(safe-area-inset-bottom))] pt-2 shadow-[0_-10px_35px_rgba(16,16,16,0.12)] backdrop-blur-xl"
    >
      <ul className="mx-auto grid max-w-3xl grid-cols-5 gap-1">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(`${item.href}/`));

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={`flex min-h-16 flex-col items-center justify-center gap-1 rounded-lg px-1 text-center text-[0.68rem] font-bold leading-tight transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d72d2d] sm:text-xs ${
                  isActive
                    ? "bg-[#101010] text-white shadow-[0_8px_22px_rgba(16,16,16,0.22)]"
                    : "text-neutral-500 hover:bg-neutral-100 hover:text-neutral-950"
                }`}
              >
                <NavIcon name={item.icon} />
                <span className="block max-w-full">
                  {"shortLabel" in item ? (
                    <>
                      <span className="sm:hidden">{item.shortLabel}</span>
                      <span className="hidden sm:inline">{item.label}</span>
                    </>
                  ) : (
                    item.label
                  )}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function NavIcon({ name }: { name: NavIconName }) {
  const sharedClasses = "h-5 w-5 sm:h-6 sm:w-6";

  if (name === "home") {
    return (
      <svg className={sharedClasses} viewBox="0 0 24 24" aria-hidden="true" fill="none">
        <path d="M4 10.7 12 4l8 6.7V20a1 1 0 0 1-1 1h-5v-6h-4v6H5a1 1 0 0 1-1-1v-9.3Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      </svg>
    );
  }

  if (name === "portfolio") {
    return (
      <svg className={sharedClasses} viewBox="0 0 24 24" aria-hidden="true" fill="none">
        <path d="M5 4h14a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1Z" stroke="currentColor" strokeWidth="1.8" />
        <path d="M7.5 15.5 10.2 12l2.1 2.5 1.8-2.2 2.4 3.2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M8.4 8.2h.1" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
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
