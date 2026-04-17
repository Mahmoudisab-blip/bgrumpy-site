"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { navLinks, studioInfo } from "@/src/data/site";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b hairline bg-[rgba(255,253,248,0.78)] backdrop-blur-xl">
      <div className="container-wide flex items-center justify-between py-4">
        <Link
          href="/"
          className="flex flex-col leading-none"
          onClick={() => setOpen(false)}
          aria-label="Accueil B.Grumpy Tattoo"
        >
          <span className="text-base font-black uppercase text-[color:var(--ink)]">
            {studioInfo.name}
          </span>
          <span className="mt-1 hidden text-xs font-medium text-[color:var(--muted)] sm:inline">
            Studio privé
          </span>
        </Link>

        <nav className="hidden items-center gap-6 lg:flex" aria-label="Navigation principale">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-semibold transition hover:text-[color:var(--ink)] ${
                pathname === link.href ? "text-[color:var(--ink)]" : "text-[color:var(--muted)]"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <Link href="/devis" className="btn btn-primary px-4 py-2">
            Demander un devis
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="inline-flex h-11 w-11 items-center justify-center rounded-lg border hairline bg-[color:var(--paper)] text-[color:var(--ink)] shadow-sm transition hover:border-[color:var(--ink)] lg:hidden"
          aria-expanded={open}
          aria-controls="mobile-navigation"
          aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
        >
          <span aria-hidden="true" className="grid gap-1">
            <span className={`block h-0.5 w-5 bg-current transition ${open ? "translate-y-1.5 rotate-45" : ""}`} />
            <span className={`block h-0.5 w-5 bg-current transition ${open ? "opacity-0" : ""}`} />
            <span className={`block h-0.5 w-5 bg-current transition ${open ? "-translate-y-1.5 -rotate-45" : ""}`} />
          </span>
        </button>
      </div>

      {open ? (
        <div id="mobile-navigation" className="border-t hairline bg-[rgba(255,253,248,0.96)] pb-5 lg:hidden">
          <nav className="container-wide flex flex-col gap-2 pt-4" aria-label="Navigation mobile">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={`rounded-lg px-4 py-3 text-sm font-semibold transition hover:bg-[color:var(--paper-soft)] ${
                  pathname === link.href ? "bg-[color:var(--paper-soft)] text-[color:var(--ink)]" : "text-[color:var(--muted)]"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Link href="/devis" onClick={() => setOpen(false)} className="btn btn-primary mt-2">
              Demander un devis
            </Link>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
