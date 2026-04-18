import Image from "next/image";
import Link from "next/link";
import { heroImages, processSteps } from "@/src/data/site";

export default function BrandSection() {
  return (
    <section className="section-space bg-[color:var(--ink)] text-[color:var(--paper)]">
      <div className="container-wide grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div>
          <p className="text-sm font-bold uppercase text-[color:var(--mineral)]">Éthique</p>
          <h2 className="mt-4 text-3xl font-black leading-tight sm:text-4xl">
            Une demande claire, une réponse pensée, une pièce qui garde sa présence.
          </h2>
          <p className="mt-5 max-w-xl text-base leading-7 text-white/68">
            Le studio privilégie l’échange utile, les références précises et une direction visuelle assumée. Pas de vente impulsive, pas de tunnel automatique.
          </p>
          <Link href="/devis" className="btn btn-secondary mt-8">
            Envoyer mon projet
          </Link>
        </div>

        <div className="grid gap-5 sm:grid-cols-[0.8fr_1fr]">
          <div className="glass-frame relative min-h-96 overflow-hidden">
            <Image
              src={heroImages.secondary.src}
              alt={heroImages.secondary.alt}
              fill
              sizes="(min-width: 1024px) 390px, 100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          </div>

          <div className="grid gap-4">
            {processSteps.map((step, index) => (
              <div key={step.title} className="glass-card glass-card-dark p-5">
                <p className="text-sm font-bold text-[color:var(--mineral)]">0{index + 1}</p>
                <h3 className="mt-3 text-xl font-black">{step.title}</h3>
                <p className="mt-3 text-sm leading-7 text-white/65">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
