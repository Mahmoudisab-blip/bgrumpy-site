"use client";

import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import { flashItems, type FlashItem } from "@/src/data/flashItems";
import styles from "@/src/app/HomePage.module.css";

const pickRandomFlashItems = () => {
  const shuffled = [...flashItems].sort(() => Math.random() - 0.5);
  const count = Math.min(shuffled.length, 3);

  return shuffled.slice(0, count);
};

export default function HomeFlashCard() {
  const [selectedFlashItems, setSelectedFlashItems] = useState<FlashItem[]>([]);
  const hasFlashItems = flashItems.length > 0;

  useEffect(() => {
    const refreshFlashItems = () => setSelectedFlashItems(pickRandomFlashItems());

    refreshFlashItems();

    const intervalId = window.setInterval(refreshFlashItems, 5000);

    return () => window.clearInterval(intervalId);
  }, []);

  return (
    <article className={`${styles.quickCard} ${styles.flashCard}`}>
      <div className={`${styles.quickLink} ${styles.flashLink}`}>
        <div className={styles.flashContent}>
          <h2 className={`${styles.quickTitle} ${styles.flashTitle}`}>
            <Sparkles className={styles.flashTitleIcon} strokeWidth={1.65} aria-hidden="true" />
            Flashs
          </h2>
          <p className={styles.quickText}>Découvrez les dessins disponibles</p>
        </div>

        <div className={styles.flashGallery}>
          {hasFlashItems && selectedFlashItems.length > 0 ? (
            selectedFlashItems.map((item, index) => (
              <Link
                aria-label={`Voir ${item.title}`}
                className={styles.flashMiniCard}
                href={`/flash?flash=${item.id}`}
                key={item.id}
                style={{ "--index": index } as CSSProperties}
              >
                <img src={item.image.src} alt={item.image.alt} loading="lazy" />
                <span className={styles.flashMiniFallback}>{item.reference}</span>
              </Link>
            ))
          ) : (
            <span className={styles.flashPlaceholder}>
              <span />
            </span>
          )}
        </div>

        <Link href="/flashs" className={styles.flashDiscover}>
          Découvrir
          <ArrowRight className={styles.quickArrow} strokeWidth={1.8} />
        </Link>
      </div>
    </article>
  );
}
