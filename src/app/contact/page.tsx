import ContactForm from "./ContactForm";
import styles from "../devis/DevisPage.module.css";

export const metadata = {
  title: "Contact | B.Grumpy Tattoo",
  description: "Contacter B.Grumpy Tattoo pour une question ou une demande rapide.",
};

export default function ContactPage() {
  return (
    <main className={styles.page} data-editorial-page>
      <div className={styles.shell} data-page-shell>
        <section className={styles.hero} data-page-hero>
          <img
            className={styles.heroImage}
            src="/44745E65-2925-4E28-B97C-8492E35BC5B6.png"
            alt=""
            aria-hidden="true"
          />
          <div className={styles.heroOverlay} aria-hidden="true" />
          <div className={styles.heroVeil} aria-hidden="true" />

          <div className={styles.heroContent} data-page-hero-content>
            <div>
              <p data-page-brand>B.Grumpy</p>
              <p className={styles.kicker} data-page-brand-sub>CONTACT</p>
            </div>

            <div data-page-hero-copy>
              <h1 className={styles.title} data-page-title>Contact & rendez-vous</h1>
              <p className={styles.intro} data-page-intro>
                Un projet de tatouage manga ? Discutons-en.
              </p>
            </div>

            <div data-page-hero-badges aria-label="Informations de contact">
              <span>Réponse sous une semaine</span>
            </div>
          </div>
        </section>

        <section className={styles.formCard} data-page-content="form">
          <ContactForm />
        </section>
      </div>
    </main>
  );
}
