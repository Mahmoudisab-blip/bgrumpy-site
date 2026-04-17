import type { Metadata } from "next";
import Link from "next/link";
import FlashGrid from "@/src/components/FlashGrid";
import SectionHeading from "@/src/components/SectionHeading";
import { flashItems } from "@/src/data/flashItems";

export const metadata: Metadata = {
  title: "Flashs et projets disponibles",
  description:
    "Flashs B.Grumpy Tattoo disponibles ou en étude. Envoyez une demande de flash sans panier, paiement ou réservation automatique.",
};

export default function FlashPage() {
  return (
    <>
      <section className="border-b hairline bg-[color:var(--paper)] py-16">
        <div className="container-wide grid gap-8 lg:grid-cols-[0.9fr_0.45fr] lg:items-end">
          <SectionHeading
            eyebrow="Flashs"
            title="Des motifs disponibles à demander, pas à acheter en ligne."
            description="Chaque flash est une base artistique. La demande permet de vérifier la zone, la taille, le budget et la cohérence avant de poursuivre."
          />
          <div className="subtle-panel p-5">
            <p className="eyebrow">Important</p>
            <p className="mt-3 text-sm leading-7 text-[color:var(--muted)]">
              Aucun panier, aucun paiement, aucun calendrier automatique. Vous envoyez une demande structurée, le studio répond après analyse.
            </p>
          </div>
        </div>
      </section>

      <section className="section-space">
        <div className="container-wide">
          <FlashGrid items={flashItems} />

          <div className="mt-12 grid gap-5 border-t hairline pt-8 md:grid-cols-3">
            <div>
              <p className="font-black text-[color:var(--ink)]">Disponible</p>
              <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">
                Le motif peut faire l’objet d’une demande.
              </p>
            </div>
            <div>
              <p className="font-black text-[color:var(--ink)]">En étude</p>
              <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">
                Une demande est déjà en cours de discussion.
              </p>
            </div>
            <div>
              <p className="font-black text-[color:var(--ink)]">Réservé</p>
              <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">
                Le motif n’est plus proposé tel quel.
              </p>
            </div>
          </div>

          <div className="mt-10">
            <Link href="/devis" className="btn btn-primary">
              Faire une demande de flash
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
