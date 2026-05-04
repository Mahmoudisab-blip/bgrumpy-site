"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { flashItems } from "@/src/data/flashItems";
import styles from "./DevisPage.module.css";

const days = [
  { label: "Lundi", time: "14h à 18h" },
  { label: "Mardi", time: "14h à 18h" },
  { label: "Jeudi", time: "14h à 18h" },
  { label: "Vendredi", time: "14h à 18h" },
  { label: "Samedi", time: "10h à 19h" },
];

const payments = ["Espèces", "Carte Bancaire", "3x ou 4x par carte bancaire avec Alma"];

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

type FormState = {
  nom: string;
  prenom: string;
  portable: string;
  email: string;
  majeur: string;
  age: string;
  devis: string;
  flashId: string;
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
};

type StoredDraft = {
  form: FormState;
  step: number;
};

type StoredCompleted = {
  form: FormState;
  sentAt: string;
};

type RefPhoto = {
  id: string;
  name: string;
  url: string;
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
const draftStorageKey = "bgrumpy-devis-draft";
const completedStorageKey = "bgrumpy-devis-completed";

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

export default function DevisWizard() {
  const [step, setStep] = useState(0);
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [completedForm, setCompletedForm] = useState<FormState | null>(null);
  const [error, setError] = useState("");
  const [refPhotos, setRefPhotos] = useState<RefPhoto[]>([]);
  const [form, setForm] = useState<FormState>(initialState);
  const [draftLoaded, setDraftLoaded] = useState(false);

  const availableFlashItems = useMemo(
    () => flashItems.filter((item) => item.status === "Disponible"),
    [],
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
    }));
  };

  const addReferencePhotos = (files: FileList | null) => {
    if (!files?.length) {
      return;
    }

    const photos = Array.from(files).map((file) => ({
      id: `${file.name}-${file.lastModified}-${crypto.randomUUID()}`,
      name: file.name,
      url: URL.createObjectURL(file),
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

  const steps = useMemo<Step[]>(() => {
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
                placeholder="Quelle âge as-tu ?"
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
                  onClick={() => chooseDevis(value)}
                >
                  {value}
                </button>
              ))}
            </div>

            {form.devis === "Flash proposé" && (
              <div className={styles.flashGrid}>
                {availableFlashItems.map((item) => {
                  const selected = form.flashId === item.id;

                  return (
                    <button
                      className={`${styles.flashChoice} ${selected ? styles.flashChoiceActive : ""}`}
                      key={item.id}
                      type="button"
                      style={{ backgroundImage: `url(${item.image.src})` }}
                      onClick={() => update("flashId", item.id)}
                    >
                      <span className={styles.flashContent}>
                        <span className={styles.flashTitle}>{item.title}</span>
                        <span className={styles.flashMeta}>{item.size}</span>
                      </span>
                      <span className={`${styles.flashSelectDot} ${selected ? styles.flashSelectDotActive : ""}`}>
                        {selected ? "✓" : ""}
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
        title: "Explique nous ton projet",
        helper: "Décris l'idée, l'ambiance, les éléments importants et ajoute tes photos de référence.",
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
      {
        id: "copie",
        title: "Recevoir une copie",
        helper: "Souhaites-tu recevoir une copie de ta demande ?",
        content: (
          <div className={styles.choiceGridTwo}>
            <button
              className={`${styles.choiceButton} ${form.copie ? styles.choiceButtonActive : ""}`}
              type="button"
              onClick={() => update("copie", true)}
            >
              Oui
            </button>
            <button
              className={`${styles.choiceButton} ${!form.copie ? styles.choiceButtonActive : ""}`}
              type="button"
              onClick={() => update("copie", false)}
            >
              Non
            </button>
          </div>
        ),
      },
    ];
  }, [availableFlashItems, form, refPhotos]);

  const draftActive = isDraftStarted(form, step);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      try {
        const viewMode = new URLSearchParams(window.location.search).get("view");
        const storedDraft = window.localStorage.getItem(draftStorageKey);
        const storedCompleted = window.localStorage.getItem(completedStorageKey);

        if (viewMode === "completed" && storedCompleted) {
          const parsedCompleted = JSON.parse(storedCompleted) as Partial<StoredCompleted>;

          if (parsedCompleted.form) {
            setCompletedForm({ ...initialState, ...parsedCompleted.form });
            setSent(true);
          }

          return;
        }

        if (storedDraft) {
          const parsedDraft = JSON.parse(storedDraft) as Partial<StoredDraft>;

          if (parsedDraft.form) {
            setForm({ ...initialState, ...parsedDraft.form });
          }

          if (typeof parsedDraft.step === "number") {
            setStep(Math.max(0, parsedDraft.step));
          }

          return;
        }

        if (storedCompleted) {
          const parsedCompleted = JSON.parse(storedCompleted) as Partial<StoredCompleted>;

          if (parsedCompleted.form) {
            setCompletedForm({ ...initialState, ...parsedCompleted.form });
            setSent(true);
          }
        }
      } catch {
        window.localStorage.removeItem(draftStorageKey);
        window.localStorage.removeItem(completedStorageKey);
      } finally {
        setDraftLoaded(true);
      }
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (!draftLoaded || sent) {
      return;
    }

    if (!draftActive) {
      window.localStorage.removeItem(draftStorageKey);
      return;
    }

    const draft: StoredDraft = {
      form,
      step,
    };

    window.localStorage.setItem(draftStorageKey, JSON.stringify(draft));
  }, [draftActive, draftLoaded, form, sent, step]);

  useEffect(() => {
    if (sent) {
      window.localStorage.removeItem(draftStorageKey);
    }
  }, [sent]);

  const activeStep = steps[Math.min(step, steps.length - 1)];
  const progress = Math.round(((step + 1) / steps.length) * 100);
  const isLastStep = step === steps.length - 1;

  const validateStep = () => {
    const id = activeStep.id;

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

      if (form.devis === "Flash proposé" && !form.flashId) {
        setError("Choisis un flash disponible.");
        return false;
      }
    }

    if (id === "projet" && form.projet.trim().length < 10) {
      setError("Ajoute quelques détails sur ton projet avant de continuer.");
      return false;
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

      try {
        const response = await fetch("/api/devis", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...form,
            references: refPhotos.map((photo) => photo.name),
          }),
        });
        const result = (await response.json().catch(() => null)) as { error?: string } | null;

        if (!response.ok) {
          setError(result?.error ?? "Le devis n'a pas pu être envoyé. Réessaie dans un instant.");
          return;
        }
      } catch {
        setError("Le devis n'a pas pu être envoyé. Vérifie ta connexion et réessaie.");
        return;
      } finally {
        setSubmitting(false);
      }

      const completed: StoredCompleted = {
        form,
        sentAt: new Date().toISOString(),
      };

      window.localStorage.setItem(completedStorageKey, JSON.stringify(completed));
      setCompletedForm(form);
      setSent(true);
      return;
    }

    setStep((current) => Math.min(steps.length - 1, current + 1));
  };

  if (sent) {
    const visibleForm = completedForm ?? form;
    const selectedFlash = flashItems.find((item) => item.id === visibleForm.flashId);
    const summaryRows = [
      ["Nom", visibleForm.nom],
      ["Prénom", visibleForm.prenom],
      ["Portable", visibleForm.portable],
      ["Adresse mail", visibleForm.email],
      ["Majeur", visibleForm.majeur],
      ["Âge", visibleForm.majeur === "Non" ? visibleForm.age : ""],
      ["Type de demande", visibleForm.devis],
      ["Flash sélectionné", selectedFlash?.title || ""],
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
            Ta dernière demande reste accessible ici. Pense à vérifier tes spams si tu n&apos;as pas de réponse sous une semaine.
          </p>
        </div>

        <div className={styles.summaryCard}>
          <span>{visibleForm.devis || "Demande de devis"}</span>
          {selectedFlash && <strong>{selectedFlash.title}</strong>}
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
      </div>
    );
  }

  return (
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

      <section className={styles.questionPanel}>
        <div className={styles.questionLine}>
          <h3 className={styles.question}>{activeStep.title}</h3>
        </div>
        <p className={styles.helper}>{activeStep.helper}</p>
        <div className={styles.answer}>{activeStep.content}</div>
        {error && <p className={styles.error}>{error}</p>}
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
  );
}
