import styles from "./DevisPage.module.css";
import DevisWizard from "./DevisWizard";
import DevisResumeCards from "@/src/components/DevisResumeCards";

export default function DevisPage() {
  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <section className={styles.header}>
          <div className={styles.headerInner}>
            <p className={styles.kicker}>Devis</p>
            <h1 className={styles.title}>Contactez-nous</h1>
            <p className={styles.intro}>
              Contactez-nous dès maintenant pour discuter de votre projet de tatouage.
            </p>
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
