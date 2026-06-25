import FAQItem from "@/src/components/FAQItem";
import { faqItems } from "@/src/data/faqItems";
import styles from "./FAQPage.module.css";

export default function FAQPage() {
  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <section className={styles.header} data-page-hero>
          <img
            className={styles.heroImage}
            src="/9C7B180C-125E-4FBD-B84C-E65C63AB8FA6.png"
            alt=""
            aria-hidden="true"
          />
          <div className={styles.heroOverlay} aria-hidden="true" />
          <div className={styles.heroVeil} aria-hidden="true" />

          <div data-page-hero-content>
            <div>
              <p data-page-brand>B.Grumpy</p>
              <p className={styles.kicker} data-page-brand-sub>FAQ</p>
            </div>

            <div data-page-hero-copy>
              <h1 className={styles.title} data-page-title>FAQ</h1>
              <p className={styles.intro} data-page-intro>
                Les réponses utiles avant de préparer votre projet tattoo.
              </p>
            </div>

            <div data-page-hero-badges aria-label="Qualités de la FAQ">
              <span>Projet</span>
              <span>Soins</span>
              <span>Studio</span>
            </div>
          </div>
        </section>

        <section className={styles.list} aria-label="Questions fréquentes">
          {faqItems.map((item) => (
            <FAQItem
              key={item.question}
              category={item.category}
              question={item.question}
              answer={item.answer}
            />
          ))}
        </section>
      </div>
    </main>
  );
}
