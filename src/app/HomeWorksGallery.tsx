"use client";

import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Maximize2, X } from "lucide-react";
import type { PortfolioItem } from "@/src/data/portfolioItems";
import styles from "./HomeEditorial.module.css";

type HomeWorksGalleryProps = {
  items: PortfolioItem[];
};

export default function HomeWorksGallery({ items }: HomeWorksGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const selectedItem = selectedIndex === null ? null : items[selectedIndex];

  const moveSelection = useCallback((direction: -1 | 1) => {
    setSelectedIndex((currentIndex) => {
      if (currentIndex === null || items.length === 0) {
        return currentIndex;
      }

      return (currentIndex + direction + items.length) % items.length;
    });
  }, [items.length]);

  useEffect(() => {
    if (selectedIndex === null) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSelectedIndex(null);
      }

      if (event.key === "ArrowLeft") {
        moveSelection(-1);
      }

      if (event.key === "ArrowRight") {
        moveSelection(1);
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedIndex, moveSelection]);

  return (
    <>
      <div className={styles.latestGrid}>
        {items.map((work, index) => (
          <button
            className={styles.latestCard}
            type="button"
            aria-label={`Voir ${work.title} en grand`}
            onClick={() => setSelectedIndex(index)}
            key={work.id}
          >
            <Image
              src={work.image.src}
              alt={work.image.alt}
              fill
              loading="eager"
              sizes="(max-width: 760px) 46vw, (min-width: 2400px) 18vw, 14vw"
            />
            <span className={styles.latestCardMeta} aria-hidden="true">
              <span>
                <strong>{work.title}</strong>
                <small>{work.placement}</small>
              </span>
              <Maximize2 strokeWidth={1.6} />
            </span>
          </button>
        ))}
      </div>

      {selectedItem && typeof document !== "undefined"
        ? createPortal(
            <div
              className={styles.workModalOverlay}
              role="presentation"
              onClick={() => setSelectedIndex(null)}
            >
              <section
                className={styles.workModal}
                role="dialog"
                aria-modal="true"
                aria-labelledby="home-work-title"
                onClick={(event) => event.stopPropagation()}
              >
                <button
                  className={styles.workModalClose}
                  type="button"
                  aria-label="Fermer l'aperçu"
                  title="Fermer"
                  onClick={() => setSelectedIndex(null)}
                >
                  <X strokeWidth={1.7} />
                </button>

                <div className={styles.workModalImage}>
                  <Image
                    src={selectedItem.image.src}
                    alt={selectedItem.image.alt}
                    fill
                    sizes="(max-width: 760px) 100vw, 68vw"
                  />
                </div>

                <div className={styles.workModalDetails}>
                  <p>{selectedItem.category}</p>
                  <h2 id="home-work-title">{selectedItem.title}</h2>
                  <p>{selectedItem.description}</p>

                  <dl>
                    <div>
                      <dt>Emplacement</dt>
                      <dd>{selectedItem.placement}</dd>
                    </div>
                    <div>
                      <dt>Année</dt>
                      <dd>{selectedItem.year}</dd>
                    </div>
                  </dl>

                  <div className={styles.workModalActions}>
                    <div>
                      <button
                        type="button"
                        aria-label="Réalisation précédente"
                        title="Précédente"
                        onClick={() => moveSelection(-1)}
                      >
                        <ArrowLeft strokeWidth={1.7} />
                      </button>
                      <button
                        type="button"
                        aria-label="Réalisation suivante"
                        title="Suivante"
                        onClick={() => moveSelection(1)}
                      >
                        <ArrowRight strokeWidth={1.7} />
                      </button>
                    </div>

                    <Link href="/tatouages">
                      Toutes les réalisations
                      <ArrowRight strokeWidth={1.7} />
                    </Link>
                  </div>
                </div>
              </section>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
