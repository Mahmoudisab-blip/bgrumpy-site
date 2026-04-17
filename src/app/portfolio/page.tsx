import type { Metadata } from "next";
import Link from "next/link";
import PortfolioGrid from "@/src/components/PortfolioGrid";
import SectionHeading from "@/src/components/SectionHeading";
import { portfolioItems } from "@/src/data/portfolioItems";

export const metadata: Metadata = {
  title: "Portfolio",
  description:
    "Portfolio B.Grumpy Tattoo : pièces noires, blackwork fin, compositions organiques et projets de tatouage sur mesure.",
};

const categories = Array.from(new Set(portfolioItems.map((item) => item.category)));

export default function PortfolioPage() {
  return (
    <>
      <section className="border-b hairline bg-[color:var(--paper)] py-16">
        <div className="container-wide grid gap-8 lg:grid-cols-[0.9fr_0.45fr] lg:items-end">
          <SectionHeading
            eyebrow="Portfolio"
            title="Une sélection de pièces noires, sobres et organiques."
            description="Le portfolio donne une direction : contraste, peau, composition et motifs qui gardent de la tenue sans surcharge."
          />
          <div className="subtle-panel p-5">
            <p className="eyebrow">Lecture</p>
            <p className="mt-3 text-sm leading-7 text-[color:var(--muted)]">
              Les images servent d’inspiration. Chaque projet personnel est étudié selon la zone, la taille et l’intention.
            </p>
          </div>
        </div>
      </section>

      <section className="section-space">
        <div className="container-wide">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <span key={category} className="rounded-md border hairline bg-[color:var(--paper)] px-3 py-2 text-sm font-semibold text-[color:var(--muted)]">
                {category}
              </span>
            ))}
          </div>

          <div className="mt-10">
            <PortfolioGrid items={portfolioItems} />
          </div>

          <div className="mt-12 flex flex-col gap-4 border-t hairline pt-8 sm:flex-row sm:items-center sm:justify-between">
            <p className="max-w-2xl text-sm leading-7 text-[color:var(--muted)]">
              Vous avez une idée proche d’une pièce du portfolio ? Envoyez votre projet avec vos références et votre budget maximum.
            </p>
            <Link href="/devis" className="btn btn-primary w-fit">
              Envoyer mon projet
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
