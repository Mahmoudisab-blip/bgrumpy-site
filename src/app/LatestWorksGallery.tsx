"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { ArrowLeft, ArrowRight, X } from "lucide-react";
import styles from "./HomePage.module.css";

type LatestWork = {
  id: string;
  title: string;
  category: string;
  placement: string;
  year: string;
  description: string;
  image: {
    src: string;
    alt: string;
  };
};

type LatestWorksGalleryProps = {
  items: LatestWork[];
};

const getFullImageSrc = (src: string) => src.replace("fit=crop", "fit=max");
const shuffleItems = (items: LatestWork[]) => {
  const shuffledItems = [...items];

  for (let index = shuffledItems.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [shuffledItems[index], shuffledItems[randomIndex]] = [
      shuffledItems[randomIndex],
      shuffledItems[index],
    ];
  }

  return shuffledItems;
};

const pairItems = (items: LatestWork[]) => {
  const pairs: LatestWork[][] = [];

  for (let index = 0; index < items.length; index += 2) {
    pairs.push(items.slice(index, index + 2));
  }

  return pairs;
};

export default function LatestWorksGallery({ items }: LatestWorksGalleryProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [selectedItem, setSelectedItem] = useState<LatestWork | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [displayItems, setDisplayItems] = useState(items);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const itemPairs = pairItems(displayItems);

  const scrollGallery = (direction: -1 | 1) => {
    const track = trackRef.current;

    if (!track || itemPairs.length === 0) {
      return;
    }

    const nextSlideIndex =
      (activeSlideIndex + direction + itemPairs.length) % itemPairs.length;
    const targetSlide = track.children.item(nextSlideIndex) as HTMLElement | null;

    setActiveSlideIndex(nextSlideIndex);

    track.scrollTo({
      left: targetSlide?.offsetLeft ?? 0,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    setDisplayItems(shuffleItems(items));
    setActiveSlideIndex(0);
    setIsMounted(true);
  }, [items]);

  useEffect(() => {
    if (!selectedItem) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSelectedItem(null);
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedItem]);

  return (
    <div className={styles.latestGallery}>
      <div className={styles.latestControls}>
        <button
          className={styles.latestControl}
          type="button"
          aria-label="Voir les réalisations précédentes"
          onClick={() => scrollGallery(-1)}
        >
          <ArrowLeft className={styles.latestControlIcon} strokeWidth={1.7} />
        </button>
        <button
          className={styles.latestControl}
          type="button"
          aria-label="Voir les réalisations suivantes"
          onClick={() => scrollGallery(1)}
        >
          <ArrowRight className={styles.latestControlIcon} strokeWidth={1.7} />
        </button>
      </div>

      <div className={styles.latestTrack} ref={trackRef}>
        {itemPairs.map((pair) => (
          <div className={styles.latestSlide} key={pair.map((item) => item.id).join("-")}>
            {pair.map((item) => (
              <button
                className={styles.latestCard}
                key={item.id}
                type="button"
                aria-label={`Voir ${item.title} en plein écran`}
                onClick={() => setSelectedItem(item)}
              >
                <img
                  src={getFullImageSrc(item.image.src)}
                  alt={item.image.alt}
                  className={`${styles.latestImage} ${
                    item.id === "psykokwak-bras" ? styles.latestImageEditorial : ""
                  }`}
                />
                <div
                  className={`${styles.latestCardShade} ${
                    item.id === "psykokwak-bras" ? styles.latestCardShadeEditorial : ""
                  }`}
                />
                <div className={styles.latestCardCopy}>
                  <h3>{item.category}</h3>
                  <p>{item.placement}</p>
                </div>
              </button>
            ))}
          </div>
        ))}
      </div>

      <Link href="/tatouages" className={styles.latestGalleryLink}>
        <ArrowRight className={styles.latestGalleryLinkIcon} strokeWidth={1.8} />
        voir toutes les réalisations
      </Link>

      {selectedItem && isMounted ? createPortal(
        <div
          className={styles.latestModalOverlay}
          role="presentation"
          onClick={() => setSelectedItem(null)}
        >
          <section
            className={styles.latestModal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="selected-latest-title"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              className={styles.latestModalClose}
              type="button"
              aria-label="Fermer l'aperçu"
              onClick={() => setSelectedItem(null)}
            >
              <X className={styles.latestModalCloseIcon} strokeWidth={1.8} aria-hidden="true" />
            </button>

            <div className={styles.latestModalImageWrap}>
              <img
                src={getFullImageSrc(selectedItem.image.src)}
                alt={selectedItem.image.alt}
                className={styles.latestModalImage}
              />
            </div>

            <div className={styles.latestModalDetails}>
              <p className={styles.latestModalReference}>{selectedItem.category}</p>
              <h2 className={styles.latestModalTitle} id="selected-latest-title">
                {selectedItem.title}
              </h2>
              <p className={styles.latestModalDescription}>{selectedItem.description}</p>

              <dl className={styles.latestModalMeta}>
                <div>
                  <dt>Zone</dt>
                  <dd>{selectedItem.placement}</dd>
                </div>
                <div>
                  <dt>Année</dt>
                  <dd>{selectedItem.year}</dd>
                </div>
              </dl>
            </div>
          </section>
        </div>,
        document.body,
      ) : null}
    </div>
  );
}
