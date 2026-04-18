"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Zap,
  ClipboardList,
  MessageSquare,
  User,
} from "lucide-react";

const tabs = [
  { href: "/", label: "Accueil", icon: Home },
  { href: "/flashs", label: "Flashs", icon: Zap },
  { href: "/simulateur", label: "Simulateur", icon: ClipboardList },
  { href: "/devis", label: "Devis", icon: MessageSquare },
  { href: "/profil", label: "Profil", icon: User },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-5 left-1/2 z-50 w-full max-w-5xl -translate-x-1/2 px-4">
      <div
        className="
          relative flex items-center justify-between gap-1 overflow-hidden rounded-full
          px-2 py-2
          bg-white/[0.02]
          backdrop-blur-[30px] backdrop-saturate-[180%]
          shadow-[0_10px_30px_rgba(0,0,0,0.10)]
        "
      >
        {/* voile global très léger */}
        <div className="pointer-events-none absolute inset-0 rounded-full bg-white/[0.015]" />

        {/* reflet global */}
        <div
          className="pointer-events-none absolute inset-[1px] rounded-full"
          style={{
            background:
              "linear-gradient(to bottom, rgba(255,255,255,0.18), rgba(255,255,255,0.05) 30%, rgba(255,255,255,0.01) 60%)",
          }}
        />

        {/* contour lumineux très subtil, sans bord noir */}
        <div className="pointer-events-none absolute inset-0 rounded-full ring-1 ring-inset ring-white/8" />

        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active =
            pathname === tab.href ||
            (tab.href !== "/" && pathname.startsWith(tab.href));

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="relative flex flex-1 justify-center"
            >
              <div
                className={`relative flex items-center gap-2 rounded-full px-4 py-3 transition-all duration-300 ${
                  active ? "scale-[1.02]" : ""
                }`}
              >
                {active && (
                  <>
                    {/* capsule active */}
                    <div
                      className="
                        absolute inset-0 rounded-full
                        bg-white/[0.06]
                        backdrop-blur-[20px]
                        shadow-[inset_0_1px_0_rgba(255,255,255,0.22)]
                      "
                    />

                    {/* reflet capsule */}
                    <div
                      className="pointer-events-none absolute inset-[1px] rounded-full"
                      style={{
                        background:
                          "linear-gradient(to bottom, rgba(255,255,255,0.24), rgba(255,255,255,0.05) 40%, rgba(255,255,255,0.02))",
                      }}
                    />

                    {/* petit contour clair capsule */}
                    <div className="pointer-events-none absolute inset-0 rounded-full ring-1 ring-inset ring-white/10" />
                  </>
                )}

                <Icon
                  className={`relative z-10 h-5 w-5 ${
                    active ? "text-white" : "text-white/70"
                  }`}
                  strokeWidth={2}
                />

                <span
                  className={`relative z-10 text-sm ${
                    active ? "text-white" : "text-white/70"
                  }`}
                >
                  {tab.label}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}