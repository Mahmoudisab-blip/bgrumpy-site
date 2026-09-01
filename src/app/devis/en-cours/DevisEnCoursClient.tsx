"use client";

import Link from "next/link";
import { ArrowLeft, Ban, CheckCircle2, FileClock, Plus, Send, X } from "lucide-react";
import { useEffect, useState } from "react";
import {
  migrateLegacyDraft,
  removeDraftRecord,
  type DevisDraftRecord,
} from "@/src/lib/devisDraftStorage";
import {
  readClientProfile,
  readClientQuotes,
  writeClientQuotes,
  type ClientQuote,
} from "@/src/lib/clientProfileStorage";
import {
  buildDevisMessageText,
  getScopedMessagerieStorageKey,
  getThreadQuoteId,
  readStoredMessagerieFromServer,
  writeStoredMessagerie,
  type MessagerieMessage,
  type MessagerieThread,
  type StoredMessagerie,
} from "@/src/lib/messagerieStorage";
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

type ServerDevisPayload = {
  id: string;
  sentAt: string;
  payload: ClientQuote["form"] & {
    referencePhotos?: ClientQuote["references"];
  };
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

const readStoredMessagerie = async (): Promise<StoredMessagerie> => {
  const serverMessagerie = await readStoredMessagerieFromServer();

  if (serverMessagerie) {
    return serverMessagerie;
  }

  try {
    const raw = window.localStorage.getItem(getScopedMessagerieStorageKey());
    const parsed = raw ? (JSON.parse(raw) as Partial<StoredMessagerie>) : {};

    return {
      threads: Array.isArray(parsed.threads) ? parsed.threads : [],
      messages: Array.isArray(parsed.messages) ? parsed.messages : [],
      activeThreadId: parsed.activeThreadId,
    };
  } catch {
    window.localStorage.removeItem(getScopedMessagerieStorageKey());
    return { threads: [], messages: [] };
  }
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

const getQuoteTitle = (quote: ClientQuote) =>
  quote.title || quote.form?.devis || quote.type || "Demande de devis";

const getQuoteDetails = (quote: ClientQuote) => {
  const details = [
    quote.type,
    quote.zone,
    quote.taille ? `${quote.taille} cm` : "",
    quote.budget ? `${quote.budget} € max` : "",
  ].filter(Boolean);

  return details.length > 0 ? details.join(" · ") : "Demande envoyée";
};

const makeQuoteFromServerDevis = (item: ServerDevisPayload): ClientQuote => ({
  id: item.id,
  title: item.payload?.devis || "Demande de devis",
  type: item.payload?.devis || "Demande de devis",
  status: "En attente",
  sentAt: item.sentAt,
  flashId: item.payload?.flashId,
  flashIds: item.payload?.flashIds,
  budget: item.payload?.budget,
  zone: item.payload?.zone,
  taille: item.payload?.taille,
  projet: item.payload?.projet,
  disponibilites: item.payload?.disponibilites,
  reglement: item.payload?.reglement,
  commentaires: item.payload?.commentaires,
  references: item.payload?.referencePhotos,
  form: item.payload,
});

const loadServerQuotes = async () => {
  const profile = readClientProfile();

  if (!profile.email) {
    return readClientQuotes();
  }

  try {
    const response = await fetch("/api/client/devis", {
      cache: "no-store",
    });
    const payload = (await response.json().catch(() => null)) as { devis?: ServerDevisPayload[] } | null;
    const serverQuotes = Array.isArray(payload?.devis) ? payload.devis.map(makeQuoteFromServerDevis) : [];
    const localQuotes = readClientQuotes();
    const merged = [
      ...serverQuotes,
      ...localQuotes.filter((quote) => !serverQuotes.some((serverQuote) => serverQuote.id === quote.id)),
    ];

    writeClientQuotes(merged);

    return merged;
  } catch {
    return readClientQuotes();
  }
};

const isInitialQuoteMessage = (message: MessagerieMessage) =>
  message.author === "client" &&
  message.text.trim().toLowerCase().startsWith("nouvelle demande de devis");

const findQuoteThread = (
  quote: ClientQuote,
  threads: MessagerieThread[],
  messages: MessagerieMessage[],
) => {
  const expectedQuoteId = quote.id.replace(/^devis-/, "");
  const directThread = threads.find((thread) => getThreadQuoteId(thread.id) === expectedQuoteId);

  if (directThread) {
    return directThread;
  }

  const expectedText = quote.form ? buildDevisMessageText({
    nom: quote.form.nom ?? "",
    prenom: quote.form.prenom ?? "",
    portable: quote.form.portable ?? "",
    email: quote.form.email ?? "",
    majeur: quote.form.majeur ?? "",
    age: quote.form.age ?? "",
    devis: quote.form.devis ?? "",
    flashId: quote.form.flashId ?? "",
    flashIds: quote.form.flashIds ?? [],
    budget: quote.form.budget ?? 0,
    projet: quote.form.projet ?? "",
    zone: quote.form.zone ?? "",
    taille: quote.form.taille ?? 0,
    disponibilites: quote.form.disponibilites ?? [],
    reglement: quote.form.reglement ?? "",
    commentaires: quote.form.commentaires ?? "",
    spams: Boolean(quote.form.spams),
    demenagement: Boolean(quote.form.demenagement),
    copie: false,
  }) : "";

  const initialMessage = messages.find((message) =>
    isInitialQuoteMessage(message) &&
    message.text === expectedText,
  );

  return initialMessage ? threads.find((thread) => thread.id === initialMessage.threadId) : undefined;
};

const canCancelQuote = (
  quote: ClientQuote,
  threads: MessagerieThread[],
  messages: MessagerieMessage[],
) => {
  if (quote.status === "Annulé" || quote.status === "Accepté" || quote.status === "Refusé" || quote.status === "Réservé") {
    return false;
  }

  const thread = findQuoteThread(quote, threads, messages);

  if (!thread) {
    return true;
  }

  return messages
    .filter((message) => message.threadId === thread.id && isInitialQuoteMessage(message))
    .every((message) => message.state !== "read");
};

export default function DevisEnCoursClient() {
  const [drafts, setDrafts] = useState<DevisDraftRecord<DraftForm>[]>([]);
  const [quotes, setQuotes] = useState<ClientQuote[]>([]);
  const [messagerie, setMessagerie] = useState<StoredMessagerie>({ threads: [], messages: [] });
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setDrafts(migrateLegacyDraft<DraftForm>());
      void loadServerQuotes().then(setQuotes);
      void readStoredMessagerie().then(setMessagerie);
      setLoaded(true);
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  const deleteDraft = (id: string) => {
    removeDraftRecord<DraftForm>(id);
    setDrafts((current) => current.filter((draft) => draft.id !== id));
  };

  const cancelQuote = (quote: ClientQuote) => {
    if (!canCancelQuote(quote, messagerie.threads, messagerie.messages)) {
      return;
    }

    const now = new Intl.DateTimeFormat("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date());
    const thread = findQuoteThread(quote, messagerie.threads, messagerie.messages);
    const nextQuotes = quotes.map((item) =>
      item.id === quote.id ? { ...item, status: "Annulé" as const } : item,
    );
    const nextMessagerie = thread
      ? {
          ...messagerie,
          threads: messagerie.threads.map((item) =>
            item.id === thread.id
              ? {
                  ...item,
                  lastMessage: "Devis annulé par le client.",
                  status: "Devis annulé",
                  time: now,
                  unread: 0,
                }
              : item,
          ),
          messages: [
            ...messagerie.messages,
            {
              id: `${thread.id}-client-cancel`,
              threadId: thread.id,
              author: "client" as const,
              text: "Devis annulé par le client.",
              time: now,
              state: "sent" as const,
            },
          ],
        }
      : messagerie;

    writeClientQuotes(nextQuotes);
    setQuotes(nextQuotes);

    if (thread) {
      writeStoredMessagerie(nextMessagerie);
      setMessagerie(nextMessagerie);
    }
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
                Retrouvez les brouillons commencés et les devis déjà envoyés au studio.
              </p>
            </div>

            <div data-page-hero-badges aria-label="Qualités des devis">
              <span>Brouillons sauvegardés</span>
              <span>Demandes envoyées</span>
            </div>
          </div>
        </section>

        <section className={styles.sectionBlock} aria-labelledby="drafts-title">
          <div className={styles.sectionTitle}>
            <FileClock strokeWidth={1.6} aria-hidden />
            <h2 id="drafts-title">Devis en cours</h2>
            <span>{drafts.length}</span>
          </div>

          <div className={styles.list} aria-label="Liste des devis en cours">
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
          </div>
        </section>

        <section className={styles.sectionBlock} aria-labelledby="sent-title">
          <div className={styles.sectionTitle}>
            <Send strokeWidth={1.6} aria-hidden />
            <h2 id="sent-title">Devis envoyés</h2>
            <span>{quotes.length}</span>
          </div>

          <div className={styles.list} aria-label="Liste des devis envoyés">
            {loaded && quotes.length === 0 && (
              <div className={styles.empty}>
                <Send strokeWidth={1.6} aria-hidden />
                <p>Aucun devis envoyé.</p>
                <Link href="/devis">Envoyer un devis</Link>
              </div>
            )}

            {quotes.map((quote) => {
              const cancellable = canCancelQuote(quote, messagerie.threads, messagerie.messages);

              return (
                <article className={styles.draftItem} key={quote.id}>
                  {cancellable ? (
                    <button
                      className={styles.cancelQuoteButton}
                      type="button"
                      aria-label={`Annuler ${getQuoteTitle(quote)}`}
                      onClick={() => cancelQuote(quote)}
                    >
                      <Ban strokeWidth={1.8} aria-hidden />
                    </button>
                  ) : null}

                  <div className={`${styles.draftCard} ${styles.sentCard}`}>
                    <span className={`${styles.status} ${quote.status === "Annulé" ? styles.statusCancelled : ""}`}>
                      {quote.status}
                    </span>
                    <CheckCircle2 className={styles.draftIcon} strokeWidth={1.6} aria-hidden />
                    <span className={styles.draftContent}>
                      <strong>{getQuoteTitle(quote)}</strong>
                      <small>{formatDraftDate(quote.sentAt)}</small>
                      <span>{getQuoteDetails(quote)}</span>
                      {cancellable ? (
                        <em>Annulable tant que le studio ne l’a pas lu</em>
                      ) : quote.status === "Annulé" ? (
                        <em>Annulé</em>
                      ) : (
                        <em>Déjà reçu par le studio</em>
                      )}
                    </span>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}
