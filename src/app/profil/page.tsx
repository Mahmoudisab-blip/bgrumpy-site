"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  Check,
  FileText,
  ImageIcon,
  LockKeyhole,
  LogOut,
  Mail,
  Pencil,
  X,
} from "lucide-react";
import {
  addClientQuote,
  addClientReservation,
  emptyClientProfile,
  formatSelection,
  findClientAccount,
  getClientScopedStorageKey,
  normalizeClientEmail,
  replaceClientAccountEmail,
  readClientProfile,
  readClientQuotes,
  readClientReservations,
  writeClientQuotes,
  writeClientProfile,
  type ClientFlash,
  type ClientProfile,
  type ClientQuote,
  type ClientReservation,
} from "@/src/lib/clientProfileStorage";
import { logoutEverywhere } from "@/src/lib/logoutSession";
import styles from "./ProfilPage.module.css";

type CompletedDevis = {
  form?: ClientQuote["form"];
  sentAt?: string;
};

type ServerClientState = {
  devis?: Array<{
    id: string;
    sentAt: string;
    status?: ClientQuote["status"];
    payload: ClientQuote["form"] & { referencePhotos?: ClientQuote["references"] };
  }>;
  reservations?: ClientReservation[];
};

const completedStorageKey = "bgrumpy-devis-completed";
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const formatDate = (value?: string) => {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
};

const formatDateTime = (value?: string) => {
  if (!value) return "Créneau à définir";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(date);
};

const fieldLabels: Array<{
  key: keyof ClientProfile;
  label: string;
  type: string;
  autoComplete?: string;
  placeholder: string;
}> = [
  { key: "prenom", label: "Prénom", type: "text", autoComplete: "given-name", placeholder: "Votre prénom" },
  { key: "nom", label: "Nom", type: "text", autoComplete: "family-name", placeholder: "Votre nom" },
  { key: "email", label: "Email", type: "email", autoComplete: "email", placeholder: "prenom@email.fr" },
  { key: "telephone", label: "Téléphone", type: "tel", autoComplete: "tel", placeholder: "06..." },
  { key: "dateNaissance", label: "Date de naissance", type: "date", autoComplete: "bday", placeholder: "" },
];

const quoteStatusClass: Record<ClientQuote["status"], string> = {
  "En attente": styles.statusWaiting,
  "Réponse envoyée": styles.statusAnswered,
  Accepté: styles.statusAccepted,
  Refusé: styles.statusRefused,
  Réservé: styles.statusReserved,
  Annulé: styles.statusRefused,
};

export default function ProfilPage() {
  const [profile, setProfile] = useState<ClientProfile>(emptyClientProfile);
  const [draftProfile, setDraftProfile] = useState<ClientProfile>(emptyClientProfile);
  const [quotes, setQuotes] = useState<ClientQuote[]>([]);
  const [reservations, setReservations] = useState<ClientReservation[]>([]);
  const [editing, setEditing] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [selectedQuote, setSelectedQuote] = useState<ClientQuote | null>(null);
  const [selectedFlash, setSelectedFlash] = useState<ClientFlash | null>(null);

  useEffect(() => {
    queueMicrotask(() => {
      const storedProfile = readClientProfile();
      const storedQuotes = readClientQuotes();
      const storedReservations = readClientReservations();

      try {
        const rawCompleted =
          window.localStorage.getItem(getClientScopedStorageKey(completedStorageKey)) ??
          window.localStorage.getItem(completedStorageKey);
        const completed = rawCompleted ? (JSON.parse(rawCompleted) as CompletedDevis) : null;

        if (
          completed?.form &&
          completed.sentAt &&
          normalizeClientEmail(completed.form.email ?? "") === normalizeClientEmail(storedProfile.email)
        ) {
          const selectedFlashIds =
            completed.form.flashIds && completed.form.flashIds.length > 0
              ? completed.form.flashIds
              : completed.form.flashId
                ? [completed.form.flashId]
                : [];
          const selectedFlashes = completed.form.selectedFlashes ?? [];
          const selectedFlashTitle = selectedFlashes.map((item) => item.title).join(", ");
          const completedQuote: ClientQuote = {
            id: `completed-${completed.sentAt}`,
            title: selectedFlashTitle || completed.form.devis || "Demande de devis",
            type: completed.form.devis || "Demande de devis",
            status: "En attente",
            sentAt: completed.sentAt,
            flashId: selectedFlashIds[0] ?? completed.form.flashId,
            flashIds: selectedFlashIds,
            selectedFlashes,
            budget: completed.form.budget,
            zone: formatSelection(completed.form.zone),
            taille: completed.form.taille,
            projet: completed.form.projet,
            disponibilites: completed.form.disponibilites,
            reglement: formatSelection(completed.form.reglement),
            commentaires: completed.form.commentaires,
            form: completed.form,
          };

          addClientQuote(completedQuote);
          selectedFlashes.forEach((flash) => {
            addClientReservation({
              id: `flash-${flash.id}`,
              title: flash.title,
              status: "reserved",
              note: "Flash réservé via la demande de devis.",
              flashId: flash.id,
            });
          });
        }
      } catch {
        window.localStorage.removeItem(completedStorageKey);
      }

      const nextQuotes = readClientQuotes();
      const nextReservations = readClientReservations();

      setProfile(storedProfile);
      setDraftProfile(storedProfile);
      setQuotes(nextQuotes.length > 0 ? nextQuotes : storedQuotes);
      setReservations(nextReservations.length > 0 ? nextReservations : storedReservations);

      void fetch("/api/client/devis", { cache: "no-store" })
        .then((response) => (response.ok ? response.json() : null))
        .then((payload: ServerClientState | null) => {
          if (!payload) return;

          const serverQuotes: ClientQuote[] = (payload.devis ?? []).map((item) => ({
            id: item.id,
            title: item.payload?.selectedFlashes?.map((flash) => flash.title).join(", ") || item.payload?.devis || "Demande de devis",
            type: item.payload?.devis || "Demande de devis",
            status: item.status ?? "En attente",
            sentAt: item.sentAt,
            flashId: item.payload?.flashId,
            flashIds: item.payload?.flashIds,
            selectedFlashes: item.payload?.selectedFlashes,
            budget: item.payload?.budget,
            zone: formatSelection(item.payload?.zone),
            taille: item.payload?.taille,
            projet: item.payload?.projet,
            disponibilites: item.payload?.disponibilites,
            reglement: formatSelection(item.payload?.reglement),
            commentaires: item.payload?.commentaires,
            references: item.payload?.referencePhotos,
            form: item.payload,
          }));
          const mergedQuotes = [
            ...serverQuotes,
            ...nextQuotes.filter((quote) => !serverQuotes.some((serverQuote) => serverQuote.id === quote.id)),
          ];
          const serverReservations = payload.reservations ?? [];
          const serverFlashReservations = serverQuotes.flatMap((quote) =>
            (quote.selectedFlashes ?? []).map((flash) => ({
              id: `flash-${flash.id}`,
              title: flash.title,
              status: "reserved" as const,
              note: "Flash réservé via la demande de devis.",
              flashId: flash.id,
            })),
          );
          const mergedReservations = [
            ...serverReservations,
            ...serverFlashReservations.filter(
              (reservation) => !serverReservations.some((serverReservation) => serverReservation.id === reservation.id),
            ),
            ...nextReservations.filter(
              (reservation) =>
                !serverReservations.some((serverReservation) => serverReservation.id === reservation.id) &&
                !serverFlashReservations.some((serverReservation) => serverReservation.id === reservation.id),
            ),
          ];

          writeClientQuotes(mergedQuotes);
          setQuotes(mergedQuotes);
          setReservations(mergedReservations);
        })
        .catch(() => undefined);
    });
  }, []);

  const reservationGroups = useMemo(
    () => ({
      appointments: reservations.filter(
        (reservation) => reservation.id.startsWith("quote-rdv-") && reservation.status !== "past",
      ),
      flashs: reservations.filter((reservation) => reservation.status === "reserved"),
    }),
    [reservations],
  );

  const logoutClient = async () => {
    setProfile(emptyClientProfile);
    setDraftProfile(emptyClientProfile);
    await logoutEverywhere();
  };

  const saveProfile = async () => {
    setProfileError("");
    const currentEmail = normalizeClientEmail(profile.email);
    const nextEmail = normalizeClientEmail(draftProfile.email);

    if (!emailPattern.test(nextEmail)) {
      setProfileError("Indique une adresse mail valide.");
      return;
    }

    const currentAccount = findClientAccount(currentEmail);
    const existingAccount = findClientAccount(nextEmail);

    if (existingAccount && nextEmail !== currentEmail) {
      setProfileError("Cette adresse mail est déjà utilisée par un autre compte.");
      return;
    }

    const nextProfile = {
      ...draftProfile,
      email: nextEmail,
      telephone: draftProfile.telephone.replace(/\D/g, "").slice(0, 10),
    };

    if (currentAccount) {
      try {
        const response = await fetch("/api/client/account", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: nextEmail,
            password: currentAccount.password,
            previousEmail: currentEmail,
            profile: nextProfile,
          }),
        });
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;

        if (!response.ok && response.status !== 503) {
          setProfileError(payload?.error ?? "Le profil n'a pas pu être enregistré.");
          return;
        }
      } catch {
        // Continue with local fallback for development/offline usage.
      }

      replaceClientAccountEmail(currentEmail, {
        ...currentAccount,
        email: nextEmail,
        profile: nextProfile,
      });
    }

    writeClientProfile(nextProfile);
    setProfile(nextProfile);
    setDraftProfile(nextProfile);
    setEditing(false);
  };

  const cancelEdit = () => {
    setProfileError("");
    setDraftProfile(profile);
    setEditing(false);
  };

  const updateProfile = (key: keyof ClientProfile, value: string) => {
    setDraftProfile((current) => ({
      ...current,
      [key]: key === "telephone" ? value.replace(/\D/g, "").slice(0, 10) : value,
    }));
  };

  return (
    <main className={styles.page} data-editorial-page>
      <div className={styles.shell} data-page-shell>
        <section className={styles.hero} data-page-hero>
          <img
            className={styles.heroImage}
            src="/7CD67A83-6067-4ECE-BC0C-ADBB221F50EF.png"
            alt=""
            aria-hidden="true"
          />
          <div className={styles.heroOverlay} aria-hidden="true" />
          <div className={styles.heroVeil} aria-hidden="true" />

          <div className={styles.heroContent} data-page-hero-content>
            <div>
              <p data-page-brand>B.Grumpy</p>
              <p className={styles.kicker} data-page-brand-sub>PROFIL</p>
            </div>

            <div data-page-hero-copy>
              <h1 className={styles.title} data-page-title>Mon profil</h1>
              <p className={styles.intro} data-page-intro>
                Gérez vos informations, vos devis et vos réservations au même endroit.
              </p>
            </div>

            <div data-page-hero-badges aria-label="Qualités du profil">
              <span>Espace client</span>
              <span>Devis</span>
              <span>Flashs</span>
            </div>
          </div>
        </section>

        <div data-page-content="account">
        <section className={styles.card} aria-labelledby="infos-title">
          <div className={styles.sectionHeader}>
            <div>
              <p className={styles.eyebrow}>Compte</p>
              <h2 id="infos-title">Mes informations</h2>
            </div>
            <div className={styles.headerActions}>
              {editing && (
                <button className={styles.secondaryButton} type="button" onClick={cancelEdit}>
                  Annuler
                </button>
              )}
              <button
                className={styles.actionButton}
                type="button"
                onClick={editing ? saveProfile : () => setEditing(true)}
              >
                {editing ? <Check strokeWidth={1.8} aria-hidden /> : <Pencil strokeWidth={1.8} aria-hidden />}
                <span>{editing ? "Enregistrer" : "Modifier"}</span>
              </button>
            </div>
          </div>

          <div className={styles.formGrid}>
            {fieldLabels.map((field) => (
              <label className={styles.field} key={field.key}>
                <span>{field.label}</span>
                <input
                  type={field.type}
                  autoComplete={field.autoComplete}
                  disabled={!editing}
                  placeholder={field.placeholder}
                  value={draftProfile[field.key]}
                  onChange={(event) => updateProfile(field.key, event.target.value)}
                />
              </label>
            ))}
          </div>

          {profileError && <p className={styles.error}>{profileError}</p>}
        </section>

        <section className={styles.card} aria-labelledby="devis-title">
          <div className={styles.sectionHeader}>
            <div>
              <p className={styles.eyebrow}>Demandes</p>
              <h2 id="devis-title">Mes devis</h2>
            </div>
            <FileText className={styles.sectionIcon} strokeWidth={1.6} aria-hidden />
          </div>

          <div className={styles.stack}>
            {quotes.length === 0 ? (
              <p className={styles.empty}>Aucune demande de devis envoyée pour le moment.</p>
            ) : (
              quotes.map((quote) => (
                <button
                  className={`${styles.listItem} ${styles.quoteButton}`}
                  key={quote.id}
                  type="button"
                  onClick={() => setSelectedQuote(quote)}
                >
                  <div>
                    <strong>{quote.title}</strong>
                    <span>
                      {formatDate(quote.sentAt)}
                      {quote.zone ? ` · ${quote.zone}` : ""}
                      {quote.budget ? ` · ${quote.budget} €` : ""}
                    </span>
                  </div>
                  <span className={`${styles.status} ${quoteStatusClass[quote.status]}`}>
                    {quote.status}
                  </span>
                </button>
              ))
            )}
          </div>
        </section>

        <ReservationGroup
          id="flashs-reserves-title"
          title="Flashs réservés"
          items={reservationGroups.flashs}
          empty="Aucun flash réservé."
          onSelect={(reservation) => {
            const flash = quotes
              .flatMap((quote) => quote.selectedFlashes ?? [])
              .find((item) => item.id === reservation.flashId);

            if (flash) {
              setSelectedFlash(flash);
            }
          }}
        />

        {reservationGroups.appointments.length > 0 ? (
          <AppointmentGroup items={reservationGroups.appointments} />
        ) : null}

        <section className={styles.card} aria-labelledby="settings-title">
          <div className={styles.sectionHeader}>
            <div>
              <p className={styles.eyebrow}>Sécurité</p>
              <h2 id="settings-title">Paramètres</h2>
            </div>
          </div>

          <div className={styles.settingsList}>
            <button type="button">
              <Mail strokeWidth={1.7} aria-hidden />
              <span>Modifier email</span>
            </button>
            <button type="button">
              <LockKeyhole strokeWidth={1.7} aria-hidden />
              <span>Modifier mot de passe</span>
            </button>
            <button className={styles.logoutButton} type="button" onClick={logoutClient}>
              <LogOut strokeWidth={1.7} aria-hidden />
              <span>Déconnexion</span>
            </button>
          </div>
        </section>
        </div>
      </div>

      {selectedQuote && (
        <QuotePreview quote={selectedQuote} onClose={() => setSelectedQuote(null)} />
      )}
      {selectedFlash && (
        <FlashPreview flash={selectedFlash} onClose={() => setSelectedFlash(null)} />
      )}
    </main>
  );
}

function getQuoteRows(quote: ClientQuote) {
  const form = quote.form;
  const flashIds = form?.flashIds && form.flashIds.length > 0
    ? form.flashIds
    : form?.flashId
      ? [form.flashId]
      : quote.flashIds && quote.flashIds.length > 0
        ? quote.flashIds
        : quote.flashId
          ? [quote.flashId]
          : [];
  const selectedFlashes = (quote.selectedFlashes ?? quote.form?.selectedFlashes ?? [])
    .filter((item) => flashIds.includes(item.id));
  const selectedFlashTitles = selectedFlashes.map((item) => item.title).join(", ");

  return [
    ["Nom", form?.nom],
    ["Prénom", form?.prenom],
    ["Portable", form?.portable],
    ["Adresse mail", form?.email],
    ["Majeur", form?.majeur],
    ["Âge", form?.majeur === "Non" ? form.age : ""],
    ["Type de demande", form?.devis ?? quote.type],
    ["Flashs sélectionnés", selectedFlashTitles],
    ["Budget max", form?.budget ? `${form.budget} €` : quote.budget ? `${quote.budget} €` : ""],
    ["Projet", form?.projet ?? quote.projet],
    ["Zone", formatSelection(form?.zone ?? quote.zone)],
    ["Taille", form?.taille ? `${form.taille} cm` : quote.taille ? `${quote.taille} cm` : ""],
    ["Disponibilités", form?.disponibilites?.join(", ") ?? quote.disponibilites?.join(", ")],
    ["Règlement", formatSelection(form?.reglement ?? quote.reglement)],
    ["Commentaires", form?.commentaires ?? quote.commentaires],
    ["Spams", form?.spams ? "Information lue" : ""],
    ["Déménagement", form?.demenagement ? "Information lue" : ""],
  ].filter(([, value]) => value);
}

function QuotePreview({ quote, onClose }: { quote: ClientQuote; onClose: () => void }) {
  const rows = getQuoteRows(quote);

  return (
    <div className={styles.modalOverlay} role="presentation" onClick={onClose}>
      <section
        className={styles.quoteModal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="quote-preview-title"
        onClick={(event) => event.stopPropagation()}
      >
        <button className={styles.modalClose} type="button" aria-label="Fermer" onClick={onClose}>
          <X strokeWidth={1.8} aria-hidden />
        </button>

        <div className={styles.sectionHeader}>
          <div>
            <p className={styles.eyebrow}>Lecture seule</p>
            <h2 id="quote-preview-title">{quote.title}</h2>
          </div>
          <span className={`${styles.status} ${quoteStatusClass[quote.status]}`}>
            {quote.status}
          </span>
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

function FlashPreview({ flash, onClose }: { flash: ClientFlash; onClose: () => void }) {
  return (
    <div className={styles.modalOverlay} role="presentation" onClick={onClose}>
      <section
        className={styles.quoteModal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="flash-preview-title"
        onClick={(event) => event.stopPropagation()}
      >
        <button className={styles.modalClose} type="button" aria-label="Fermer" onClick={onClose}>
          <X strokeWidth={1.8} aria-hidden />
        </button>

        <div className={styles.sectionHeader}>
          <div>
            <p className={styles.eyebrow}>Flash réservé</p>
            <h2 id="flash-preview-title">{flash.title}</h2>
          </div>
          <span className={`${styles.status} ${styles.statusReserved}`}>Réservé</span>
        </div>

        <div className={styles.flashPreviewContent}>
          <img src={flash.image.src} alt={flash.image.alt} />
          <div className={styles.previewRows}>
            <div className={styles.previewRow}>
              <span>Référence</span>
              <strong>{flash.reference}</strong>
            </div>
            <div className={styles.previewRow}>
              <span>Prix</span>
              <strong>{flash.price ? `${flash.price} €` : "À définir"}</strong>
            </div>
            <div className={styles.previewRow}>
              <span>Style</span>
              <strong>{flash.style || "À définir"}</strong>
            </div>
            <div className={styles.previewRow}>
              <span>Taille</span>
              <strong>{flash.size || "À définir"}</strong>
            </div>
            <div className={styles.previewRow}>
              <span>Placement</span>
              <strong>{flash.placement || "À définir"}</strong>
            </div>
            <div className={styles.previewRow}>
              <span>Description</span>
              <strong>{flash.description || "À définir"}</strong>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function ReservationGroup({
  id,
  title,
  items,
  empty,
  onSelect,
}: {
  id: string;
  title: string;
  items: ClientReservation[];
  empty: string;
  onSelect: (item: ClientReservation) => void;
}) {
  return (
    <section className={styles.card} aria-labelledby={id}>
      <div className={styles.sectionHeader}>
        <div>
          <p className={styles.eyebrow}>Agenda</p>
          <h2 id={id}>{title}</h2>
        </div>
        <CalendarDays className={styles.sectionIcon} strokeWidth={1.6} aria-hidden />
      </div>

      <div className={styles.stack}>
        {items.length === 0 ? (
          <p className={styles.empty}>{empty}</p>
        ) : (
          items.map((item) => (
            <button
              className={`${styles.listItem} ${styles.quoteButton}`}
              key={item.id}
              type="button"
              onClick={() => onSelect(item)}
            >
              <div>
                <strong>{item.title}</strong>
                <span>{item.date ? formatDate(item.date) : item.note}</span>
              </div>
              <ImageIcon className={styles.itemIcon} strokeWidth={1.6} aria-hidden />
            </button>
          ))
        )}
      </div>
    </section>
  );
}

function AppointmentGroup({ items }: { items: ClientReservation[] }) {
  return (
    <section className={styles.card} aria-labelledby="appointments-title">
      <div className={styles.sectionHeader}>
        <div>
          <p className={styles.eyebrow}>Agenda</p>
          <h2 id="appointments-title">Mes rendez-vous</h2>
        </div>
        <CalendarDays className={styles.sectionIcon} strokeWidth={1.6} aria-hidden />
      </div>

      <div className={styles.stack}>
        {items.map((item) => (
          <article className={styles.listItem} key={item.id}>
            <div>
              <strong>{item.title}</strong>
              <span>{formatDateTime(item.date)}</span>
              {item.note ? <small>{item.note}</small> : null}
            </div>
            <span className={`${styles.status} ${item.adminStatus === "Confirmé" ? styles.statusAccepted : ""}`}>
              {item.adminStatus ?? "À confirmer"}
            </span>
          </article>
        ))}
      </div>
    </section>
  );
}
