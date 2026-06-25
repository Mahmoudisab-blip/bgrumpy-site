"use client";

import Link from "next/link";
import { ArrowLeft, FileClock, Plus, X } from "lucide-react";
import { useEffect, useState } from "react";
import {
  migrateLegacyDraft,
  removeDraftRecord,
  type DevisDraftRecord,
} from "@/src/lib/devisDraftStorage";
import styles from "./DevisEnCoursPage.module.css";

type DraftForm = {
  prenom?: string;
  nom?: string;
  devis?: string;
  budget?: number;
  zone?: string;
  taille?: number;
  projet?: string;
};

const formatDraftDate = (value: string) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Date non disponible";
  }

  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(date);
};

const getDraftTitle = (draft: DevisDraftRecord<DraftForm>, index: number) => {
  const name = [draft.form.prenom, draft.form.nom].filter(Boolean).join(" ");

  if (name) {
    return name;
  }

  return `Devis en cours ${index + 1}`;
};

const getDraftDetails = (draft: DevisDraftRecord<DraftForm>) => {
  const details = [
    draft.form.devis,
    draft.form.zone,
    draft.form.taille ? `${draft.form.taille} cm` : "",
    draft.form.budget ? `${draft.form.budget} € max` : "",
  ].filter(Boolean);

  return details.length > 0 ? details.join(" · ") : "Demande commencée";
};

export default function DevisEnCoursClient() {
  const [drafts, setDrafts] = useState<DevisDraftRecord<DraftForm>[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setDrafts(migrateLegacyDraft<DraftForm>());
      setLoaded(true);
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  const deleteDraft = (id: string) => {
    removeDraftRecord<DraftForm>(id);
    setDrafts((current) => current.filter((draft) => draft.id !== id));
  };

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <section className={styles.header} data-page-hero>
          <div className={styles.headerActions}>
            <Link className={styles.iconLink} href="/devis" aria-label="Retour aux devis">
              <ArrowLeft strokeWidth={1.8} aria-hidden />
            </Link>
            <Link className={styles.iconLink} href="/devis" aria-label="Nouveau devis">
              <Plus strokeWidth={1.8} aria-hidden />
            </Link>
          </div>
          <div data-page-hero-content>
            <div>
              <p data-page-brand>B.Grumpy</p>
              <p className={styles.kicker} data-page-brand-sub>DEVIS</p>
            </div>

            <div data-page-hero-copy>
              <h1 className={styles.title} data-page-title>Devis en cours</h1>
              <p className={styles.intro} data-page-intro>
                Les demandes commencées restent ici avec leur date et leur heure.
              </p>
            </div>

            <div data-page-hero-badges aria-label="Qualités des devis">
              <span>Brouillons sauvegardés</span>
            </div>
          </div>
        </section>

        <section className={styles.list} aria-label="Liste des devis en cours">
          {loaded && drafts.length === 0 && (
            <div className={styles.empty}>
              <FileClock strokeWidth={1.6} aria-hidden />
              <p>Aucun devis en cours.</p>
              <Link href="/devis">Créer un nouveau devis</Link>
            </div>
          )}

          {drafts.map((draft, index) => (
            <article className={styles.draftItem} key={draft.id}>
              <button
                className={styles.deleteDraftButton}
                type="button"
                aria-label={`Supprimer ${getDraftTitle(draft, index)}`}
                onClick={() => deleteDraft(draft.id)}
              >
                <X strokeWidth={1.8} aria-hidden />
              </button>
              <Link className={styles.draftCard} href={`/devis?view=draft&id=${draft.id}`}>
                <FileClock className={styles.draftIcon} strokeWidth={1.6} aria-hidden />
                <span className={styles.draftContent}>
                  <strong>{getDraftTitle(draft, index)}</strong>
                  <small>{formatDraftDate(draft.createdAt)}</small>
                  <span>{getDraftDetails(draft)}</span>
                </span>
              </Link>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
