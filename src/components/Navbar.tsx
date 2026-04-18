"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/", label: "Accueil", icon: HomeIcon },
  { href: "/flash", label: "Flashs", icon: FlashIcon },
  { href: "/simulateur", label: "Simulateur", icon: SimulatorIcon },
  { href: "/devis", label: "Devis", icon: QuoteIcon },
  { href: "/profil", label: "Profil", icon: ProfileIcon },
] as const;

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
                className={`relative flex min-h-16 flex-col items-center justify-center gap-1.5 rounded-full px-4 py-3 transition-all duration-300 ${
                  active ? "scale-[1.02]" : ""
                }`}
              >
                {active && (
                  <>
                    {/* capsule active */}
                    <div
                      className="
                        absolute inset-0 rounded-full
                        bg-white/[0.62]
                        backdrop-blur-[20px]
                        shadow-[inset_0_1px_0_rgba(255,255,255,0.55),0_8px_26px_rgba(0,0,0,0.10)]
                      "
                    />

                    {/* reflet capsule */}
                    <div
                      className="pointer-events-none absolute inset-[1px] rounded-full"
                      style={{
                        background:
                          "linear-gradient(to bottom, rgba(255,255,255,0.58), rgba(255,255,255,0.18) 42%, rgba(255,255,255,0.08))",
                      }}
                    />

                    {/* petit contour clair capsule */}
                    <div className="pointer-events-none absolute inset-0 rounded-full ring-1 ring-inset ring-white/35" />
                  </>
                )}

                <Icon
                  className={`relative z-10 h-7 w-7 ${
                    active ? "text-[#11130f]" : "text-white/70"
                  }`}
                />

                <span
                  className={`relative z-10 text-sm ${
                    active ? "text-[#11130f]" : "text-white/70"
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

function HomeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true" fill="none">
      <path
        d="M4 10.7 12 4l8 6.7V20a1 1 0 0 1-1 1h-5v-6h-4v6H5a1 1 0 0 1-1-1v-9.3Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function FlashIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true" fill="none">
      <path
        d="M13 3 5.8 13h5.3L10 21l8.2-11h-5.5L13 3Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SimulatorIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true" fill="none">
      <path
        d="M7 3h10a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M9 7h6M9 11h2M13 11h2M9 15h2M13 15h2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function QuoteIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true" fill="none">
      <path
        d="M5 5h14v10H8l-3 3V5Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M8 9h8M8 12h5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ProfileIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true" fill="none">
      <path
        d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M4.5 21a7.5 7.5 0 0 1 15 0"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
