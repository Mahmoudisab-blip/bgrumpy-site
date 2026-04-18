import Link from "next/link";
import { navLinks, studioInfo } from "@/src/data/site";

export default function Footer() {
  return (
    <footer className="border-t hairline bg-[color:var(--ink)] text-[color:var(--paper)]">
      <div className="container-wide grid gap-10 py-12 lg:grid-cols-[1.2fr_0.8fr_0.8fr]">
        <div>
          <p className="text-lg font-black uppercase">{studioInfo.name}</p>
          <p className="mt-4 max-w-md text-sm leading-7 text-white/70">
            Studio privé de tatouage à Villiers-sur-Morin. Demandes de projets personnalisés et flashs étudiées avec soin, sans paiement ni calendrier automatique.
          </p>
        </div>

        <div>
          <p className="text-sm font-bold text-white">Navigation</p>
          <div className="mt-4 grid gap-3">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} className="text-sm text-white/68 transition hover:text-white">
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm font-bold text-white">Contact</p>
          <div className="mt-4 space-y-3 text-sm leading-6 text-white/68">
            <p>{studioInfo.location}</p>
            <p>{studioInfo.email}</p>
            <p>{studioInfo.phone}</p>
          </div>
          <Link href="/devis" className="btn btn-secondary mt-6">
            Envoyer mon projet
          </Link>
        </div>
      </div>

      <div className="border-t border-white/10 py-4">
        <div className="container-wide flex flex-col gap-2 text-xs text-white/50 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 {studioInfo.name}. Tous droits réservés.</p>
          <p>Demande de devis uniquement, pas de vente en ligne.</p>
        </div>
      </div>
    </footer>
  );
}
