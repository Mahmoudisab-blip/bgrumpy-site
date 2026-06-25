import styles from "./DevisPage.module.css";
import DevisWizard from "./DevisWizard";
import DevisResumeCards from "@/src/components/DevisResumeCards";

export default function DevisPage() {
  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <section className={styles.hero} data-page-hero>
          <img
            className={styles.heroImage}
            src="/E33945DF-ADFA-4EEB-B7B2-499B4C6C9CE5.png"
            alt=""
            aria-hidden="true"
          />
          <div className={styles.heroOverlay} aria-hidden="true" />
          <div className={styles.heroVeil} aria-hidden="true" />

          <div className={styles.heroContent} data-page-hero-content>
            <div>
              <p data-page-brand>B.Grumpy</p>
              <p className={styles.kicker} data-page-brand-sub>DEVIS</p>
            </div>

            <div data-page-hero-copy>
              <h1 className={styles.title} data-page-title>Contactez-nous</h1>
              <p className={styles.intro} data-page-intro>
                Contactez-nous dès maintenant pour discuter de votre projet de tatouage.
              </p>
            </div>

            <div data-page-hero-badges aria-label="Qualités du devis">
              <span>Projet sur mesure</span>
            </div>
          </div>
        </section>

        <DevisResumeCards />

        <section className={styles.formCard}>
          <DevisWizard />
        </section>
      </div>
    </main>
  );
}
