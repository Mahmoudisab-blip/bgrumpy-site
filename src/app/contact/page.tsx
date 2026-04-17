import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import SectionHeading from "@/src/components/SectionHeading";
import { heroImages, processSteps, studioInfo } from "@/src/data/site";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contact B.Grumpy Tattoo à Villiers-sur-Morin. Informations studio et demande de projet ou flash.",
};

export default function ContactPage() {
  return (
    <>
      <section className="border-b hairline bg-[color:var(--paper)] py-16">
        <div className="container-wide">
          <SectionHeading
            eyebrow="Contact"
            title="Un studio privé, accessible après demande étudiée."
            description="Pour un projet personnalisé ou un flash, le plus simple reste d’envoyer une demande complète. Pour une question courte, les informations du studio sont disponibles ci-dessous."
          />
        </div>
      </section>

      <section className="section-space">
        <div className="container-wide grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="panel p-6">
            <p className="eyebrow">Studio</p>
            <h2 className="mt-3 text-3xl font-black text-[color:var(--ink)]">{studioInfo.name}</h2>
            <div className="mt-8 space-y-6 text-sm leading-7 text-[color:var(--muted)]">
              <div>
                <p className="font-black text-[color:var(--ink)]">Adresse</p>
                <p>{studioInfo.location}</p>
              </div>
              <div>
                <p className="font-black text-[color:var(--ink)]">Email</p>
                <p>{studioInfo.email}</p>
              </div>
              <div>
                <p className="font-black text-[color:var(--ink)]">Téléphone</p>
                <p>{studioInfo.phone}</p>
              </div>
              <div>
                <p className="font-black text-[color:var(--ink)]">Fonctionnement</p>
                <p>Les projets sont étudiés avant tout échange détaillé. Les disponibilités indiquées dans le formulaire ne constituent pas une prise de créneau.</p>
              </div>
            </div>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/devis" className="btn btn-primary">
                Demander un devis
              </Link>
              <Link href="/faq" className="btn btn-secondary">
                Lire la FAQ
              </Link>
            </div>
          </div>

          <div className="grid gap-5">
            <div className="relative min-h-96 overflow-hidden rounded-lg border hairline bg-[color:var(--ink)]">
              <Image
                src={heroImages.main.src}
                alt={heroImages.main.alt}
                fill
                sizes="(min-width: 1024px) 620px, 100vw"
                className="object-cover opacity-[0.86]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/72 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <p className="text-sm font-bold uppercase text-[color:var(--mineral)]">B.Grumpy Tattoo</p>
                <p className="mt-3 max-w-lg text-2xl font-black leading-tight">
                  Un échange clair, une intention précise, une réponse après analyse.
                </p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {processSteps.map((step) => (
                <div key={step.title} className="subtle-panel p-5">
                  <p className="font-black text-[color:var(--ink)]">{step.title}</p>
                  <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
