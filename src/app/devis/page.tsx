import { cookies } from "next/headers";
import { clientSessionCookieName, verifyClientSession } from "@/src/lib/clientAuth";
import { listPublishedFlashs } from "@/src/lib/serverAdminStore";
import styles from "./DevisPage.module.css";
import DevisWizard from "./DevisWizard";
import DevisResumeCards from "@/src/components/DevisResumeCards";
import AccountGate from "@/src/components/AccountGate";

export default async function DevisPage() {
  const cookieStore = await cookies();
  const clientSession = verifyClientSession(cookieStore.get(clientSessionCookieName)?.value);
  const availableFlashItems = clientSession ? await listPublishedFlashs() : [];

  return (
    <main className={styles.page} data-editorial-page>
      <div className={styles.shell} data-page-shell>
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
              <h1 className={styles.title} data-page-title>Demande de devis</h1>
              <p className={styles.intro} data-page-intro>
                Raconte-nous ton projet, nous préparerons la suite ensemble.
              </p>
            </div>

            <div data-page-hero-badges aria-label="Qualités du devis">
              <span>Projet sur mesure</span>
            </div>
          </div>
        </section>

        <div data-page-content="form">
          {clientSession ? (
            <>
              <DevisResumeCards flashItems={availableFlashItems} />

              <section className={styles.formCard}>
                <DevisWizard flashItems={availableFlashItems} />
              </section>
            </>
          ) : (
            <AccountGate embedded />
          )}
        </div>
      </div>
    </main>
  );
}
