import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  BadgeCheck,
  CalendarDays,
  Crosshair,
  Gem,
  LockKeyhole,
  MessageCircleQuestion,
} from "lucide-react";
import TattooArticleCarousel from "@/src/components/TattooArticleCarousel";
import { portfolioItems, type PortfolioItem } from "@/src/data/portfolioItems";
import HomeWorksGallery from "./HomeWorksGallery";
import styles from "./HomeEditorial.module.css";

// Shared junctions keep the five crops and their dividers perfectly joined.
const collagePoints = {
  topLeft: [10, 0],
  topSpine: [65, 0],
  topRight: [100, 0],
  leftEdge: [4.8, 52],
  leftJunction: [52.24, 44],
  rightJunction: [53.4, 40],
  lowerJunction: [82.525, 52.5],
  rightEdge: [100, 60],
  bottomLeft: [0, 100],
  bottomSpine: [36, 100],
  bottomSplit: [69, 100],
  bottomRight: [100, 100],
} as const;

const collageWorks = [
  {
    src: "/Tatouages/99769AAC-29F9-4F0A-ABFA-EB8FC3DEA45D.png",
    alt: "Tatouage manga Kaneki en noir, gris et rouge",
    imageClassName: styles.collageImageKaneki,
    points: [collagePoints.topLeft, collagePoints.topSpine, collagePoints.leftJunction, collagePoints.leftEdge],
  },
  {
    src: "/Tatouages/6E10098A-CEC2-4795-8031-42C3C06943A7.png",
    alt: "Tatouage manga Todoroki en black and grey",
    imageClassName: styles.collageImageTodoroki,
    points: [collagePoints.topSpine, collagePoints.topRight, collagePoints.rightEdge, collagePoints.rightJunction],
  },
  {
    src: "/Tatouages/B8075592-1B93-4D05-954E-AF1D58324E72.png",
    alt: "Tatouage manga One Piece composé en plusieurs portraits",
    imageClassName: styles.collageImageOnePiece,
    points: [collagePoints.leftEdge, collagePoints.leftJunction, collagePoints.bottomSpine, collagePoints.bottomLeft],
  },
  {
    src: "/Tatouages/7C5E4242-C1BA-411F-A08F-3396BE24FA4C.png",
    alt: "Tatouage manga Sukuna en lignes noires",
    imageClassName: styles.collageImageSukuna,
    points: [collagePoints.rightJunction, collagePoints.lowerJunction, collagePoints.bottomSplit, collagePoints.bottomSpine],
  },
  {
    src: "/Tatouages/E6CFE19D-0777-4574-AFB5-3429685A985E.png",
    alt: "Tatouage du Thousand Sunny inspiré de One Piece",
    imageClassName: styles.collageImageSunny,
    points: [collagePoints.lowerJunction, collagePoints.rightEdge, collagePoints.bottomRight, collagePoints.bottomSplit],
  },
].map(({ points, ...work }) => {
  const left = Math.min(...points.map(([x]) => x));
  const top = Math.min(...points.map(([, y]) => y));
  const right = Math.max(...points.map(([x]) => x));
  const bottom = Math.max(...points.map(([, y]) => y));

  return {
    ...work,
    clipPath: `polygon(${points.map(([x, y]) => `${x}% ${y}%`).join(", ")})`,
    frame: {
      left: `${left}%`,
      top: `${top}%`,
      width: `${right - left}%`,
      height: `${bottom - top}%`,
    },
  };
});

const collageDividers = [
  [collagePoints.topLeft, collagePoints.bottomLeft],
  [collagePoints.topSpine, collagePoints.bottomSpine],
  [collagePoints.leftEdge, collagePoints.leftJunction],
  [collagePoints.rightJunction, collagePoints.rightEdge],
  [collagePoints.lowerJunction, collagePoints.bottomSplit],
]
  .map(([start, end]) => `M ${start[0]} ${start[1]} L ${end[0]} ${end[1]}`)
  .join(" ");

const featuredWorkIds = [
  "tatouage-99769aac",
  "tatouage-b8075592",
  "tatouage-7c5e4242",
  "tatouage-6e10098a",
];

const featuredWorks = featuredWorkIds
  .map((id) => portfolioItems.find((item) => item.id === id))
  .filter((item): item is PortfolioItem => Boolean(item));

const studioSignals = [
  {
    label: "Spécialiste manga & anime",
    icon: BadgeCheck,
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

export default function HomePage() {
  return (
    <main className={styles.page}>
      <section className={styles.heroStage} aria-labelledby="home-title">
        <div className={styles.facetedBackdrop} aria-hidden="true" />

        <div className={styles.identityBlock}>
          <h1 className={styles.identityName} id="home-title">
            B.Grumpy
          </h1>
          <p className={styles.identityDiscipline}>TATTOO</p>
          <div className={styles.identityDivider} aria-hidden="true">
            <span />
          </div>
          <p className={styles.identityTagline}>Tatoueur depuis 2018</p>
        </div>

        <div className={styles.collage} aria-label="Sélection de tatouages manga réalisés par B.Grumpy">
          {collageWorks.map((work) => (
            <Link
              className={styles.collagePanel}
              style={{ clipPath: work.clipPath }}
              href="/tatouages"
              aria-label={`Voir les réalisations : ${work.alt}`}
              key={work.src}
            >
              <span className={styles.collageMedia} style={work.frame}>
                <Image
                  className={`${styles.collageImage} ${work.imageClassName}`}
                  src={work.src}
                  alt={work.alt}
                  fill
                  priority
                  sizes="(max-width: 760px) 55vw, 32vw"
                />
              </span>
            </Link>
          ))}
          <svg
            className={styles.collageDividers}
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            aria-hidden="true"
            focusable="false"
          >
            <path d={collageDividers} vectorEffect="non-scaling-stroke" />
          </svg>
        </div>
      </section>

      <section className={styles.showcase} aria-labelledby="latest-home-title">
        <div className={styles.showcaseInner}>
          <div className={styles.latestBlock}>
            <div className={styles.sectionHeading}>
              <h2 id="latest-home-title">Dernières réalisations</h2>
              <span className={styles.headingRule} aria-hidden="true">
                <i />
              </span>
              <Link href="/tatouages" className={styles.allWorksLink}>
                Voir tout
                <ArrowRight aria-hidden="true" strokeWidth={1.7} />
              </Link>
            </div>

            <HomeWorksGallery items={featuredWorks} />
          </div>

          <Link href="/flash" className={styles.privateFlash}>
            <span className={styles.flashLock} aria-hidden="true">
              <LockKeyhole strokeWidth={1.55} />
            </span>
            <h2>Flashs privés</h2>
            <span className={styles.flashDivider} aria-hidden="true">
              <i />
            </span>
            <p>Accéder aux dessins depuis ton compte</p>
          </Link>
        </div>
      </section>

      <section className={styles.projectBand} aria-labelledby="prepare-project-title">
        <div className={styles.projectInner}>
          <div className={styles.studioSignals} aria-label="Qualités du studio">
            {studioSignals.map((signal) => {
              const Icon = signal.icon;

              return (
                <span className={styles.studioSignal} key={signal.label}>
                  <Icon aria-hidden="true" strokeWidth={1.65} />
                  {signal.label}
                </span>
              );
            })}
          </div>

          <div className={styles.projectGrid}>
            <Link href="/devis" className={`${styles.projectCard} ${styles.projectCardPrimary}`}>
              <span className={styles.projectIcon} aria-hidden="true">
                <CalendarDays strokeWidth={1.6} />
              </span>
              <div className={styles.projectCopy}>
                <p>Contact &amp; rendez-vous</p>
                <h2 id="prepare-project-title">Parlons de ton projet</h2>
                <p>
                  Décris ton idée, la zone et le style souhaité. Ta demande et les réponses du
                  studio resteront accessibles depuis ton espace.
                </p>
              </div>
              <span className={styles.projectAction}>
                Faire une demande
                <ArrowRight aria-hidden="true" strokeWidth={1.7} />
              </span>
            </Link>

            <Link href="/faq" className={styles.projectCard}>
              <span className={styles.projectIcon} aria-hidden="true">
                <MessageCircleQuestion strokeWidth={1.6} />
              </span>
              <div className={styles.projectCopy}>
                <p>Avant la séance</p>
                <h2>Les réponses utiles</h2>
                <p>
                  Acompte, préparation, douleur et soins : retrouve les informations importantes
                  avant de réserver.
                </p>
                <span className={styles.faqTopics} aria-hidden="true">
                  <i>Acompte</i>
                  <i>Préparation</i>
                  <i>Soins</i>
                </span>
              </div>
              <span className={styles.projectAction}>
                Consulter la FAQ
                <ArrowRight aria-hidden="true" strokeWidth={1.7} />
              </span>
            </Link>
          </div>
        </div>
      </section>

      <section className={styles.articleBand} aria-labelledby="tattoo-articles">
        <div className={styles.articleInner}>
          <div className={styles.articleHeading}>
            <p>Journal tattoo</p>
            <h2 id="tattoo-articles">Articles sur le tatouage</h2>
          </div>
          <TattooArticleCarousel />
        </div>
      </section>
    </main>
  );
}
