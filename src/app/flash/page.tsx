import { Heart, Search, SlidersHorizontal } from "lucide-react";
import { flashItems } from "@/src/data/flashItems";
import styles from "./FlashPage.module.css";

const flashCards = flashItems.map((item, index) => ({
  ...item,
  price: ["250 €", "320 €", "180 €", "290 €", "340 €", "220 €"][index],
  reference: ["2608", "c30", "0412", "b19", "0717", "m08"][index],
}));

export default function FlashPage() {
  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <div className={styles.searchRow}>
          <div className={styles.searchBox} aria-label="Recherche par style">
            <Search className={styles.searchIcon} strokeWidth={1.8} aria-hidden />
            <span className={styles.placeholder}>Tous les styles</span>
          </div>

          <button className={styles.filterButton} type="button" aria-label="Filtres">
            <SlidersHorizontal className={styles.filterIcon} strokeWidth={1.8} />
          </button>
        </div>

        <section className={styles.grid} aria-label="Galerie de flashs">
          {flashCards.map((item) => (
            <article
              key={item.id}
              className={styles.card}
              style={{ backgroundImage: `url(${item.image.src})` }}
            >
              <span className={styles.status}>{item.status}</span>

              <div className={styles.details}>
                <div>
                  <p className={styles.price}>{item.price}</p>
                  <p className={styles.reference}>{item.reference}</p>
                </div>

                <button className={styles.action} type="button" aria-label={`Ajouter ${item.title}`}>
                  <Heart className={styles.heart} strokeWidth={1.8} />
                </button>
              </div>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
