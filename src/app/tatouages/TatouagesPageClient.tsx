"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronRight, Heart, Images, Search, X } from "lucide-react";
import type { PortfolioItem } from "@/src/data/portfolioItems";
import {
  readLikedContent,
  recordContentView,
  setContentLiked,
} from "@/src/lib/adminAnalyticsStorage";
import styles from "./TatouagesPage.module.css";

type TatouagesPageClientProps = {
  items: PortfolioItem[];
};

const allCategory = "Tous";

export default function TatouagesPageClient({ items }: TatouagesPageClientProps) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState(allCategory);
  const [selectedTattoo, setSelectedTattoo] = useState<PortfolioItem | null>(null);
  const [likedTattoos, setLikedTattoos] = useState<string[]>([]);

  const categories = useMemo(
    () => [allCategory, ...Array.from(new Set(items.map((item) => item.category)))],
    [items],
  );

  const filteredItems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return items.filter((item) => {
      const matchesQuery =
        normalizedQuery === "" ||
        [item.title, item.category, item.placement, item.year, item.description]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery);
      const matchesCategory = category === allCategory || item.category === category;

      return matchesQuery && matchesCategory;
    });
  }, [category, items, query]);

  useEffect(() => {
    if (!selectedTattoo) {
      return;
    }

    recordContentView("tattoo", selectedTattoo.id, selectedTattoo.title);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSelectedTattoo(null);
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedTattoo]);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const likedIds = readLikedContent()
        .filter((item) => item.startsWith("tattoo:"))
        .map((item) => item.replace("tattoo:", ""));

      setLikedTattoos(likedIds);
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  const toggleTattooLike = (item: PortfolioItem) => {
    setLikedTattoos((current) => {
      const liked = !current.includes(item.id);
      const nextLikedContent = setContentLiked("tattoo", item.id, item.title, liked);

      return nextLikedContent
        .filter((contentKey) => contentKey.startsWith("tattoo:"))
        .map((contentKey) => contentKey.replace("tattoo:", ""));
    });
  };

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <section className={styles.hero}>
          <img
            className={styles.heroImage}
            src="/6BF88BF7-71DA-4E00-AB25-74EDB3CEB72A.png"
            alt=""
            aria-hidden="true"
          />
          <div className={styles.heroOverlay} aria-hidden="true" />
          <div className={styles.heroVeil} aria-hidden="true" />

          <div className={styles.heroContent}>
            <div>
              <p className={styles.brand}>B.Grumpy</p>
              <p className={styles.brandSub}>TATOUAGES</p>
            </div>

            <div className={styles.heroCopy}>
              <h1 className={styles.title}>
                Tatouages
                <span>réalisés</span>
              </h1>
              <p className={styles.intro}>
                Pièces réalisées au studio,
                <span>présentées en photos.</span>
              </p>
            </div>

            <div className={styles.heroBadges} aria-label="Galerie de tatouages réalisés">
              <span className={styles.heroBadge}>
                <Images className={styles.badgeIcon} strokeWidth={1.7} />
                Réalisations
              </span>
            </div>
          </div>
        </section>

        <section className={styles.filtersPanel} aria-label="Recherche et filtres">
          <div className={styles.searchRow}>
            <label className={styles.searchBox}>
              <Search className={styles.searchIcon} strokeWidth={1.8} aria-hidden="true" />
              <input
                aria-label="Rechercher un tatouage réalisé"
                className={styles.searchInput}
                placeholder="Rechercher un tatouage, une zone..."
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </label>
          </div>

          <div className={styles.pillRow} aria-label="Catégories de tatouages">
            {categories.map((item) => (
              <button
                className={`${styles.pill} ${category === item ? styles.pillActive : ""}`}
                key={item}
                type="button"
                onClick={() => setCategory(item)}
              >
                {item}
              </button>
            ))}
            <button className={styles.pillNext} type="button" aria-label="Voir plus de catégories">
              <ChevronRight strokeWidth={1.8} aria-hidden="true" />
            </button>
          </div>
        </section>

        <p className={styles.resultCount} aria-live="polite">
          {filteredItems.length} tatouage{filteredItems.length > 1 ? "s" : ""} affiché
          {filteredItems.length > 1 ? "s" : ""}
        </p>

        <section className={styles.grid} aria-label="Tatouages réalisés">
          {filteredItems.map((item) => {
            const liked = likedTattoos.includes(item.id);

            return (
              <article
                key={item.id}
                className={styles.card}
                role="button"
                tabIndex={0}
                aria-label={`Afficher ${item.title} en grand`}
                onClick={() => setSelectedTattoo(item)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    setSelectedTattoo(item);
                  }
                }}
              >
                <img className={styles.tattooImage} src={item.image.src} alt={item.image.alt} />
                <button
                  className={`${styles.likeButton} ${liked ? styles.likeButtonActive : ""}`}
                  type="button"
                  aria-label={liked ? `Retirer le j'aime sur ${item.title}` : `Aimer ${item.title}`}
                  onClick={(event) => {
                    event.stopPropagation();
                    toggleTattooLike(item);
                  }}
                >
                  <Heart strokeWidth={1.8} fill={liked ? "currentColor" : "none"} aria-hidden="true" />
                </button>
                <div className={styles.details}>
                  <h2 className={styles.cardTitle}>{item.title}</h2>
                </div>
              </article>
            );
          })}
        </section>

        {filteredItems.length === 0 && (
          <section className={styles.empty}>
            <p>Aucun tatouage ne correspond à ta recherche.</p>
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setCategory(allCategory);
              }}
            >
              Réinitialiser
            </button>
          </section>
        )}
      </div>

      {selectedTattoo && (
        <div
          className={styles.modalOverlay}
          role="presentation"
          onClick={() => setSelectedTattoo(null)}
        >
          <section
            className={styles.tattooModal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="selected-tattoo-title"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              className={styles.modalClose}
              type="button"
              aria-label="Fermer l'aperçu"
              onClick={() => setSelectedTattoo(null)}
            >
              <X strokeWidth={1.8} aria-hidden="true" />
            </button>

            <div className={styles.modalImageWrap}>
              <img
                className={styles.modalImageBackdrop}
                src={selectedTattoo.image.src}
                alt=""
                aria-hidden="true"
              />
              <img className={styles.modalImage} src={selectedTattoo.image.src} alt={selectedTattoo.image.alt} />
            </div>

            <div className={styles.modalDetails}>
              <p className={styles.modalReference}>{selectedTattoo.category}</p>
              <h2 className={styles.modalTitle} id="selected-tattoo-title">
                {selectedTattoo.title}
              </h2>
              <p className={styles.modalDescription}>{selectedTattoo.description}</p>

              <dl className={styles.modalMeta}>
                <div>
                  <dt>Zone</dt>
                  <dd>{selectedTattoo.placement}</dd>
                </div>
                <div>
                  <dt>Année</dt>
                  <dd>{selectedTattoo.year}</dd>
                </div>
                <div>
                  <dt>Style</dt>
                  <dd>{selectedTattoo.category}</dd>
                </div>
              </dl>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
