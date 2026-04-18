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
      className="fixed bottom-[calc(1rem_+_env(safe-area-inset-bottom))] left-1/2 z-50 w-[calc(100%_-_1rem)] max-w-3xl -translate-x-1/2 rounded-lg border border-neutral-200 bg-white/92 p-1.5 shadow-[0_18px_45px_rgba(16,16,16,0.18)] backdrop-blur-xl"
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
