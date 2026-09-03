"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type CSSProperties, type ReactNode } from "react";
import { createPortal } from "react-dom";
import type { FlashItem } from "@/src/data/flashItems";
import {
  legacyDraftStorageKey,
  migrateLegacyDraft,
  removeDraftRecord,
  upsertDraftRecord,
} from "@/src/lib/devisDraftStorage";
import {
  addClientQuote,
  addClientReservation,
  getClientScopedStorageKey,
  readClientProfile,
  readReservedFlashIds,
  type ClientQuote,
  type ClientProfile,
} from "@/src/lib/clientProfileStorage";
import {
  createDevisConversation,
  getScopedMessagerieStorageKey,
  readImageAttachments,
  writeStoredMessagerie,
  type StoredMessagerie,
} from "@/src/lib/messagerieStorage";
import styles from "./DevisPage.module.css";

const days = [
  { label: "Lundi", time: "14h à 18h" },
  { label: "Mardi", time: "14h à 18h" },
  { label: "Jeudi", time: "14h à 18h" },
  { label: "Vendredi", time: "14h à 18h" },
  { label: "Samedi", time: "10h à 19h" },
];

const payments = ["Espèces", "Carte Bancaire", "3x ou 4x par carte bancaire avec Alma"];
const minimumReferencePhotos = 2;

const bodyZones = [
  "Bras",
  "Avant-bras",
  "Poignet",
  "Main",
  "Épaule",
  "Dos",
  "Côtes",
  "Torse",
  "Cuisse",
  "Mollet",
  "Cheville",
  "Nuque",
];

const bodyZonePoints: Record<string, { x: number; y: number }> = {
  Bras: { x: 25, y: 45 },
  "Avant-bras": { x: 18, y: 61 },
  Poignet: { x: 15, y: 75 },
  Main: { x: 13, y: 86 },
  Épaule: { x: 28, y: 30 },
  Dos: { x: 50, y: 43 },
  Côtes: { x: 62, y: 50 },
  Torse: { x: 50, y: 42 },
  Cuisse: { x: 42, y: 68 },
  Mollet: { x: 39, y: 84 },
  Cheville: { x: 39, y: 95 },
  Nuque: { x: 50, y: 22 },
};

type FormState = {
  nom: string;
  prenom: string;
  portable: string;
  email: string;
  majeur: string;
  age: string;
  devis: string;
  flashId: string;
  flashIds: string[];
  budget: number;
  projet: string;
  zone: string;
  taille: number;
  disponibilites: string[];
  reglement: string;
  commentaires: string;
  spams: boolean;
  demenagement: boolean;
  copie: boolean;
};

type Step = {
  id: string;
  title: string;
  helper: string;
  content: ReactNode;
  fieldIds?: string[];
};

type StoredCompleted = {
  form: FormState;
  references?: RefPhoto[];
  sentAt: string;
};

type DevisApiResponse = {
  error?: string;
  storedDevis?: {
    id: string;
    sentAt: string;
  };
};

type RefPhoto = {
  id: string;
  name: string;
  url: string;
};

type ViewMode = "new" | "draft" | "completed";
type DevisWizardProps = {
  flashItems?: FlashItem[];
};

const initialState: FormState = {
  nom: "",
  prenom: "",
  portable: "",
  email: "",
  majeur: "",
  age: "",
  devis: "",
  flashId: "",
  flashIds: [],
  budget: 250,
  projet: "",
  zone: "",
  taille: 10,
  disponibilites: [],
  reglement: "",
  commentaires: "",
  spams: false,
  demenagement: false,
  copie: false,
};

const phonePattern = /^(06|07)\d{8}$/;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const completedStorageKey = "bgrumpy-devis-completed";
const getCompletedStorageKey = () => getClientScopedStorageKey(completedStorageKey);
const generatedClientLastName = "b.grumpy";

const hasRequiredClientAccount = (profile: ClientProfile) =>
  profile.prenom.trim().length >= 2 &&
  profile.nom.trim().length >= 2 &&
  profile.nom.trim().toLowerCase() !== generatedClientLastName &&
  emailPattern.test(profile.email.trim());

const appendDevisConversation = (conversation: StoredMessagerie) => {
  try {
    const raw = window.localStorage.getItem(getScopedMessagerieStorageKey());
    const current = raw ? (JSON.parse(raw) as Partial<StoredMessagerie>) : {};
    const currentThreads = Array.isArray(current.threads) ? current.threads : [];
    const currentMessages = Array.isArray(current.messages) ? current.messages : [];

    writeStoredMessagerie({
      activeThreadId: conversation.activeThreadId,
      threads: [
        ...conversation.threads,
        ...currentThreads.filter(
          (thread) => !conversation.threads.some((newThread) => newThread.id === thread.id),
        ),
      ],
      messages: [
        ...conversation.messages,
        ...currentMessages.filter(
          (message) => !conversation.messages.some((newMessage) => newMessage.id === message.id),
        ),
      ],
    });
  } catch {
    writeStoredMessagerie(conversation);
  }
};

const getAgeFromBirthdate = (dateNaissance: string) => {
  if (!dateNaissance) {
    return null;
  }

  const birthdate = new Date(`${dateNaissance}T00:00:00`);

  if (Number.isNaN(birthdate.getTime())) {
    return null;
  }

  const today = new Date();
  let age = today.getFullYear() - birthdate.getFullYear();
  const birthdayPassed =
    today.getMonth() > birthdate.getMonth() ||
    (today.getMonth() === birthdate.getMonth() && today.getDate() >= birthdate.getDate());

  if (!birthdayPassed) {
    age -= 1;
  }

  return age;
};

const getProfileInitialForm = (profile: ClientProfile): FormState => {
  const age = getAgeFromBirthdate(profile.dateNaissance);
  const hasBirthdate = age !== null;
  const hasGeneratedIdentity = profile.nom.trim().toLowerCase() === generatedClientLastName;

  return {
    ...initialState,
    nom: hasGeneratedIdentity ? "" : profile.nom.trim(),
    prenom: hasGeneratedIdentity ? "" : profile.prenom.trim(),
    portable: profile.telephone.replace(/\D/g, "").slice(0, 10),
    email: profile.email.trim(),
    majeur: hasBirthdate ? (age >= 18 ? "Oui" : "Non") : "",
    age: hasBirthdate && age < 18 ? String(Math.max(1, age)) : "",
  };
};

const hasProfileInfo = (profile: ClientProfile) =>
  Object.entries(profile).some(([key, value]) => {
    if (key === "telephone") {
      return value.replace(/\D/g, "").length > 0;
    }

    return value.trim() !== "";
  });

const isSameFormState = (first: FormState, second: FormState) =>
  (Object.keys(initialState) as Array<keyof FormState>).every((key) => {
    const firstValue = first[key];
    const secondValue = second[key];

    if (Array.isArray(firstValue) && Array.isArray(secondValue)) {
      return firstValue.length === secondValue.length && firstValue.every((value, index) => value === secondValue[index]);
    }

    return firstValue === secondValue;
  });

const budgetToSlider = (budget: number) => {
  if (budget <= 2000) {
    return Math.round(((budget - 90) / (2000 - 90)) * 700);
  }

  return Math.round(700 + ((budget - 2000) / (5000 - 2000)) * 300);
};

const sliderToBudget = (sliderValue: number) => {
  if (sliderValue <= 700) {
    return Math.round(90 + (sliderValue / 700) * (2000 - 90));
  }

  return Math.round(2000 + ((sliderValue - 700) / 300) * (5000 - 2000));
};

const isDraftStarted = (form: FormState, step: number) =>
  step > 0 ||
  form.nom.trim() !== "" ||
  form.prenom.trim() !== "" ||
  form.portable.trim() !== "" ||
  form.email.trim() !== "" ||
  form.majeur !== "" ||
  form.devis !== "" ||
  form.projet.trim() !== "" ||
  form.zone !== "" ||
  form.disponibilites.length > 0 ||
  form.reglement !== "";

export default function DevisWizard({ flashItems: availableFlashItems = [] }: DevisWizardProps) {
  const [step, setStep] = useState(0);
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [completedForm, setCompletedForm] = useState<FormState | null>(null);
  const [error, setError] = useState("");
  const [refPhotos, setRefPhotos] = useState<RefPhoto[]>([]);
  const [form, setForm] = useState<FormState>(initialState);
  const [previewFlash, setPreviewFlash] = useState<FlashItem | null>(null);
  const [draftLoaded, setDraftLoaded] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("new");
  const [draftId, setDraftId] = useState<string | null>(null);
  const [profileInitialForm, setProfileInitialForm] = useState<FormState | null>(null);
  const [reservedFlashIds, setReservedFlashIds] = useState<string[]>([]);
  const [canViewFlashs, setCanViewFlashs] = useState(false);

  const devisFlashItems = useMemo(
    () =>
      availableFlashItems.map((item) =>
        reservedFlashIds.includes(item.id)
          ? {
              ...item,
              status: "Réservé" as const,
            }
          : item,
      ),
    [availableFlashItems, reservedFlashIds],
  );

  const update = <Key extends keyof FormState>(key: Key, value: FormState[Key]) => {
    setError("");
    setForm((current) => ({ ...current, [key]: value }));
  };

  const chooseDevis = (value: string) => {
    setError("");
    setForm((current) => ({
      ...current,
      devis: value,
      flashId: value === "Flash proposé" ? current.flashId : "",
      flashIds: value === "Flash proposé" ? current.flashIds : [],
    }));
  };

  const toggleFlashSelection = (id: string) => {
    setError("");
    setForm((current) => {
      const currentIds = current.flashIds.length > 0 ? current.flashIds : current.flashId ? [current.flashId] : [];
      const flashIds = currentIds.includes(id)
        ? currentIds.filter((flashId) => flashId !== id)
        : [...currentIds, id];

      return {
        ...current,
        flashId: flashIds[0] ?? "",
        flashIds,
      };
    });
  };

  const addReferencePhotos = async (files: FileList | null) => {
    if (!files?.length) {
      return;
    }

    const photos = (await readImageAttachments(files)).map((photo) => ({
      id: `${photo.name}-${crypto.randomUUID()}`,
      name: photo.name,
      url: photo.url,
    }));

    setRefPhotos((current) => [...current, ...photos]);
  };

  const toggleDay = (day: string) => {
    setError("");
    setForm((current) => {
      const exists = current.disponibilites.includes(day);

      return {
        ...current,
        disponibilites: exists
          ? current.disponibilites.filter((item) => item !== day)
          : [...current.disponibilites, day],
      };
    });
  };

  const fieldSteps = useMemo<Step[]>(() => {
    const baseSteps: Step[] = [
      {
        id: "nom",
        title: "Nom",
        helper: "Indique ton nom de famille.",
        content: (
          <input
            className={styles.input}
            name="nom"
            type="text"
            autoComplete="family-name"
            value={form.nom}
            onChange={(event) => update("nom", event.target.value)}
          />
        ),
      },
      {
        id: "prenom",
        title: "Prénom",
        helper: "Indique ton prénom.",
        content: (
          <input
            className={styles.input}
            name="prenom"
            type="text"
            autoComplete="given-name"
            value={form.prenom}
            onChange={(event) => update("prenom", event.target.value)}
          />
        ),
      },
      {
        id: "portable",
        title: "N° de portable",
        helper: "10 chiffres exactement. Le numéro doit commencer par 06 ou 07.",
        content: (
          <input
            className={styles.input}
            name="portable"
            type="tel"
            inputMode="numeric"
            autoComplete="tel"
            maxLength={10}
            placeholder="06..."
            value={form.portable}
            onChange={(event) => update("portable", event.target.value.replace(/\D/g, "").slice(0, 10))}
          />
        ),
      },
      {
        id: "email",
        title: "Adresse mail",
        helper: "L'adresse doit être valide avant de passer à la suite.",
        content: (
          <input
            className={styles.input}
            name="email"
            type="email"
            autoComplete="email"
            placeholder="prenom@email.fr"
            value={form.email}
            onChange={(event) => update("email", event.target.value)}
          />
        ),
      },
      {
        id: "majeur",
        title: "Je suis majeur",
        helper: "Si tu réponds non, indique ton âge juste en dessous.",
        content: (
          <div className={styles.stackedAnswer}>
            <div className={styles.choiceGridTwo}>
              {["Oui", "Non"].map((value) => (
                <button
                  className={`${styles.choiceButton} ${form.majeur === value ? styles.choiceButtonActive : ""}`}
                  key={value}
                  type="button"
                  onClick={() => update("majeur", value)}
                >
                  {value}
                </button>
              ))}
            </div>

            {form.majeur === "Non" && (
              <input
                className={styles.input}
                name="age"
                type="number"
                inputMode="numeric"
                min="1"
                max="17"
                placeholder="Quel âge as-tu ?"
                value={form.age}
                onChange={(event) => update("age", event.target.value.replace(/\D/g, "").slice(0, 2))}
              />
            )}
          </div>
        ),
      },
      {
        id: "devis",
        title: "Devis",
        helper: "Choisis le type de demande. Si tu prends un flash proposé, sélectionne-le juste ici.",
        content: (
          <div className={styles.stackedAnswer}>
            <div className={styles.choiceGridTwo}>
              {["Projet perso", "Flash proposé"].map((value) => (
                <button
                  className={`${styles.choiceButton} ${form.devis === value ? styles.choiceButtonActive : ""}`}
                  key={value}
                  type="button"
                  onClick={() => {
                    if (value === "Flash proposé" && !canViewFlashs) {
                      window.location.href = "/flash?login=1";
                      return;
                    }

                    chooseDevis(value);
                  }}
                >
                  {value}
                </button>
              ))}
            </div>

            {form.devis === "Flash proposé" && canViewFlashs && (
              <div className={styles.flashGrid}>
                {devisFlashItems.map((item) => {
                  const selectedFlashIds =
                    form.flashIds.length > 0 ? form.flashIds : form.flashId ? [form.flashId] : [];
                  const selected = selectedFlashIds.includes(item.id);

                  return (
                    <button
                      className={`${styles.flashChoice} ${selected ? styles.flashChoiceActive : ""}`}
                      key={item.id}
                      type="button"
                      aria-label={`${selected ? "Retirer" : "Sélectionner"} ${item.title} et voir le flash en grand`}
                      onClick={(event) => {
                        if ((event.target as HTMLElement).closest("[data-flash-select-dot]")) {
                          toggleFlashSelection(item.id);
                          return;
                        }

                        toggleFlashSelection(item.id);
                        setPreviewFlash(item);
                      }}
                    >
                      <span
                        className={`${styles.flashStatus} ${
                          item.status === "Disponible" ? styles.flashStatusAvailable : styles.flashStatusReserved
                        }`}
                      >
                        {item.status}
                      </span>
                      <img className={styles.flashChoiceImage} src={item.image.src} alt={item.image.alt} />
                      <span className={styles.flashDetails}>
                        <span>
                          <span className={styles.flashPrice}>{item.price} €</span>
                          <span className={styles.flashReference}>{item.reference}</span>
                        </span>
                        <span
                          className={`${styles.flashSelectDot} ${selected ? styles.flashSelectDotActive : ""}`}
                          data-flash-select-dot
                        >
                          {selected ? "✓" : ""}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        ),
      },
    ];

    return [
      ...baseSteps,
      {
        id: "budget",
        title: "Budget max",
        helper: "Curseur de 90 € à 5000 €. Indique réellement ton budget maximum.",
        content: (
          <div className={styles.sliderBlock}>
            <p className={styles.sliderValue}>{form.budget} €</p>
            <input
              className={styles.range}
              name="budget"
              type="range"
              min="0"
              max="1000"
              step="1"
              value={budgetToSlider(form.budget)}
              onChange={(event) => update("budget", sliderToBudget(Number(event.target.value)))}
            />
            <div className={styles.rangeEnds}>
              <span>90 €</span>
              <span>2000 €</span>
              <span>5000 €</span>
            </div>
          </div>
        ),
      },
      {
        id: "projet",
        title: "Explique-nous ton projet",
        helper: "Décris l'idée, l'ambiance, les éléments importants et ajoute au moins 2 photos de référence.",
        content: (
          <div className={styles.stackedAnswer}>
            <textarea
              className={styles.textarea}
              name="projet"
              placeholder="Motif, style, emplacement, détails à garder..."
              value={form.projet}
              onChange={(event) => update("projet", event.target.value)}
            />
            <div className={styles.attachmentGrid}>
              {refPhotos.map((photo) => (
                <div className={styles.attachmentPreview} key={photo.id}>
                  <img src={photo.url} alt={photo.name} />
                </div>
              ))}
              <label
                className={styles.attachmentBox}
                aria-label="Ajouter des photos de référence"
              >
                <input
                  name="references"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(event) => {
                    addReferencePhotos(event.target.files);
                    event.target.value = "";
                  }}
                />
                <span>+</span>
              </label>
            </div>
            <p className={styles.photoRequirement}>
              {refPhotos.length >= minimumReferencePhotos
                ? `${refPhotos.length} photos ajoutées`
                : `${refPhotos.length}/${minimumReferencePhotos} photos de référence obligatoires`}
            </p>
          </div>
        ),
      },
      {
        id: "zone",
        title: "Zone",
        helper: "Choisis une zone du corps.",
        content: (
          <div className={styles.zoneGrid}>
            {bodyZones.map((zone) => (
              <button
                className={`${styles.zoneButton} ${form.zone === zone ? styles.zoneButtonActive : ""}`}
                key={zone}
                style={
                  {
                    "--zone-x": `${bodyZonePoints[zone].x}%`,
                    "--zone-y": `${bodyZonePoints[zone].y}%`,
                  } as CSSProperties
                }
                type="button"
                onClick={() => update("zone", zone)}
              >
                <span className={styles.zoneIcon}>
                  <span />
                </span>
                <span>{zone}</span>
              </button>
            ))}
          </div>
        ),
      },
      {
        id: "taille",
        title: "Taille en cm",
        helper: "Curseur de 1 cm à 80 cm.",
        content: (
          <div className={styles.sliderBlock}>
            <div
              className={styles.sizePreview}
              style={{
                width: `${34 + form.taille * 1.15}px`,
                height: `${34 + form.taille * 1.15}px`,
              }}
            />
            <p className={styles.sliderValue}>{form.taille} cm</p>
            <input
              className={styles.range}
              name="taille"
              type="range"
              min="1"
              max="80"
              value={form.taille}
              onChange={(event) => update("taille", Number(event.target.value))}
            />
            <div className={styles.rangeEnds}>
              <span>1 cm</span>
              <span>80 cm</span>
            </div>
          </div>
        ),
      },
      {
        id: "disponibilites",
        title: "Disponibilités",
        helper: "Lundi, mardi, jeudi et vendredi: 14h à 18h. Samedi: 10h à 19h.",
        content: (
          <div className={styles.choiceGrid}>
            {days.map((day) => (
              <button
                className={`${styles.choiceButton} ${
                  form.disponibilites.includes(day.label) ? styles.choiceButtonActive : ""
                }`}
                key={day.label}
                type="button"
                onClick={() => toggleDay(day.label)}
              >
                <span>{day.label}</span>
                <small>{day.time}</small>
              </button>
            ))}
          </div>
        ),
      },
      {
        id: "reglement",
        title: "Règlement",
        helper: "Choisis le moyen de règlement souhaité.",
        content: (
          <div className={styles.choiceGrid}>
            {payments.map((payment) => (
              <button
                className={`${styles.choiceButton} ${form.reglement === payment ? styles.choiceButtonActive : ""}`}
                key={payment}
                type="button"
                onClick={() => update("reglement", payment)}
              >
                {payment}
              </button>
            ))}
          </div>
        ),
      },
      {
        id: "commentaires",
        title: "Commentaires",
        helper: "Ajoute ici une précision si besoin.",
        content: (
          <textarea
            className={styles.textarea}
            name="commentaires"
            value={form.commentaires}
            onChange={(event) => update("commentaires", event.target.value)}
          />
        ),
      },
      {
        id: "spams",
        title: "Spams",
        helper:
          "Nous essayons de répondre aux messages sous une semaine maximum. Si tu n'as pas de réponse, vérifie tes spams.",
        content: (
          <button
            className={`${styles.choiceButton} ${form.spams ? styles.choiceButtonActive : ""}`}
            type="button"
            onClick={() => update("spams", !form.spams)}
          >
            J&apos;ai lu
          </button>
        ),
      },
      {
        id: "demenagement",
        title: "Déménagement",
        helper: "Le shop se trouve désormais à Villiers-sur-Morin.",
        content: (
          <button
            className={`${styles.choiceButton} ${form.demenagement ? styles.choiceButtonActive : ""}`}
            type="button"
            onClick={() => update("demenagement", !form.demenagement)}
          >
            Je suis au courant que le shop se trouve désormais à Villiers-sur-Morin.
          </button>
        ),
      },
    ];
  }, [canViewFlashs, devisFlashItems, form, refPhotos]);

  const steps = useMemo<Step[]>(() => {
    const fieldById = new Map(fieldSteps.map((field) => [field.id, field]));
    const group = (id: string, title: string, helper: string, fieldIds: string[]): Step => ({
      id,
      title,
      helper,
      fieldIds,
      content: (
        <div className={styles.groupedFields}>
          {fieldIds.map((fieldId) => {
            const field = fieldById.get(fieldId);

            if (!field) {
              return null;
            }

            return (
              <section className={styles.groupedField} key={field.id}>
                <div className={styles.groupedFieldHeading}>
                  <h4>{field.title}</h4>
                  <p>{field.helper}</p>
                </div>
                <div>{field.content}</div>
              </section>
            );
          })}
        </div>
      ),
    });

    return [
      group("identity", "Coordonnées", "Tes coordonnées servent uniquement à traiter ta demande.", [
        "nom",
        "prenom",
        "portable",
        "email",
        "majeur",
      ]),
      group("project", "Projet", "Décris ce que tu souhaites et sélectionne un flash si besoin.", [
        "devis",
        "budget",
        "projet",
      ]),
      group("placement", "Zone et taille", "Ces détails permettent de mieux préparer le projet.", [
        "zone",
        "taille",
      ]),
      group("appointment", "Disponibilités", "Indique quand et comment tu souhaites avancer.", [
        "disponibilites",
        "reglement",
      ]),
      group("confirmations", "Dernières précisions", "Vérifie les informations importantes avant le récapitulatif.", [
        "commentaires",
        "spams",
        "demenagement",
      ]),
      {
        id: "review",
        title: "Récapitulatif",
        helper: "Relis ta demande. Tu pourras encore revenir en arrière avant l'envoi.",
        fieldIds: ["review"],
        content: (
          <div className={styles.reviewBlock}>
            <dl className={styles.reviewRows}>
              <div><dt>Contact</dt><dd>{form.prenom || ""} {form.nom || ""}<br />{form.email || "Email à renseigner"}<br />{form.portable || "Téléphone à renseigner"}</dd></div>
              <div><dt>Demande</dt><dd>{form.devis || "Type de demande à renseigner"}</dd></div>
              <div><dt>Projet</dt><dd>{form.projet || "Description à renseigner"}</dd></div>
              <div><dt>Zone et taille</dt><dd>{form.zone || "Zone à renseigner"} · {form.taille} cm</dd></div>
              <div><dt>Disponibilités</dt><dd>{form.disponibilites.length ? form.disponibilites.join(", ") : "À renseigner"}</dd></div>
              <div><dt>Photos</dt><dd>{refPhotos.length} ajoutée{refPhotos.length > 1 ? "s" : ""}</dd></div>
            </dl>
            <label className={styles.reviewConsent}>
              <input
                type="checkbox"
                checked={form.copie}
                onChange={(event) => update("copie", event.target.checked)}
              />
              <span>Je souhaite recevoir une copie de ma demande par email.</span>
            </label>
          </div>
        ),
      },
    ];
  }, [fieldSteps, form, refPhotos]);

  const draftActive =
    isDraftStarted(form, step) &&
    !(step === 0 && profileInitialForm && isSameFormState(form, profileInitialForm));

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setReservedFlashIds(readReservedFlashIds());
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      try {
        const requestedView = new URLSearchParams(window.location.search).get("view");
        const requestedDraftId = new URLSearchParams(window.location.search).get("id");
        const requestedFlashId = new URLSearchParams(window.location.search).get("flash");
        const storedDrafts = migrateLegacyDraft<FormState>();
        const storedCompleted =
          window.localStorage.getItem(getCompletedStorageKey()) ?? window.localStorage.getItem(completedStorageKey);

        if (requestedView === "completed" && storedCompleted) {
          setViewMode("completed");
          setProfileInitialForm(null);
          const parsedCompleted = JSON.parse(storedCompleted) as Partial<StoredCompleted>;

          if (parsedCompleted.form) {
            setCompletedForm({ ...initialState, ...parsedCompleted.form });
            setSent(true);
          }

          return;
        }

        if (requestedView === "draft" && storedDrafts.length > 0) {
          setViewMode("draft");
          setProfileInitialForm(null);
          const selectedDraft =
            storedDrafts.find((draft) => draft.id === requestedDraftId) ?? storedDrafts[0];

          setDraftId(selectedDraft.id);
          setForm({ ...initialState, ...selectedDraft.form });
          setStep(Math.max(0, selectedDraft.step));

          return;
        }

        const storedProfile = readClientProfile();
        const canAccessFlashs = hasRequiredClientAccount(storedProfile);
        setCanViewFlashs(canAccessFlashs);
        const nextInitialForm = hasProfileInfo(storedProfile)
          ? getProfileInitialForm(storedProfile)
          : initialState;
        const requestedFlash = canAccessFlashs
          ? availableFlashItems.find((item) => item.id === requestedFlashId)
          : undefined;
        const nextForm = requestedFlash
          ? {
              ...nextInitialForm,
              devis: "Flash proposé",
              flashId: requestedFlash.id,
              flashIds: [requestedFlash.id],
            }
          : nextInitialForm;

        setViewMode("new");
        setProfileInitialForm(nextForm === initialState ? null : nextForm);
        setForm(nextForm);
      } catch {
        window.localStorage.removeItem(legacyDraftStorageKey);
        window.localStorage.removeItem(getCompletedStorageKey());
      } finally {
        setDraftLoaded(true);
      }
    });

    return () => window.cancelAnimationFrame(frame);
  }, [availableFlashItems]);

  useEffect(() => {
    if (!draftLoaded || sent) {
      return;
    }

    if (!draftActive) {
      if (draftId && viewMode !== "new") {
        removeDraftRecord<FormState>(draftId);
      }

      return;
    }

    const draft = upsertDraftRecord<FormState>({
      id: draftId ?? undefined,
      form,
      step,
    });

    if (!draftId) {
      window.requestAnimationFrame(() => setDraftId(draft.id));
    }
  }, [draftActive, draftId, draftLoaded, form, sent, step, viewMode]);

  useEffect(() => {
    if (sent) {
      window.localStorage.removeItem(legacyDraftStorageKey);

      if (draftId) {
        removeDraftRecord<FormState>(draftId);
      }
    }
  }, [draftId, sent]);

  useEffect(() => {
    if (!previewFlash) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setPreviewFlash(null);
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [previewFlash]);

  const activeStep = steps[Math.min(step, steps.length - 1)];
  const progress = Math.round(((step + 1) / steps.length) * 100);
  const isLastStep = step === steps.length - 1;

  const validateFieldStep = (id: string) => {

    if (id === "nom" && form.nom.trim().length < 2) {
      setError("Indique ton nom avant de continuer.");
      return false;
    }

    if (id === "prenom" && form.prenom.trim().length < 2) {
      setError("Indique ton prénom avant de continuer.");
      return false;
    }

    if (id === "portable" && !phonePattern.test(form.portable)) {
      setError("Le numéro doit contenir 10 chiffres et commencer par 06 ou 07.");
      return false;
    }

    if (id === "email" && !emailPattern.test(form.email.trim())) {
      setError("L'adresse mail doit être valide pour continuer.");
      return false;
    }

    if (id === "majeur") {
      const age = Number(form.age);

      if (!form.majeur) {
        setError("Choisis oui ou non.");
        return false;
      }

      if (form.majeur === "Non" && (!form.age || age < 1 || age > 17)) {
        setError("Indique un âge entre 1 et 17 ans.");
        return false;
      }
    }

    if (id === "devis") {
      if (!form.devis) {
        setError("Choisis Projet perso ou Flash proposé.");
        return false;
      }

      const selectedFlashIds = form.flashIds.length > 0 ? form.flashIds : form.flashId ? [form.flashId] : [];

      if (form.devis === "Flash proposé" && selectedFlashIds.length === 0) {
        setError("Choisis au moins un flash disponible.");
        return false;
      }
    }

    if (id === "projet") {
      if (form.projet.trim().length < 10) {
        setError("Ajoute quelques détails sur ton projet avant de continuer.");
        return false;
      }

      if (refPhotos.length < minimumReferencePhotos) {
        setError("Ajoute au moins 2 photos de référence avant de continuer.");
        return false;
      }
    }

    if (id === "zone" && !form.zone) {
      setError("Choisis une zone.");
      return false;
    }

    if (id === "disponibilites" && form.disponibilites.length === 0) {
      setError("Choisis au moins une disponibilité.");
      return false;
    }

    if (id === "reglement" && !form.reglement) {
      setError("Choisis un moyen de règlement.");
      return false;
    }

    if (id === "spams" && !form.spams) {
      setError("Confirme que tu as lu l'information sur les spams.");
      return false;
    }

    if (id === "demenagement" && !form.demenagement) {
      setError("Confirme que tu as lu l'information sur le déménagement.");
      return false;
    }

    setError("");
    return true;
  };

  const validateStep = () => {
    const fieldIds = activeStep.fieldIds ?? [activeStep.id];

    return fieldIds.every((id) => validateFieldStep(id));
  };

  const goBack = () => {
    if (submitting) {
      return;
    }

    setError("");
    setStep((current) => Math.max(0, current - 1));
  };

  const goNext = async () => {
    if (submitting) {
      return;
    }

    if (!validateStep()) {
      return;
    }

    if (isLastStep) {
      setSubmitting(true);
      const submittedForm = {
        ...form,
        flashIds: form.flashIds.length > 0 ? form.flashIds : form.flashId ? [form.flashId] : [],
      };

      const completed: StoredCompleted = {
        form: submittedForm,
        references: refPhotos,
        sentAt: new Date().toISOString(),
      };
      let storedDevisId = "";

      try {
        const response = await fetch("/api/devis", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...submittedForm,
            referencePhotos: refPhotos,
            references: refPhotos.map((photo) => photo.name),
          }),
        });

        const payload = (await response.json().catch(() => null)) as DevisApiResponse | null;

        if (!response.ok) {
          setError(payload?.error || "La demande n'a pas pu être envoyée.");
          setSubmitting(false);
          return;
        }

        if (payload?.storedDevis?.sentAt) {
          completed.sentAt = payload.storedDevis.sentAt;
        }

        storedDevisId = payload?.storedDevis?.id ?? "";
      } catch {
        setError("La demande n'a pas pu être envoyée. Vérifie la connexion puis réessaie.");
        setSubmitting(false);
        return;
      }

      setSubmitting(false);
      const selectedFlashes = availableFlashItems.filter((item) => submittedForm.flashIds.includes(item.id));
      const selectedFlashTitle = selectedFlashes.map((flash) => flash.title).join(", ");
      const completedQuoteId = storedDevisId || `devis-${new Date(completed.sentAt).getTime() || Date.now()}`;
      const completedQuote: ClientQuote = {
        id: completedQuoteId,
        title: selectedFlashTitle || submittedForm.devis || "Demande de devis",
        type: submittedForm.devis || "Demande de devis",
        status: "En attente",
        sentAt: completed.sentAt,
        flashId: submittedForm.flashIds[0] ?? submittedForm.flashId,
        flashIds: submittedForm.flashIds,
        budget: submittedForm.budget,
        zone: submittedForm.zone,
        taille: submittedForm.taille,
        projet: submittedForm.projet,
        disponibilites: submittedForm.disponibilites,
        reglement: submittedForm.reglement,
        commentaires: submittedForm.commentaires,
        references: refPhotos,
        form: submittedForm,
      };

      addClientQuote(completedQuote);
      appendDevisConversation(
        createDevisConversation({
          ...submittedForm,
          flashId: submittedForm.flashIds[0] ?? submittedForm.flashId,
          flashIds: submittedForm.flashIds,
        }),
      );
      selectedFlashes.forEach((flash) => {
        addClientReservation({
          id: `flash-${flash.id}`,
          title: flash.title,
          status: "reserved",
          note: "Flash réservé via la demande de devis.",
          flashId: flash.id,
        });
      });

      try {
        window.localStorage.setItem(getCompletedStorageKey(), JSON.stringify(completed));
      } catch {
        window.localStorage.removeItem(getCompletedStorageKey());
      }
      if (draftId) {
        removeDraftRecord<FormState>(draftId);
      }
      setCompletedForm(submittedForm);
      setSent(true);
      return;
    }

    setStep((current) => Math.min(steps.length - 1, current + 1));
  };

  if (sent) {
    const visibleForm = completedForm ?? form;
    const selectedFlashIds =
      visibleForm.flashIds.length > 0 ? visibleForm.flashIds : visibleForm.flashId ? [visibleForm.flashId] : [];
    const selectedFlashes = availableFlashItems.filter((item) => selectedFlashIds.includes(item.id));
    const selectedFlashTitles = selectedFlashes.map((item) => item.title).join(", ");
    const summaryRows = [
      ["Nom", visibleForm.nom],
      ["Prénom", visibleForm.prenom],
      ["Portable", visibleForm.portable],
      ["Adresse mail", visibleForm.email],
      ["Majeur", visibleForm.majeur],
      ["Âge", visibleForm.majeur === "Non" ? visibleForm.age : ""],
      ["Type de demande", visibleForm.devis],
      ["Flashs sélectionnés", selectedFlashTitles],
      ["Budget max", `${visibleForm.budget} €`],
      ["Projet", visibleForm.projet],
      ["Zone", visibleForm.zone],
      ["Taille", `${visibleForm.taille} cm`],
      ["Disponibilités", visibleForm.disponibilites.join(", ")],
      ["Règlement", visibleForm.reglement],
      ["Commentaires", visibleForm.commentaires],
      ["Spams", visibleForm.spams ? "Information lue" : ""],
      ["Déménagement", visibleForm.demenagement ? "Information lue" : ""],
      ["Copie", visibleForm.copie ? "Oui" : "Non"],
    ].filter(([, value]) => value);

    return (
      <div className={styles.success}>
        <div>
          <p className={styles.kicker}>Demande envoyée</p>
          <h2 className={styles.question}>Merci {visibleForm.prenom || "à toi"}</h2>
          <p className={styles.helper}>
            Ta demande est bien reçue. Le rendez-vous n&apos;est pas encore confirmé : le studio va d&apos;abord étudier ton projet et te répondre dans la messagerie. Pense à vérifier tes spams si tu n&apos;as pas de réponse sous une semaine.
          </p>
        </div>

        <div className={styles.summaryCard}>
          <span>{visibleForm.devis || "Demande de devis"}</span>
          {selectedFlashTitles && <strong>{selectedFlashTitles}</strong>}
          <small>
            {visibleForm.budget} € max · {visibleForm.taille} cm · {visibleForm.zone || "zone à préciser"}
          </small>
        </div>

        <div className={styles.summaryDetails}>
          <h3>Détail des réponses</h3>
          <div className={styles.summaryRows}>
            {summaryRows.map(([label, value]) => (
              <div className={styles.summaryRow} key={label}>
                <span>{label}</span>
                <strong>{value}</strong>
              </div>
            ))}
          </div>
        </div>

        <button
          className={styles.nextButton}
          type="button"
          onClick={() => {
            setForm(visibleForm);
            setStep(Math.max(0, steps.length - 2));
            setSent(false);
            setCompletedForm(null);
          }}
        >
          Revoir ma demande
        </button>

        <div className={styles.successActions}>
          <Link className={styles.successLink} href="/messagerie">
            Ouvrir la messagerie
          </Link>
          <Link className={styles.successLinkSecondary} href="/profil">
            Voir mon suivi client
          </Link>
        </div>
      </div>
    );
  }

  const previewSelected =
    !!previewFlash &&
    (form.flashIds.length > 0 ? form.flashIds : form.flashId ? [form.flashId] : []).includes(previewFlash.id);

  return (
    <>
      <div className={styles.wizard}>
        <div className={styles.appHeader}>
          <button
            className={styles.headerBack}
            type="button"
            onClick={goBack}
            disabled={step === 0}
            aria-label="Retour"
          >
            ‹
          </button>
          <h2 className={styles.appTitle}>Demande de devis</h2>
          <span className={styles.stepCount}>
            {step + 1}/{steps.length}
          </span>
        </div>

        {draftActive && (
          <div className={styles.draftStatus} aria-live="polite">
            <span className={styles.draftIcon} aria-hidden />
            <span>Devis en cours</span>
          </div>
        )}

        <div className={styles.progressTrack} aria-hidden>
          <span className={styles.progressFill} style={{ width: `${progress}%` }} />
        </div>

        <section className={styles.questionPanel} key={activeStep.id}>
          <div className={styles.questionLine}>
            <h3 className={styles.question}>{activeStep.title}</h3>
          </div>
          <p className={styles.helper}>{activeStep.helper}</p>
          <div className={styles.answer}>{activeStep.content}</div>
          {error && <p className={styles.error} role="alert">{error}</p>}
        </section>

        <div className={styles.controls}>
          <button className={styles.backButton} type="button" onClick={goBack} disabled={step === 0}>
            Retour
          </button>
          <button className={styles.nextButton} type="button" onClick={goNext} disabled={submitting}>
            {submitting ? "Envoi..." : isLastStep ? "Envoyer" : "Suivant"}
          </button>
        </div>
      </div>

      {typeof document !== "undefined" && previewFlash && createPortal(
        <div className={styles.flashPreviewBackdrop} role="presentation" onClick={() => setPreviewFlash(null)}>
          <section
            aria-modal="true"
            className={styles.flashPreview}
            role="dialog"
            aria-labelledby="devis-flash-preview-title"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              className={styles.flashPreviewClose}
              type="button"
              aria-label="Fermer l'aperçu"
              onClick={() => setPreviewFlash(null)}
            >
              ×
            </button>

            <div className={styles.flashPreviewImageWrap}>
              <span className={styles.flashPreviewStatus}>{previewFlash.status}</span>
              <img className={styles.flashPreviewImage} src={previewFlash.image.src} alt={previewFlash.image.alt} />
            </div>

            <div className={styles.flashPreviewContent}>
              <p className={styles.flashPreviewReference}>{previewFlash.reference}</p>
              <h3 className={styles.flashPreviewTitle} id="devis-flash-preview-title">
                {previewFlash.title}
              </h3>
              <p className={styles.flashPreviewDescription}>{previewFlash.description}</p>
              <dl className={styles.flashPreviewMeta}>
                <div>
                  <dt>Prix</dt>
                  <dd>{previewFlash.price} €</dd>
                </div>
                <div>
                  <dt>Taille</dt>
                  <dd>{previewFlash.size}</dd>
                </div>
                <div>
                  <dt>Style</dt>
                  <dd>{previewFlash.style}</dd>
                </div>
              </dl>
              <button
                className={styles.flashPreviewSelect}
                type="button"
                onClick={() => toggleFlashSelection(previewFlash.id)}
              >
                {previewSelected ? "Retirer ce flash" : "Sélectionner ce flash"}
              </button>
              {previewSelected && (
                <button
                  className={`${styles.flashPreviewSelect} ${styles.flashPreviewContinue}`}
                  type="button"
                  onClick={() => {
                    setPreviewFlash(null);
                    void goNext();
                  }}
                >
                  Continuer
                </button>
              )}
            </div>
          </section>
        </div>,
        document.body,
      )}
    </>
  );
}
