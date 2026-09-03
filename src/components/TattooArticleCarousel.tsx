"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Brush,
  ChevronLeft,
  ChevronRight,
  CircleDot,
  Crosshair,
  Sparkles,
  Timer,
} from "lucide-react";
import { tattooArticles, type TattooArticleIcon } from "@/src/data/tattooArticles";
import styles from "@/src/app/HomePage.module.css";

const articleIcons = {
  brush: Brush,
  badgeCheck: BadgeCheck,
  leaf: CircleDot,
  crosshair: Crosshair,
  sparkles: Sparkles,
  timer: Timer,
} satisfies Record<TattooArticleIcon, typeof Brush>;

export default function TattooArticleCarousel() {
  const trackId = useId();
  const trackRef = useRef<HTMLDivElement>(null);
  const [canScroll, setCanScroll] = useState({ previous: false, next: false });

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    function updateControls() {
      if (!track) return;
      const previous = track.scrollLeft > 1;
      const next = track.scrollLeft + track.clientWidth < track.scrollWidth - 1;
      setCanScroll((current) =>
        current.previous === previous && current.next === next ? current : { previous, next },
      );
    }

    const observer = new ResizeObserver(updateControls);
    observer.observe(track);
    track.addEventListener("scroll", updateControls, { passive: true });

    return () => {
      observer.disconnect();
      track.removeEventListener("scroll", updateControls);
    };
  }, []);

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
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth",
    });
  }

  return (
    <div className={styles.articleSlider}>
      <div className={styles.articleTrack} id={trackId} ref={trackRef}>
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

      <div className={styles.articleControls}>
        <button
          className={styles.articleArrow}
          type="button"
          aria-label="Article précédent"
          title="Article précédent"
          aria-controls={trackId}
          disabled={!canScroll.previous}
          onClick={() => scrollArticles("previous")}
        >
          <ChevronLeft className={styles.articleArrowIcon} strokeWidth={1.9} aria-hidden="true" />
        </button>
        <button
          className={styles.articleArrow}
          type="button"
          aria-label="Article suivant"
          title="Article suivant"
          aria-controls={trackId}
          disabled={!canScroll.next}
          onClick={() => scrollArticles("next")}
        >
          <ChevronRight className={styles.articleArrowIcon} strokeWidth={1.9} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
