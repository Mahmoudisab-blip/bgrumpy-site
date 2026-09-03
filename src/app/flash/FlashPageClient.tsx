"use client";

import Link from "next/link";
import {
  ArrowRight,
  ChevronRight,
  Heart,
  Search,
  SlidersHorizontal,
  Sparkles,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type {
  FlashBudgetRange,
  FlashCustomization,
  FlashItem,
  FlashStatus,
} from "@/src/data/flashItems";
import { recordContentView, setContentLiked } from "@/src/lib/adminAnalyticsStorage";
import { readReservedFlashIds } from "@/src/lib/clientProfileStorage";
import styles from "./FlashPage.module.css";

type FlashPageClientProps = {
  items: FlashItem[];
};

const quickFilters = [
  "Tous",
  "Manga",
  "Fineline",
  "Floral",
  "Blackwork",
  "Japonais",
  "Ornemental",
  "Minimaliste",
];

const heroBadges = [
  {
    label: "Flashs uniques",
    icon: Sparkles,
  },
];

const styleFilters = [
  "Manga / Animé",
  "Fineline",
  "Floral",
  "Blackwork",
  "Japonais",
  "Ornemental",
  "Minimaliste",
  "Dotwork",
  "Whip Shading",
  "Lettering",
  "Gothique",
  "Kawaii / Chibi",
  "Cyber / Futuriste",
];

const themeFilters = [
  "Fleurs",
  "Papillons",
  "Serpents",
  "Dragons",
  "Crânes",
  "Yeux",
  "Soleil & Lune",
  "Astral",
  "Nature",
  "Animaux",
  "Cartoon",
  "Manga",
  "Anime Girl",
  "Samouraï",
  "Oni / Yokai",
  "Épées",
  "Anges / Démons",
  "Harry Potter",
  "Naruto",
  "Jujutsu Kaisen",
  "Pokémon",
  "One Piece",
  "Sailor Moon",
  "Ghibli",
  "Jeux vidéo",
];

const sizeFilters = ["Petit", "Moyen", "Grand", "Manchette"];

const budgetFilters: FlashBudgetRange[] = [
  "Moins de 100 €",
  "100 à 200 €",
  "200 à 400 €",
  "Plus de 400 €",
];

const availabilityFilters = ["Disponible", "En demande", "Réservé"];
const customizationFilters: FlashCustomization[] = [
  "Personnalisable",
  "Non modifiable",
];
const favoritesStorageKey = "bgrumpy-flash-favorites";

type AdvancedFilters = {
  styles: string[];
  themes: string[];
  sizes: string[];
  budgetRanges: FlashBudgetRange[];
  availability: string[];
  customizations: FlashCustomization[];
};

const emptyAdvancedFilters: AdvancedFilters = {
  styles: [],
  themes: [],
  sizes: [],
  budgetRanges: [],
  availability: [],
  customizations: [],
};

const flashAvailability = (status: FlashStatus) => {
  return status;
};

const quickFilterMatches = (item: FlashItem, filter: string) => {
  if (filter === "Tous") {
    return true;
  }

  if (filter === "Manga") {
    return item.styles.includes("Manga / Animé") || item.themes.includes("Anime Girl");
  }

  if (filter === "Floral") {
    return item.styles.includes("Floral") || item.themes.includes("Fleurs");
  }

  return item.styles.includes(filter);
};

const matchesAny = (itemValues: string[], selectedValues: string[]) =>
  selectedValues.length === 0 || selectedValues.some((value) => itemValues.includes(value));

export default function FlashPageClient({ items }: FlashPageClientProps) {
  const [query, setQuery] = useState("");
  const [quickFilter, setQuickFilter] = useState("Tous");
  const [advancedFilters, setAdvancedFilters] = useState<AdvancedFilters>(emptyAdvancedFilters);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [selectedFlash, setSelectedFlash] = useState<FlashItem | null>(null);
  const [reservedFlashIds, setReservedFlashIds] = useState<string[]>([]);

  const visibleItems = useMemo(
    () =>
      items.map((item) =>
        reservedFlashIds.includes(item.id)
          ? {
              ...item,
              status: "Réservé" as FlashStatus,
            }
          : item,
      ),
    [items, reservedFlashIds],
  );

  const filteredItems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return visibleItems.filter((item) => {
      const matchesQuery =
        normalizedQuery === "" ||
        [
          item.title,
          item.reference,
          item.style,
          item.status,
          item.description,
          item.styles.join(" "),
          item.themes.join(" "),
          item.placements.join(" "),
          item.keywords.join(" "),
        ]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery);
      const matchesQuickFilter = quickFilterMatches(item, quickFilter);
      const matchesFavorites = !showFavoritesOnly || favorites.includes(item.id);
      const matchesAdvancedFilters =
        matchesAny(item.styles, advancedFilters.styles) &&
        matchesAny(item.themes, advancedFilters.themes) &&
        matchesAny(item.sizes, advancedFilters.sizes) &&
        (advancedFilters.budgetRanges.length === 0 ||
          advancedFilters.budgetRanges.includes(item.budgetRange)) &&
        (advancedFilters.availability.length === 0 ||
          advancedFilters.availability.includes(flashAvailability(item.status))) &&
        (advancedFilters.customizations.length === 0 ||
          advancedFilters.customizations.includes(item.customization));

      return matchesQuery && matchesQuickFilter && matchesFavorites && matchesAdvancedFilters;
    });
  }, [advancedFilters, favorites, query, quickFilter, showFavoritesOnly, visibleItems]);

  const toggleAdvancedFilter = <Key extends keyof AdvancedFilters>(
    key: Key,
    value: AdvancedFilters[Key][number],
  ) => {
    setAdvancedFilters((current) => {
      const currentValues = current[key] as string[];
      const nextValues = currentValues.includes(value)
        ? currentValues.filter((item) => item !== value)
        : [...currentValues, value];

      return {
        ...current,
        [key]: nextValues,
      };
    });
  };

  const toggleFavorite = (id: string) => {
    setFavorites((current) => {
      const nextFavorites = current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id];
      const item = items.find((flash) => flash.id === id);

      window.localStorage.setItem(favoritesStorageKey, JSON.stringify(nextFavorites));
      if (item) {
        setContentLiked("flash", item.id, item.title, nextFavorites.includes(id));
      }

      return nextFavorites;
    });
  };

  useEffect(() => {
    const requestedFlashId = new URLSearchParams(window.location.search).get("flash");
    const requestedFlash = visibleItems.find((item) => item.id === requestedFlashId);
    const frame = window.requestAnimationFrame(() => {
      if (requestedFlash) {
        setSelectedFlash(requestedFlash);
      }
    });

    return () => window.cancelAnimationFrame(frame);
  }, [visibleItems]);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setReservedFlashIds(readReservedFlashIds());

      try {
        const rawFavorites = window.localStorage.getItem(favoritesStorageKey);
        const parsedFavorites = rawFavorites ? JSON.parse(rawFavorites) : [];

        setFavorites(Array.isArray(parsedFavorites) ? parsedFavorites : []);
      } catch {
        window.localStorage.removeItem(favoritesStorageKey);
      }
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (!selectedFlash) {
      return;
    }

    recordContentView("flash", selectedFlash.id, selectedFlash.title);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSelectedFlash(null);
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedFlash]);

  const resetFilters = () => {
    setQuery("");
    setQuickFilter("Tous");
    setShowFavoritesOnly(false);
    setAdvancedFilters(emptyAdvancedFilters);
  };

  return (
    <main className={styles.page} data-flash-page data-editorial-page>
      <div className={styles.shell} data-page-shell>
        <section className={styles.hero} data-flash-hero data-page-hero>
          <img
            className={styles.heroImage}
            src="/5CCA2C01-3444-46A6-8882-2E25F4F8C0B2.png"
            alt=""
            aria-hidden="true"
          />
          <div className={styles.heroOverlay} aria-hidden="true" />
          <div className={styles.heroVeil} aria-hidden="true" />

          <div className={styles.heroContent} data-page-hero-content>
            <div>
              <p className={styles.brand} data-page-brand>B.Grumpy</p>
              <p className={styles.brandSub} data-page-brand-sub>FLASHS</p>
            </div>

            <div className={styles.heroCopy} data-page-hero-copy>
              <h1 className={styles.title} data-page-title>
                Flashs
                <span>tattoo</span>
                disponibles
              </h1>
              <p className={styles.intro} data-page-intro>
                Des créations uniques,
                <span>prêtes à être tatouées.</span>
              </p>
              <Link href="/devis" className={styles.heroCta}>
                Réserver un flash
                <ArrowRight className={styles.heroCtaIcon} strokeWidth={1.8} />
              </Link>
            </div>

            <div className={styles.heroBadges} data-page-hero-badges aria-label="Qualités des flashs">
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

        <div data-page-content="gallery">
        <section className={styles.filtersPanel} data-flash-filters aria-label="Recherche et filtres">
          <div className={styles.searchRow}>
            <label className={styles.searchBox} data-flash-search>
              <Search className={styles.searchIcon} strokeWidth={1.8} aria-hidden />
              <input
                aria-label="Rechercher un flash"
                className={styles.searchInput}
                placeholder="Rechercher un flash, un style, un thème..."
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </label>

            <button
              className={`${styles.filterButton} ${showAdvancedFilters ? styles.filterButtonActive : ""}`}
              data-flash-filter-button
              type="button"
              aria-expanded={showAdvancedFilters}
              onClick={() => setShowAdvancedFilters((current) => !current)}
            >
              <SlidersHorizontal className={styles.filterIcon} strokeWidth={1.8} />
              <span>Filtres</span>
            </button>
          </div>

          <div className={styles.pillRow} data-flash-pill-row aria-label="Catégories">
            <button
              className={`${styles.pill} ${showFavoritesOnly ? styles.pillActive : ""}`}
              data-flash-pill
              data-active={showFavoritesOnly ? "true" : undefined}
              type="button"
              onClick={() => {
                setShowFavoritesOnly((current) => !current);
                setQuickFilter("Tous");
              }}
            >
              Mes favoris
            </button>
            {quickFilters.map((item) => (
              <button
                className={`${styles.pill} ${!showFavoritesOnly && quickFilter === item ? styles.pillActive : ""}`}
                data-flash-pill
                data-active={!showFavoritesOnly && quickFilter === item ? "true" : undefined}
                key={item}
                type="button"
                onClick={() => {
                  setShowFavoritesOnly(false);
                  setQuickFilter(item);
                }}
              >
                {item}
              </button>
            ))}
            <button className={styles.pillNext} data-flash-pill-next type="button" aria-label="Voir plus de catégories">
              <ChevronRight strokeWidth={1.8} aria-hidden />
            </button>
          </div>

          {showAdvancedFilters && (
            <div className={styles.advancedFilters}>
              <FilterGroup
                label="Style"
                options={styleFilters}
                selected={advancedFilters.styles}
                onToggle={(value) => toggleAdvancedFilter("styles", value)}
              />
              <FilterGroup
                label="Thème"
                options={themeFilters}
                selected={advancedFilters.themes}
                onToggle={(value) => toggleAdvancedFilter("themes", value)}
              />
              <FilterGroup
                label="Taille"
                options={sizeFilters}
                selected={advancedFilters.sizes}
                onToggle={(value) => toggleAdvancedFilter("sizes", value)}
              />
              <FilterGroup
                label="Budget"
                options={budgetFilters}
                selected={advancedFilters.budgetRanges}
                onToggle={(value) => toggleAdvancedFilter("budgetRanges", value as FlashBudgetRange)}
              />
              <FilterGroup
                label="Disponibilité"
                options={availabilityFilters}
                selected={advancedFilters.availability}
                onToggle={(value) => toggleAdvancedFilter("availability", value)}
              />
              <FilterGroup
                label="Personnalisation"
                options={customizationFilters}
                selected={advancedFilters.customizations}
                onToggle={(value) => toggleAdvancedFilter("customizations", value as FlashCustomization)}
              />

              <button className={styles.resetFilters} type="button" onClick={resetFilters}>
                Réinitialiser les filtres
              </button>
            </div>
          )}
        </section>

        <p className={styles.resultCount} aria-live="polite">
          {filteredItems.length} flash{filteredItems.length > 1 ? "s" : ""} affiché
          {filteredItems.length > 1 ? "s" : ""}
        </p>

        <section className={styles.grid} aria-label="Galerie de flashs">
          {filteredItems.map((item) => {
            const favorite = favorites.includes(item.id);

            return (
              <article
                key={item.id}
                className={styles.card}
                data-flash-card
                role="button"
                tabIndex={0}
                aria-label={`Afficher ${item.title} en grand`}
                onClick={() => setSelectedFlash(item)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    setSelectedFlash(item);
                  }
                }}
              >
                <span
                  className={`${styles.status} ${
                    item.status === "Disponible" ? styles.statusAvailable : styles.statusReserved
                  }`}
                >
                  {item.status}
                </span>
                <img className={styles.flashImage} data-flash-image src={item.image.src} alt={item.image.alt} />

                <div className={styles.details}>
                  <div>
                    <p className={styles.price}>{item.price} €</p>
                    <p className={styles.reference}>{item.reference}</p>
                  </div>

                  <button
                    className={`${styles.action} ${favorite ? styles.actionActive : ""}`}
                    type="button"
                    aria-label={
                      favorite
                        ? `Retirer ${item.title} des favoris`
                        : `Ajouter ${item.title} aux favoris`
                    }
                    onClick={(event) => {
                      event.stopPropagation();
                      toggleFavorite(item.id);
                    }}
                  >
                    <Heart className={styles.heart} strokeWidth={1.8} fill={favorite ? "currentColor" : "none"} />
                  </button>
                </div>
              </article>
            );
          })}
        </section>

        {filteredItems.length === 0 && (
          <section className={styles.empty}>
            <p>Aucun flash ne correspond à ta recherche.</p>
            <button type="button" onClick={resetFilters}>
              Réinitialiser
            </button>
          </section>
        )}
        </div>
      </div>

      {selectedFlash && (
        <div
          className={styles.modalOverlay}
          role="presentation"
          onClick={() => setSelectedFlash(null)}
        >
          <section
            className={styles.flashModal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="selected-flash-title"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              className={styles.modalClose}
              type="button"
              aria-label="Fermer l'aperçu"
              onClick={() => setSelectedFlash(null)}
            >
              <X strokeWidth={1.8} aria-hidden />
            </button>

            <div className={styles.modalImageWrap}>
              <span
                className={`${styles.status} ${styles.modalStatus} ${
                  selectedFlash.status === "Disponible" ? styles.statusAvailable : styles.statusReserved
                }`}
              >
                {selectedFlash.status}
              </span>
              <img
                className={styles.modalImage}
                src={selectedFlash.image.src}
                alt={selectedFlash.image.alt}
              />
            </div>

            <div className={styles.modalDetails}>
              <p className={styles.modalReference}>{selectedFlash.reference}</p>
              <h2 className={styles.modalTitle} id="selected-flash-title">
                {selectedFlash.title}
              </h2>
              <p className={styles.modalDescription}>{selectedFlash.description}</p>

              <dl className={styles.modalMeta}>
                <div>
                  <dt>Prix</dt>
                  <dd>{selectedFlash.price} €</dd>
                </div>
                <div>
                  <dt>Taille</dt>
                  <dd>{selectedFlash.size}</dd>
                </div>
                <div>
                  <dt>Style</dt>
                  <dd>{selectedFlash.style}</dd>
                </div>
              </dl>

              <Link className={styles.modalCta} href={`/devis?flash=${selectedFlash.id}`}>
                {selectedFlash.status === "Réservé" ? "Demander un flash similaire" : "Réserver ce flash"}
                <ArrowRight strokeWidth={1.8} aria-hidden />
              </Link>
            </div>
          </section>
        </div>
      )}

    </main>
  );
}

type FilterGroupProps = {
  label: string;
  options: string[];
  selected: string[];
  onToggle: (value: string) => void;
};

function FilterGroup({ label, options, selected, onToggle }: FilterGroupProps) {
  return (
    <div className={styles.filterGroup}>
      <p className={styles.filterLabel}>{label}</p>
      <div className={styles.statusRow}>
        {options.map((option) => (
          <button
            className={`${styles.statusPill} ${
              selected.includes(option) ? styles.statusPillActive : ""
            }`}
            key={option}
            type="button"
            onClick={() => onToggle(option)}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}
