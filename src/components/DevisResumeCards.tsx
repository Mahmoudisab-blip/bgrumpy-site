"use client";

import Link from "next/link";
import { ClipboardCheck, FileClock } from "lucide-react";
import { useEffect, useState } from "react";
import styles from "./DevisResumeCards.module.css";

const draftStorageKey = "bgrumpy-devis-draft";
const completedStorageKey = "bgrumpy-devis-completed";

type StoredForm = {
  form?: {
    prenom?: string;
    devis?: string;
    budget?: number;
  };
};

type ResumeState = {
  draft: StoredForm | null;
  completed: StoredForm | null;
};

const readStoredForm = (key: string) => {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as StoredForm) : null;
  } catch {
    window.localStorage.removeItem(key);
    return null;
  }
};

export default function DevisResumeCards() {
  const [state, setState] = useState<ResumeState>({ draft: null, completed: null });

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setState({
        draft: readStoredForm(draftStorageKey),
        completed: readStoredForm(completedStorageKey),
      });
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  if (!state.draft && !state.completed) {
    return null;
  }

  return (
    <section className={styles.resume} aria-label="Mes devis">
      {state.draft && (
        <Link className={styles.card} href="/devis?view=draft">
          <FileClock className={styles.icon} strokeWidth={1.65} aria-hidden />
          <span>
            <strong>Devis en cours</strong>
            <small>Reprendre la demande</small>
          </span>
        </Link>
      )}

      {state.completed && (
        <Link className={styles.card} href="/devis?view=completed">
          <ClipboardCheck className={styles.icon} strokeWidth={1.65} aria-hidden />
          <span>
            <strong>Devis terminé</strong>
            <small>
              {state.completed.form?.devis || "Voir l'ancien devis"}
              {state.completed.form?.budget ? ` · ${state.completed.form.budget} €` : ""}
            </small>
          </span>
        </Link>
      )}
    </section>
  );
}
