import Link from "next/link";
import {
  ArrowRight,
  Crosshair,
  Gem,
  Leaf,
} from "lucide-react";
import HomeFaqCard from "@/src/components/HomeFaqCard";
import HomeFlashCard from "@/src/components/HomeFlashCard";
import TattooArticleCarousel from "@/src/components/TattooArticleCarousel";
import { portfolioItems } from "@/src/data/portfolioItems";
import LatestWorksGallery from "./LatestWorksGallery";
import styles from "./HomePage.module.css";

const heroBadges = [
  {
    label: "Inspiré par la nature",
    icon: Leaf,
  },
  {
    label: "Qualité premium",
    icon: Gem,
  },
  {
    label: "Travail précis",
    icon: Crosshair,
  },
];

const latestWorks = portfolioItems.filter(
  (item) => item.id === "psykokwak-bras" || item.image.src.startsWith("/Tatouages/"),
);

export default function HomePage() {
  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <section className={styles.hero} data-page-hero>
          <img
            className={styles.heroImage}
            src="/44745E65-2925-4E28-B97C-8492E35BC5B6.png"
            alt=""
            aria-hidden="true"
          />
          <div className={styles.heroOverlay} />
          <div className={styles.heroVeil} />

          <div className={styles.heroContent} data-page-hero-content>
            <div>
              <p className={styles.brand} data-page-brand>B.Grumpy</p>
              <p className={styles.brandSub} data-page-brand-sub>TATOUAGE</p>
            </div>

            <div className={styles.heroCopy} data-page-hero-copy>
              <h1 className={styles.title} data-page-title>
                Art du
                <span>tatouage</span>
                raffiné
              </h1>
              <p className={styles.caption} data-page-intro>
                Des tatouages premium inspirés par la nature,
                <span>réalisés avec passion et précision.</span>
              </p>
              <Link href="/devis" className={styles.heroCta}>
                Démarrer votre projet
                <ArrowRight className={styles.ctaIcon} strokeWidth={1.8} />
              </Link>
            </div>

            <div className={styles.heroBadges} data-page-hero-badges aria-label="Qualités du studio">
              {heroBadges.map((badge) => {
                const Icon = badge.icon;

                return (
                  <span className={styles.heroBadge} key={badge.label}>
                    <Icon className={styles.badgeIcon} strokeWidth={1.7} />
                    {badge.label}
                  </span>
                );
              })}
            </div>
          </div>
        </section>

        <section className={styles.latestSection} aria-labelledby="latest-works">
          <div className={styles.latestIntro}>
            <p className={styles.latestEyebrow}>Tatouages réalisés</p>
            <h2 id="latest-works" className={styles.latestHeading}>
              Dernières réalisations
            </h2>
          </div>

          <LatestWorksGallery items={latestWorks} />
        </section>

        <section className={styles.quickGrid} aria-label="Accès rapides">
          <HomeFlashCard />
          <HomeFaqCard />
        </section>

        <section className={styles.articleSection} aria-labelledby="tattoo-articles">
          <div className={styles.articleHeader}>
            <p className={styles.articleEyebrow}>Journal tattoo</p>
            <h2 id="tattoo-articles" className={styles.articleHeading}>
              Articles sur le tatouage
            </h2>
          </div>

          <TattooArticleCarousel />
        </section>
      </div>
    </main>
  );
}
