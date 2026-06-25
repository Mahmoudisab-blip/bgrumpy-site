"use client";

import { useRef } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Brush,
  ChevronLeft,
  ChevronRight,
  Crosshair,
  Leaf,
  Sparkles,
  Timer,
} from "lucide-react";
import { tattooArticles, type TattooArticleIcon } from "@/src/data/tattooArticles";
import styles from "@/src/app/HomePage.module.css";

const articleIcons = {
  brush: Brush,
  badgeCheck: BadgeCheck,
  leaf: Leaf,
  crosshair: Crosshair,
  sparkles: Sparkles,
  timer: Timer,
} satisfies Record<TattooArticleIcon, typeof Brush>;

export default function TattooArticleCarousel() {
  const trackRef = useRef<HTMLDivElement>(null);

  function scrollArticles(direction: "previous" | "next") {
    const track = trackRef.current;

    if (!track) {
      return;
    }

    const card = track.querySelector<HTMLElement>(`.${styles.articleCard}`);
    const gap = Number.parseFloat(window.getComputedStyle(track).columnGap) || 14;
    const distance = (card?.offsetWidth ?? 244) + gap;

    track.scrollBy({
      left: direction === "next" ? distance : -distance,
      behavior: "smooth",
    });
  }

  return (
    <div className={styles.articleSlider}>
      <button
        className={`${styles.articleArrow} ${styles.articleArrowLeft}`}
        type="button"
        aria-label="Article précédent"
        onClick={() => scrollArticles("previous")}
      >
        <ChevronLeft className={styles.articleArrowIcon} strokeWidth={1.9} />
      </button>

      <div className={styles.articleTrack} ref={trackRef}>
        {tattooArticles.map((article) => {
          const Icon = articleIcons[article.icon];

          return (
            <Link
              href={`/articles/${article.slug}`}
              className={`${styles.quickCard} ${styles.articleCard}`}
              key={article.slug}
            >
              <div className={styles.articleIconWrap}>
                <Icon className={styles.articleIcon} strokeWidth={1.7} />
              </div>
              <p className={styles.articleCategory}>{article.category}</p>
              <h3 className={styles.articleTitle}>{article.title}</h3>
              <p className={styles.articleText}>{article.summary}</p>
              <span className={styles.articleReadMore}>
                Lire l&apos;article
                <ArrowRight className={styles.articleReadMoreIcon} strokeWidth={1.8} />
              </span>
            </Link>
          );
        })}
      </div>

      <button
        className={`${styles.articleArrow} ${styles.articleArrowRight}`}
        type="button"
        aria-label="Article suivant"
        onClick={() => scrollArticles("next")}
      >
        <ChevronRight className={styles.articleArrowIcon} strokeWidth={1.9} />
      </button>
    </div>
  );
}
