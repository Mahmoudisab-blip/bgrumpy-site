"use client";

import Link from "next/link";
import { ClipboardCheck, Euro, MapPin, Ruler, X } from "lucide-react";
import { useEffect, useState } from "react";
import { flashItems } from "@/src/data/flashItems";
import { getClientScopedStorageKey, normalizeClientEmail, readClientProfile } from "@/src/lib/clientProfileStorage";
import { migrateLegacyDraft, type DevisDraftRecord } from "@/src/lib/devisDraftStorage";
import styles from "./DevisResumeCards.module.css";

const completedStorageKey = "bgrumpy-devis-completed";

type StoredForm = {
  form?: {
    nom?: string;
    prenom?: string;
    portable?: string;
    email?: string;
    majeur?: string;
    age?: string;
    devis?: string;
    flashId?: string;
    flashIds?: string[];
    budget?: number;
    projet?: string;
    zone?: string;
    taille?: number;
    inspiImage?: {
      name: string;
      url: string;
    };
    disponibilites?: string[];
    reglement?: string;
    commentaires?: string;
    spams?: boolean;
    demenagement?: boolean;
  };
  sentAt?: string;
};

type ResumeState = {
  drafts: DevisDraftRecord<StoredForm["form"]>[];
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

const belongsToCurrentClient = (form?: StoredForm["form"]) => {
  const currentEmail = normalizeClientEmail(readClientProfile().email);
  const formEmail = normalizeClientEmail(form?.email ?? "");

  return !currentEmail || formEmail === currentEmail;
};

const getFormFlash = (form?: StoredForm["form"]) => {
  const flashIds = form?.flashIds && form.flashIds.length > 0
    ? form.flashIds
    : form?.flashId
      ? [form.flashId]
      : [];

  return flashItems.find((item) => flashIds.includes(item.id));
};

const getFormImage = (form?: StoredForm["form"]) => {
  const flashImage = getFormFlash(form)?.image;

  if (flashImage) return flashImage;

  if (form?.inspiImage) {
    return {
      src: form.inspiImage.url,
      alt: form.inspiImage.name,
    };
  }

  return {
    src: "/E33945DF-ADFA-4EEB-B7B2-499B4C6C9CE5.png",
    alt: "Demande de devis tattoo",
  };
};

const getClientName = (form?: StoredForm["form"], fallback = "Client") =>
  [form?.prenom, form?.nom].filter(Boolean).join(" ") || fallback;

const getCardTitle = (form?: StoredForm["form"], fallback = "Devis en cours") =>
  getFormFlash(form)?.title || form?.devis || fallback;

export default function DevisResumeCards() {
  const [state, setState] = useState<ResumeState>({ drafts: [], completed: null });
  const [previewCompleted, setPreviewCompleted] = useState<StoredForm | null>(null);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setState({
        drafts: migrateLegacyDraft<StoredForm["form"]>().filter((draft) => belongsToCurrentClient(draft.form)),
        completed: (() => {
          const completed =
            readStoredForm(getClientScopedStorageKey(completedStorageKey)) ?? readStoredForm(completedStorageKey);

          return completed && belongsToCurrentClient(completed.form) ? completed : null;
        })(),
      });
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  if (state.drafts.length === 0 && !state.completed) {
    return null;
  }

  return (
    <section className={styles.resume} aria-label="Mes devis">
      {state.drafts.map((draft, index) => {
        const image = getFormImage(draft.form);
        const title = getCardTitle(draft.form, `Devis en cours ${index + 1}`);

        return (
          <Link className={styles.card} href={`/devis?view=draft&id=${draft.id}`} key={draft.id}>
            <span className={styles.status}>{draft.form?.devis || "Devis"}</span>
            <img className={styles.cardImage} src={image.src} alt={image.alt} />
            <span className={styles.cardBody}>
              <small>{getClientName(draft.form, `Client ${index + 1}`)}</small>
              <strong>{title}</strong>
              <span className={styles.metaGrid}>
                <span><MapPin strokeWidth={1.6} aria-hidden />{draft.form?.zone || "Zone à préciser"}</span>
                <span><Ruler strokeWidth={1.6} aria-hidden />{draft.form?.taille ? `${draft.form.taille} cm` : "Taille à préciser"}</span>
                <span><Euro strokeWidth={1.6} aria-hidden />{draft.form?.budget ? `${draft.form.budget} € max` : "Budget à préciser"}</span>
              </span>
            </span>
          </Link>
        );
      })}

      {state.completed && (
        <button
          className={styles.card}
          type="button"
          onClick={() => setPreviewCompleted(state.completed)}
        >
          <ClipboardCheck className={styles.icon} strokeWidth={1.65} aria-hidden />
          <span>
            <strong>Devis terminés</strong>
            <small>
              {state.completed.form?.devis || "Voir l'ancien devis"}
              {state.completed.form?.budget ? ` · ${state.completed.form.budget} €` : ""}
            </small>
          </span>
        </button>
      )}

      {previewCompleted && (
        <CompletedPreview completed={previewCompleted} onClose={() => setPreviewCompleted(null)} />
      )}
    </section>
  );
}

function getCompletedRows(completed: StoredForm) {
  const form = completed.form;
  const flashIds = form?.flashIds && form.flashIds.length > 0
    ? form.flashIds
    : form?.flashId
      ? [form.flashId]
      : [];
  const selectedFlashTitles = flashItems
    .filter((item) => flashIds.includes(item.id))
    .map((item) => item.title)
    .join(", ");

  return [
    ["Nom", form?.nom],
    ["Prénom", form?.prenom],
    ["Portable", form?.portable],
    ["Adresse mail", form?.email],
    ["Majeur", form?.majeur],
    ["Âge", form?.majeur === "Non" ? form.age : ""],
    ["Type de demande", form?.devis],
    ["Flashs sélectionnés", selectedFlashTitles],
    ["Budget max", form?.budget ? `${form.budget} €` : ""],
    ["Projet", form?.projet],
    ["Zone", form?.zone],
    ["Taille", form?.taille ? `${form.taille} cm` : ""],
    ["Disponibilités", form?.disponibilites?.join(", ")],
    ["Règlement", form?.reglement],
    ["Commentaires", form?.commentaires],
    ["Spams", form?.spams ? "Information lue" : ""],
    ["Déménagement", form?.demenagement ? "Information lue" : ""],
  ].filter(([, value]) => value);
}

function CompletedPreview({
  completed,
  onClose,
}: {
  completed: StoredForm;
  onClose: () => void;
}) {
  const rows = getCompletedRows(completed);
  const title = completed.form?.devis || "Devis terminé";

  return (
    <div className={styles.modalOverlay} role="presentation" onClick={onClose}>
      <section
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="completed-preview-title"
        onClick={(event) => event.stopPropagation()}
      >
        <button className={styles.modalClose} type="button" aria-label="Fermer" onClick={onClose}>
          <X strokeWidth={1.8} aria-hidden />
        </button>

        <div className={styles.modalHeader}>
          <p>Lecture seule</p>
          <h2 id="completed-preview-title">{title}</h2>
        </div>

        <div className={styles.previewRows}>
          {rows.map(([label, value]) => (
            <div className={styles.previewRow} key={label}>
              <span>{label}</span>
              <strong>{value}</strong>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
