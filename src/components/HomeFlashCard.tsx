"use client";

import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import styles from "@/src/app/HomePage.module.css";

export default function HomeFlashCard() {
  return (
    <article className={`${styles.quickCard} ${styles.flashCard}`}>
      <div className={`${styles.quickLink} ${styles.flashLink}`}>
        <div className={styles.flashContent}>
          <h2 className={`${styles.quickTitle} ${styles.flashTitle}`}>
            <Sparkles className={styles.flashTitleIcon} strokeWidth={1.65} aria-hidden="true" />
            Flashs
          </h2>
          <p className={styles.quickText}>Accédez aux dessins disponibles depuis votre compte</p>
        </div>

        <div className={styles.flashGallery}>
          <span className={styles.flashPlaceholder}>
            <span />
          </span>
          <span className={styles.flashPlaceholder}>
            <span />
          </span>
          <span className={styles.flashPlaceholder}>
            <span />
          </span>
        </div>

        <Link href="/flashs" className={styles.flashDiscover}>
          Découvrir
          <ArrowRight className={styles.quickArrow} strokeWidth={1.8} />
        </Link>
      </div>
    </article>
  );
}
