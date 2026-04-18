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

const tabs = [
  { href: "/", label: "Accueil", icon: House },
  { href: "/flashs", label: "Flashs", icon: Zap },
  { href: "/simulateur", label: "Simulateur", icon: ClipboardList },
  { href: "/devis", label: "Devis", icon: MessageSquareText },
  { href: "/profil", label: "Profil", icon: UserRound },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <div className="fixed inset-x-0 bottom-5 z-50 flex justify-center px-4">
      <nav
        className="
          relative w-full max-w-6xl overflow-hidden rounded-[2.5rem]
          px-3 py-3
          backdrop-blur-[32px] backdrop-saturate-[180%]
          shadow-[0_12px_40px_rgba(0,0,0,0.10)]
        "
        style={{
          background:
            "linear-gradient(to bottom, rgba(255,255,255,0.10), rgba(255,255,255,0.04) 45%, rgba(255,255,255,0.03))",
        }}
      >
        <div className="pointer-events-none absolute inset-0 rounded-[2.5rem] bg-white/[0.03]" />

        <div className="pointer-events-none absolute inset-0 rounded-[2.5rem] ring-1 ring-inset ring-white/18" />

        <div
          className="pointer-events-none absolute inset-x-6 top-[2px] h-10 rounded-full blur-xl"
          style={{
            background:
              "linear-gradient(to right, rgba(255,255,255,0.04), rgba(255,255,255,0.18), rgba(255,255,255,0.04))",
          }}
        />

        <div
          className="pointer-events-none absolute inset-[1px] rounded-[calc(2.5rem-1px)]"
          style={{
            background:
              "linear-gradient(to bottom, rgba(255,255,255,0.18), rgba(255,255,255,0.06) 24%, rgba(255,255,255,0.02) 55%, rgba(255,255,255,0.05) 100%)",
          }}
        />

        <div className="relative z-10 grid grid-cols-5 gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active =
              pathname === tab.href ||
              (tab.href !== "/" && pathname.startsWith(tab.href));

            return (
              <Link
                key={tab.href}
                href={tab.href}
                className="relative flex min-w-0 items-stretch justify-center"
              >
                <div
                  className={`relative flex w-full flex-col items-center justify-center rounded-[2rem] px-3 py-4 transition-all duration-300 ${
                    active ? "scale-[1.01]" : ""
                  }`}
                >
                  {active && (
                    <>
                      <div
                        className="absolute inset-0 rounded-[2rem] backdrop-blur-[22px]"
                        style={{
                          background:
                            "linear-gradient(to bottom, rgba(255,255,255,0.96), rgba(255,255,255,0.88) 55%, rgba(248,252,249,0.82))",
                          boxShadow:
                            "inset 0 1px 0 rgba(255,255,255,0.95), inset 0 -1px 0 rgba(255,255,255,0.22), 0 0 0 1px rgba(255,255,255,0.22), 0 8px 24px rgba(255,255,255,0.06)",
                        }}
                      />

                      <div
                        className="pointer-events-none absolute inset-[1px] rounded-[calc(2rem-1px)]"
                        style={{
                          background:
                            "linear-gradient(to bottom, rgba(255,255,255,0.55), rgba(255,255,255,0.16) 36%, rgba(255,255,255,0.04) 72%, rgba(255,255,255,0.08))",
                        }}
                      />

                      <div
                        className="pointer-events-none absolute left-4 top-2 h-5 w-16 rounded-full blur-md"
                        style={{
                          background:
                            "linear-gradient(to right, rgba(255,255,255,0.55), rgba(255,255,255,0.14))",
                        }}
                      />
                    </>
                  )}

                  <Icon
                    className={`relative z-10 mb-2 h-7 w-7 shrink-0 ${
                      active ? "text-black" : "text-white/90"
                    }`}
                    strokeWidth={2.2}
                  />

                  <span
                    className={`relative z-10 truncate text-center text-[17px] leading-none ${
                      active ? "font-medium text-black" : "font-normal text-white/92"
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