import Image from "next/image";
import Link from "next/link";
import BrandSection from "@/src/components/BrandBanner";
import FeatureCard from "@/src/components/FeatureCard";
import FlashGrid from "@/src/components/FlashGrid";
import PortfolioGrid from "@/src/components/PortfolioGrid";
import SectionHeading from "@/src/components/SectionHeading";
import { flashItems } from "@/src/data/flashItems";
import { portfolioItems } from "@/src/data/portfolioItems";
import { heroImages, miniFaq, processSteps, studioInfo, studioStrengths } from "@/src/data/site";

export default function Home() {
  return (
    <>
      <section className="relative flex min-h-[68vh] items-end overflow-hidden bg-[color:var(--ink)] py-16 text-white">
        <Image
          src={heroImages.main.src}
          alt={heroImages.main.alt}
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-[0.62]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/58 to-black/8" />
        <div className="container-wide relative z-10">
          <div className="max-w-3xl">
            <p className="text-sm font-bold uppercase text-[color:var(--mineral)]">Studio privé de tatouage</p>
            <h1 className="mt-5 font-serif text-5xl font-bold leading-none sm:text-6xl lg:text-7xl">
              {studioInfo.name}
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/78">
              Un univers noir et gris, organique et sobre, pensé pour les projets de tatouage qui méritent du temps, du calme et une vraie direction.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/portfolio" className="btn border border-white bg-white text-[color:var(--ink)] hover:bg-[color:var(--paper-soft)]">
                Voir le portfolio
              </Link>
              <Link href="/devis" className="btn border border-white/36 bg-white/8 text-white hover:bg-white/14">
                Envoyer mon projet
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="section-space">
        <div className="container-wide grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <SectionHeading
              eyebrow="Studio privé"
              title="Une atmosphère calme, directe et haut de gamme."
              description="B.Grumpy Tattoo met l’accent sur une expérience rassurante : une demande claire, un échange humain et une proposition artistique construite autour de votre peau."
            />
            <div className="mt-8 grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
              <div className="border-l-4 border-[color:var(--sage)] pl-5">
                <p className="text-3xl font-black text-[color:var(--ink)]">Noir</p>
                <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">
                  Contraste, lisibilité et pièces pensées pour durer.
                </p>
              </div>
              <div className="border-l-4 border-[color:var(--sage)] pl-5">
                <p className="text-3xl font-black text-[color:var(--ink)]">Sage</p>
                <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">
                  Une présence naturelle, sobre, jamais froide.
                </p>
              </div>
              <div className="border-l-4 border-[color:var(--sage)] pl-5">
                <p className="text-3xl font-black text-[color:var(--ink)]">Privé</p>
                <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">
                  Pas de parcours automatisé, pas de vente en ligne.
                </p>
              </div>
            </div>
          </div>

          <div className="relative min-h-[520px] overflow-hidden rounded-lg border hairline bg-[color:var(--ink)] shadow-[0_24px_70px_rgba(21,21,18,0.14)]">
            <Image
              src={heroImages.secondary.src}
              alt={heroImages.secondary.alt}
              fill
              sizes="(min-width: 1024px) 560px, 100vw"
              className="object-cover opacity-[0.88]"
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/82 to-transparent p-6 text-white">
              <p className="text-sm font-bold uppercase text-[color:var(--mineral)]">Approche</p>
              <p className="mt-3 max-w-md text-2xl font-black leading-tight">
                Une pièce se construit avant l’aiguille : intention, zone, taille, références.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y hairline bg-[rgba(255,253,248,0.58)] py-14">
        <div className="container-wide grid gap-5 md:grid-cols-3">
          {studioStrengths.map((feature, index) => (
            <FeatureCard
              key={feature.title}
              kicker={`0${index + 1}`}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </div>
      </section>

      <section className="section-space">
        <div className="container-wide">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <SectionHeading
              eyebrow="Portfolio"
              title="Des pièces noires, lisibles et maîtrisées."
              description="Une sélection de projets pour saisir l’ambiance : lignes organiques, détails sobres et contraste graphique."
            />
            <Link href="/portfolio" className="btn btn-secondary w-fit">
              Explorer le portfolio
            </Link>
          </div>
          <div className="mt-10">
            <PortfolioGrid items={portfolioItems.slice(0, 3)} compact />
          </div>
        </div>
      </section>

      <section className="section-space bg-[color:var(--paper-soft)]">
        <div className="container-wide">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <SectionHeading
              eyebrow="Flashs"
              title="Des motifs disponibles, sans logique de boutique."
              description="Chaque flash peut faire l’objet d’une demande. Le studio vérifie ensuite la zone, la taille et la cohérence avant de poursuivre."
            />
            <Link href="/flash" className="btn btn-secondary w-fit">
              Voir les flashs
            </Link>
          </div>
          <div className="mt-10">
            <FlashGrid items={flashItems.slice(0, 2)} />
          </div>
        </div>
      </section>

      <section className="section-space">
        <div className="container-wide grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
          <div>
            <SectionHeading
              eyebrow="Demande"
              title="Un formulaire fait pour filtrer les projets sérieux."
              description="Le parcours recueille les informations utiles sans proposer de paiement, de compte client ou de calendrier automatique."
            />
            <Link href="/devis" className="btn btn-primary mt-8">
              Demander un devis
            </Link>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {processSteps.map((step, index) => (
              <article key={step.title} className="subtle-panel p-5">
                <p className="text-sm font-black text-[color:var(--sage-dark)]">0{index + 1}</p>
                <h3 className="mt-3 text-xl font-black text-[color:var(--ink)]">{step.title}</h3>
                <p className="mt-3 text-sm leading-7 text-[color:var(--muted)]">{step.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t hairline bg-[rgba(255,253,248,0.68)] py-16">
        <div className="container-wide grid gap-8 lg:grid-cols-[0.7fr_1fr] lg:items-start">
          <SectionHeading
            eyebrow="Questions rapides"
            title="Avant d’envoyer votre projet."
            description="Quelques repères pour comprendre le fonctionnement du studio dès la première visite."
          />
          <div className="grid gap-4">
            {miniFaq.map((item) => (
              <div key={item.question} className="border-b hairline pb-4">
                <h3 className="font-black text-[color:var(--ink)]">{item.question}</h3>
                <p className="mt-2 text-sm leading-7 text-[color:var(--muted)]">{item.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <BrandSection />
    </>
  );
}
