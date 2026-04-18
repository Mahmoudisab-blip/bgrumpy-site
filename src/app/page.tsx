import Image from "next/image";
import Link from "next/link";
import { heroImages, studioInfo } from "@/src/data/site";
import { portfolioItems } from "@/src/data/portfolioItems";

const homeActions = [
  {
    href: "/flash",
    label: "Flash",
    icon: "flash",
  },
  {
    href: "/devis",
    label: "Devis",
    icon: "quote",
  },
  {
    href: "/simulateur",
    label: "Simuler",
    icon: "calendar",
  },
  {
    href: "/profil",
    label: "Profil",
    icon: "profile",
  },
] as const;

export default function Home() {
  return (
    <main className="min-h-screen bg-transparent px-4 pb-8 pt-5 text-[color:var(--ink)]">
      <section className="mx-auto max-w-[430px] lg:max-w-6xl">
        <div className="grid gap-6 lg:grid-cols-[430px_1fr] lg:items-start">
          <div className="app-screen relative min-h-[760px] overflow-hidden rounded-[34px] border border-[rgba(255,249,235,0.42)] shadow-[0_28px_80px_rgba(51,45,32,0.22)]">
            <Image
              src={heroImages.secondary.src}
              alt={heroImages.secondary.alt}
              fill
              priority
              sizes="(min-width: 1024px) 430px, 100vw"
              className="object-cover opacity-70"
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(238,232,216,0.48),rgba(112,118,90,0.4)),radial-gradient(circle_at_22%_12%,rgba(255,250,239,0.72),transparent_32%),radial-gradient(circle_at_75%_72%,rgba(153,160,129,0.36),transparent_36%)]" />
            <div className="absolute inset-0 backdrop-blur-[1.5px]" />

            <div className="relative z-10 flex min-h-[760px] flex-col px-5 pb-28 pt-6">
              <div className="flex items-center justify-between text-sm font-semibold text-[rgba(255,250,239,0.92)]">
                <span>9:41</span>
                <span className="tracking-[0.12em]">•••</span>
              </div>

              <button
                type="button"
                aria-label="Replier"
                className="glass-control mt-6 flex h-11 w-11 items-center justify-center text-[color:var(--ink-soft)]"
              >
                <span className="text-2xl leading-none">⌄</span>
              </button>

              <div className="mt-auto grid gap-6">
                <div className="hero-glass-card px-7 py-8 text-center">
                  <p className="brand-title">B.Grumpy</p>
                  <p className="mt-2 text-sm font-semibold uppercase tracking-[0.48em] text-[color:var(--ink-soft)]">
                    Tattoo
                  </p>
                  <div className="mx-auto my-7 h-px w-28 bg-[rgba(55,52,39,0.18)]" />
                  <h1 className="brand-subtitle">
                    Tatouage naturel
                    <br />
                    et précis
                  </h1>
                  <p className="mx-auto mt-5 max-w-[250px] text-sm leading-6 text-[color:var(--muted)]">
                    Studio privé, pièces végétales, blackwork fin et projets cadrés avec calme.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {homeActions.map((action) => (
                    <Link key={action.href} href={action.href} className="home-action glass-card px-4 py-5 text-center">
                      <span className="brand-action-label">{action.label}</span>
                      <HomeIcon name={action.icon} />
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-5 lg:pt-8">
            <div className="glass-panel p-6 sm:p-8">
              <p className="eyebrow">{studioInfo.location}</p>
              <h2 className="brand-section-title mt-4">
                Une galerie d’accueil plus douce, plus matière, plus studio privé.
              </h2>
              <p className="mt-5 max-w-xl text-sm leading-7 text-[color:var(--muted)]">
                L’univers reste feutré : verre givré, contours ivoire, reflets sauge et images légèrement voilées pour laisser respirer les tatouages.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {portfolioItems.slice(0, 3).map((item) => (
                <article key={item.id} className="glass-card overflow-hidden">
                  <div className="relative aspect-[4/5] overflow-hidden">
                    <Image
                      src={item.image.src}
                      alt={item.image.alt}
                      fill
                      sizes="(min-width: 1024px) 260px, 33vw"
                      className="object-cover opacity-80 grayscale-[15%]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[rgba(25,24,18,0.48)] via-transparent to-[rgba(255,250,239,0.12)]" />
                  </div>
                  <div className="p-4">
                    <p className="eyebrow">{item.category}</p>
                    <h3 className="mt-2 text-lg font-semibold text-[color:var(--ink)]">{item.title}</h3>
                    <p className="mt-2 text-xs leading-5 text-[color:var(--muted)]">{item.placement}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function HomeIcon({ name }: { name: (typeof homeActions)[number]["icon"] }) {
  const classes = "mx-auto mt-3 h-7 w-7 text-[color:var(--ink-soft)]";

  if (name === "flash") {
    return (
      <svg className={classes} viewBox="0 0 24 24" aria-hidden="true" fill="none">
        <path d="M13 3 6.2 13h5.1L10 21l8-11h-5.2L13 3Z" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (name === "quote") {
    return (
      <svg className={classes} viewBox="0 0 24 24" aria-hidden="true" fill="none">
        <path d="M6 5h12v12H9l-3 3V5Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
        <path d="M9 9h6M9 12h4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      </svg>
    );
  }

  if (name === "calendar") {
    return (
      <svg className={classes} viewBox="0 0 24 24" aria-hidden="true" fill="none">
        <path d="M6 5h12a1 1 0 0 1 1 1v13H5V6a1 1 0 0 1 1-1Z" stroke="currentColor" strokeWidth="1.7" />
        <path d="M8 3v4M16 3v4M5 10h14M8 14h3M13 14h3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      </svg>
    );
  }

  return (
    <svg className={classes} viewBox="0 0 24 24" aria-hidden="true" fill="none">
      <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" stroke="currentColor" strokeWidth="1.7" />
      <path d="M5 21a7 7 0 0 1 14 0" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}
