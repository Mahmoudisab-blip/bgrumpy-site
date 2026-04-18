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
          relative w-full max-w-[1400px] overflow-hidden
          rounded-[44px] px-4 py-4
          backdrop-blur-[28px] backdrop-saturate-[155%]
        "
        style={{
          background:
            "linear-gradient(to bottom, rgba(116,170,142,0.32), rgba(78,127,102,0.28))",
          boxShadow:
            "0 10px 30px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.08)",
        }}
      >
        {/* base glass */}
        <div className="pointer-events-none absolute inset-0 rounded-[44px] bg-white/[0.03]" />

        {/* thin bright outline */}
        <div className="pointer-events-none absolute inset-0 rounded-[44px] ring-1 ring-inset ring-white/22" />

        {/* top glossy reflection */}
        <div
          className="pointer-events-none absolute left-6 right-6 top-[2px] h-10 rounded-full blur-xl"
          style={{
            background:
              "linear-gradient(to right, rgba(255,255,255,0.02), rgba(255,255,255,0.18), rgba(255,255,255,0.02))",
          }}
        />

        {/* inner liquid veil */}
        <div
          className="pointer-events-none absolute inset-[1px] rounded-[43px]"
          style={{
            background:
              "linear-gradient(to bottom, rgba(255,255,255,0.14), rgba(255,255,255,0.05) 26%, rgba(255,255,255,0.015) 58%, rgba(255,255,255,0.04) 100%)",
          }}
        />

        <div className="relative z-10 grid grid-cols-5 gap-3">
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
                  className={`relative flex w-full flex-col items-center justify-center rounded-[34px] px-4 py-5 transition-all duration-300 ${
                    active ? "scale-[1.01]" : ""
                  }`}
                >
                  {active && (
                    <>
                      {/* active white pill */}
                      <div
                        className="absolute inset-0 rounded-[34px] backdrop-blur-[18px]"
                        style={{
                          background:
                            "linear-gradient(to bottom, rgba(255,255,255,0.96), rgba(252,254,253,0.92) 52%, rgba(240,248,243,0.88) 100%)",
                          boxShadow:
                            "inset 0 1px 0 rgba(255,255,255,0.95), inset 0 -1px 0 rgba(255,255,255,0.20), 0 0 0 1px rgba(255,255,255,0.18), 0 8px 22px rgba(255,255,255,0.04)",
                        }}
                      />

                      {/* active glossy overlay */}
                      <div
                        className="pointer-events-none absolute inset-[1px] rounded-[33px]"
                        style={{
                          background:
                            "linear-gradient(to bottom, rgba(255,255,255,0.55), rgba(255,255,255,0.12) 34%, rgba(255,255,255,0.03) 72%, rgba(255,255,255,0.06) 100%)",
                        }}
                      />

                      {/* soft highlight on top-left */}
                      <div
                        className="pointer-events-none absolute left-5 top-3 h-6 w-20 rounded-full blur-md"
                        style={{
                          background:
                            "linear-gradient(to right, rgba(255,255,255,0.50), rgba(255,255,255,0.10))",
                        }}
                      />
                    </>
                  )}

                  <Icon
                    className={`relative z-10 mb-3 h-8 w-8 shrink-0 ${
                      active ? "text-black" : "text-white/95"
                    }`}
                    strokeWidth={2.15}
                  />

                  <span
                    className={`relative z-10 truncate text-center text-[19px] leading-none ${
                      active ? "font-medium text-black" : "font-normal text-white/95"
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