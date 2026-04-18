"use client";

import type { ChangeEvent, FormEvent } from "react";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { inquirySteps } from "@/src/data/site";

const dayLabels = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];
const zones = ["Avant-bras", "Bras", "Poignet", "Épaule", "Dos", "Côtes", "Cuisse", "Mollet", "Cheville", "Autre zone"];
const paymentMethods = ["Espèces", "Carte bancaire au studio", "Virement", "Autre à préciser"];
const requestTypes = ["Projet personnalisé", "Flash proposé"] as const;

type RequestType = (typeof requestTypes)[number];

type FormState = {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  isAdult: boolean;
  requestType: RequestType;
  flashReference: string;
  budgetMax: string;
  projectExplanation: string;
  tattooZone: string;
  tattooSize: string;
  referenceFiles: string[];
  availabilityDays: Record<string, boolean>;
  availabilityNote: string;
  paymentMethod: string;
  comments: string;
  spamConfirmation: boolean;
  villiersConfirmation: boolean;
};

const initialAvailability = dayLabels.reduce(
  (acc, day) => ({ ...acc, [day]: false }),
  {} as Record<string, boolean>,
);

const initialState: FormState = {
  firstName: "",
  lastName: "",
  phone: "",
  email: "",
  isAdult: false,
  requestType: "Projet personnalisé",
  flashReference: "",
  budgetMax: "",
  projectExplanation: "",
  tattooZone: "Avant-bras",
  tattooSize: "",
  referenceFiles: [],
  availabilityDays: initialAvailability,
  availabilityNote: "",
  paymentMethod: paymentMethods[0],
  comments: "",
  spamConfirmation: false,
  villiersConfirmation: false,
};

function isEmailValid(value: string) {
  return /\S+@\S+\.\S+/.test(value);
}

function fieldClass(invalid: boolean) {
  return `input-field ${invalid ? "border-red-500 bg-red-50 focus:border-red-600 focus:shadow-[0_0_0_4px_rgba(220,38,38,0.12)]" : ""}`;
}

function SummaryLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b hairline py-3 last:border-b-0">
      <p className="text-xs font-bold uppercase text-[color:var(--sage-dark)]">{label}</p>
      <p className="mt-1 text-sm leading-6 text-[color:var(--muted)]">{value || "Non renseigné"}</p>
    </div>
  );
}

export default function ProjectInquiryForm() {
  const [step, setStep] = useState(1);
  const [attemptedSteps, setAttemptedSteps] = useState<number[]>([]);
  const [values, setValues] = useState<FormState>(initialState);
  const router = useRouter();

  const totalSteps = inquirySteps.length;
  const selectedDays = dayLabels.filter((day) => values.availabilityDays[day]);
  const showErrors = attemptedSteps.includes(step);

  const heading = values.requestType === "Flash proposé" ? "Demande de flash" : "Demande de projet personnalisé";
  const progress = useMemo(() => Math.round((step / totalSteps) * 100), [step, totalSteps]);

  const isStepValid = useMemo(() => {
    if (step === 1) {
      return (
        values.firstName.trim().length > 1 &&
        values.lastName.trim().length > 1 &&
        values.phone.trim().length >= 10 &&
        isEmailValid(values.email) &&
        values.isAdult
      );
    }

    if (step === 2) {
      return values.requestType.length > 0 && values.budgetMax.trim().length > 0;
    }

    if (step === 3) {
      return values.projectExplanation.trim().length >= 20;
    }

    if (step === 4) {
      return values.tattooZone.trim().length > 0 && values.tattooSize.trim().length > 0;
    }

    if (step === 5) {
      return selectedDays.length > 0 && values.paymentMethod.trim().length > 0;
    }

    if (step === 6) {
      return values.spamConfirmation && values.villiersConfirmation;
    }

    return true;
  }, [selectedDays.length, step, values]);

  const markAttempted = () => {
    setAttemptedSteps((current) => (current.includes(step) ? current : [...current, step]));
  };

  const handleInput = (key: keyof FormState, value: string | boolean) => {
    setValues((current) => ({ ...current, [key]: value }));
  };

  const handleRequestType = (value: RequestType) => {
    setValues((current) => ({ ...current, requestType: value }));
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []).map((file) => file.name);
    setValues((current) => ({ ...current, referenceFiles: files }));
  };

  const toggleDay = (day: string) => {
    setValues((current) => ({
      ...current,
      availabilityDays: {
        ...current.availabilityDays,
        [day]: !current.availabilityDays[day],
      },
    }));
  };

  const goBack = () => {
    setStep((current) => Math.max(current - 1, 1));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!isStepValid) {
      markAttempted();
      return;
    }

    if (step < totalSteps) {
      setStep((current) => Math.min(current + 1, totalSteps));
      return;
    }

    router.push("/confirmation");
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-[0.34fr_0.66fr]">
      <aside className="panel self-start p-5 lg:sticky lg:top-28">
        <p className="eyebrow">{heading}</p>
        <div className="mt-5">
          <div className="flex items-center justify-between text-sm font-bold text-[color:var(--ink)]">
            <span>Étape {step} sur {totalSteps}</span>
            <span>{progress}%</span>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-md bg-[color:var(--paper-soft)]">
            <div className="h-full rounded-md bg-[color:var(--sage-dark)] transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>

        <div className="mt-6 grid gap-2">
          {inquirySteps.map((label, index) => {
            const currentStep = index + 1;
            const isCurrent = currentStep === step;
            const isPast = currentStep < step;

            return (
              <button
                key={label}
                type="button"
                onClick={() => (currentStep <= step ? setStep(currentStep) : undefined)}
                disabled={currentStep > step}
                className={`rounded-lg border px-3 py-3 text-left text-sm transition ${
                  isCurrent
                    ? "border-[color:var(--sage-dark)] bg-[rgba(119,128,106,0.16)] text-[color:var(--ink)] shadow-[0_10px_24px_rgba(51,45,32,0.1)]"
                    : "glass-control text-[color:var(--muted)]"
                } ${isPast ? "font-bold" : "font-medium"} disabled:cursor-not-allowed disabled:opacity-[0.55]`}
              >
                <span className="mr-2 font-black">0{currentStep}</span>
                {label}
              </button>
            );
          })}
        </div>

        <p className="mt-6 text-xs leading-6 text-[color:var(--muted)]">
          Ce formulaire transmet une demande. Il ne crée pas de compte, ne déclenche pas de paiement et ne réserve aucun horaire.
        </p>
      </aside>

      <div className="panel p-5 sm:p-7">
        {showErrors && !isStepValid ? (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-800">
            Complétez les champs obligatoires de cette étape avant de continuer.
          </div>
        ) : null}

        {step === 1 ? (
          <section>
            <p className="eyebrow">Coordonnées</p>
            <h2 className="mt-3 text-3xl font-black text-[color:var(--ink)]">Qui envoie la demande ?</h2>
            <p className="mt-3 text-sm leading-7 text-[color:var(--muted)]">
              Ces informations permettent au studio de revenir vers vous après analyse du projet.
            </p>

            <div className="mt-8 grid gap-5 sm:grid-cols-2">
              <label className="text-sm font-bold text-[color:var(--ink)]">
                Prénom
                <input
                  value={values.firstName}
                  onChange={(event) => handleInput("firstName", event.target.value)}
                  className={fieldClass(showErrors && values.firstName.trim().length <= 1)}
                  placeholder="Prénom"
                  aria-invalid={showErrors && values.firstName.trim().length <= 1}
                />
              </label>
              <label className="text-sm font-bold text-[color:var(--ink)]">
                Nom
                <input
                  value={values.lastName}
                  onChange={(event) => handleInput("lastName", event.target.value)}
                  className={fieldClass(showErrors && values.lastName.trim().length <= 1)}
                  placeholder="Nom"
                  aria-invalid={showErrors && values.lastName.trim().length <= 1}
                />
              </label>
              <label className="text-sm font-bold text-[color:var(--ink)]">
                Numéro de portable
                <input
                  value={values.phone}
                  onChange={(event) => handleInput("phone", event.target.value)}
                  className={fieldClass(showErrors && values.phone.trim().length < 10)}
                  placeholder="06 12 34 56 78"
                  inputMode="tel"
                  aria-invalid={showErrors && values.phone.trim().length < 10}
                />
              </label>
              <label className="text-sm font-bold text-[color:var(--ink)]">
                Adresse mail
                <input
                  type="email"
                  value={values.email}
                  onChange={(event) => handleInput("email", event.target.value)}
                  className={fieldClass(showErrors && !isEmailValid(values.email))}
                  placeholder="prenom@email.fr"
                  aria-invalid={showErrors && !isEmailValid(values.email)}
                />
              </label>
            </div>

            <label className={`mt-6 flex items-start gap-3 rounded-lg border p-4 text-sm leading-6 ${showErrors && !values.isAdult ? "border-red-300 bg-red-50 text-red-800" : "glass-control text-[color:var(--muted)]"}`}>
              <input
                type="checkbox"
                checked={values.isAdult}
                onChange={(event) => handleInput("isAdult", event.target.checked)}
                className="mt-1 h-4 w-4 accent-[color:var(--sage-dark)]"
              />
              Je confirme être majeur et autorisé à envoyer cette demande.
            </label>
          </section>
        ) : null}

        {step === 2 ? (
          <section>
            <p className="eyebrow">Type de demande</p>
            <h2 className="mt-3 text-3xl font-black text-[color:var(--ink)]">Flash proposé ou projet personnel ?</h2>
            <p className="mt-3 text-sm leading-7 text-[color:var(--muted)]">
              Le wording du formulaire s’adapte légèrement selon votre choix, mais la logique reste la même : envoyer une demande claire.
            </p>

            <div className="mt-8 grid gap-4 md:grid-cols-2">
              {requestTypes.map((type) => (
                <label
                  key={type}
                  className={`cursor-pointer rounded-lg border p-5 transition ${
                    values.requestType === type
                      ? "border-[color:var(--sage-dark)] bg-[rgba(119,128,106,0.14)]"
                      : "glass-control hover:border-[color:var(--sage-dark)]"
                  }`}
                >
                  <input
                    type="radio"
                    name="requestType"
                    checked={values.requestType === type}
                    onChange={() => handleRequestType(type)}
                    className="sr-only"
                  />
                  <span className="text-lg font-black text-[color:var(--ink)]">{type}</span>
                  <span className="mt-3 block text-sm leading-7 text-[color:var(--muted)]">
                    {type === "Flash proposé"
                      ? "Vous avez repéré un flash et souhaitez transmettre une demande pour ce motif."
                      : "Vous avez une idée personnelle, des références ou une intention à construire."}
                  </span>
                </label>
              ))}
            </div>

            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <label className="text-sm font-bold text-[color:var(--ink)]">
                Budget maximum
                <input
                  value={values.budgetMax}
                  onChange={(event) => handleInput("budgetMax", event.target.value)}
                  className={fieldClass(showErrors && values.budgetMax.trim().length === 0)}
                  placeholder="Ex. 250 €"
                  aria-invalid={showErrors && values.budgetMax.trim().length === 0}
                />
              </label>
              <label className="text-sm font-bold text-[color:var(--ink)]">
                Référence du flash si connue
                <input
                  value={values.flashReference}
                  onChange={(event) => handleInput("flashReference", event.target.value)}
                  className="input-field"
                  placeholder={values.requestType === "Flash proposé" ? "Ex. Racine graphique" : "Optionnel"}
                />
              </label>
            </div>
          </section>
        ) : null}

        {step === 3 ? (
          <section>
            <p className="eyebrow">Projet</p>
            <h2 className="mt-3 text-3xl font-black text-[color:var(--ink)]">
              {values.requestType === "Flash proposé" ? "Pourquoi ce flash ?" : "Quelle est l’idée du projet ?"}
            </h2>
            <p className="mt-3 text-sm leading-7 text-[color:var(--muted)]">
              Décrivez l’ambiance, les éléments importants, les limites à éviter et le résultat souhaité.
            </p>

            <label className="mt-8 block text-sm font-bold text-[color:var(--ink)]">
              Explication du projet
              <textarea
                value={values.projectExplanation}
                onChange={(event) => handleInput("projectExplanation", event.target.value)}
                rows={9}
                className={fieldClass(showErrors && values.projectExplanation.trim().length < 20)}
                placeholder="Décrivez votre demande avec le plus de contexte utile possible."
                aria-invalid={showErrors && values.projectExplanation.trim().length < 20}
              />
            </label>
            <p className="mt-3 text-xs leading-6 text-[color:var(--muted)]">
              Minimum conseillé : quelques phrases. Une demande précise reçoit une réponse plus pertinente.
            </p>
          </section>
        ) : null}

        {step === 4 ? (
          <section>
            <p className="eyebrow">Zone, taille, références</p>
            <h2 className="mt-3 text-3xl font-black text-[color:var(--ink)]">Où et dans quel format ?</h2>
            <p className="mt-3 text-sm leading-7 text-[color:var(--muted)]">
              La zone, la taille et les photos de référence donnent un cadre concret à la demande.
            </p>

            <div className="mt-8 grid gap-5 md:grid-cols-2">
              <label className="text-sm font-bold text-[color:var(--ink)]">
                Zone à tatouer
                <select
                  value={values.tattooZone}
                  onChange={(event) => handleInput("tattooZone", event.target.value)}
                  className={fieldClass(showErrors && values.tattooZone.trim().length === 0)}
                >
                  {zones.map((zone) => (
                    <option key={zone}>{zone}</option>
                  ))}
                </select>
              </label>
              <label className="text-sm font-bold text-[color:var(--ink)]">
                Taille en cm
                <input
                  value={values.tattooSize}
                  onChange={(event) => handleInput("tattooSize", event.target.value)}
                  className={fieldClass(showErrors && values.tattooSize.trim().length === 0)}
                  placeholder="Ex. 12 x 8 cm"
                  aria-invalid={showErrors && values.tattooSize.trim().length === 0}
                />
              </label>
            </div>

            <div className="glass-card mt-6 p-5">
              <p className="font-black text-[color:var(--ink)]">Photos de référence</p>
              <p className="mt-2 text-sm leading-7 text-[color:var(--muted)]">
                Ajoutez plusieurs images si elles aident à comprendre le style, la composition ou ce que vous ne voulez pas.
              </p>
              <label className="btn btn-secondary mt-5 w-fit cursor-pointer">
                Ajouter des photos
                <input type="file" accept="image/*" multiple onChange={handleFileChange} className="hidden" />
              </label>
              {values.referenceFiles.length > 0 ? (
                <ul className="mt-5 grid gap-2 sm:grid-cols-2">
                  {values.referenceFiles.map((file) => (
                    <li key={file} className="glass-chip px-3 py-2 text-sm text-[color:var(--muted)]">
                      {file}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-4 text-sm text-[color:var(--muted)]">Aucune photo ajoutée pour l’instant.</p>
              )}
            </div>
          </section>
        ) : null}

        {step === 5 ? (
          <section>
            <p className="eyebrow">Disponibilités et règlement</p>
            <h2 className="mt-3 text-3xl font-black text-[color:var(--ink)]">Quels jours vous conviennent ?</h2>
            <p className="mt-3 text-sm leading-7 text-[color:var(--muted)]">
              Indiquez simplement les jours possibles entre 10h et 17h. Ce ne sont que des informations transmises avec la demande.
            </p>

            <div className={`mt-8 grid gap-2 sm:grid-cols-2 lg:grid-cols-3 ${showErrors && selectedDays.length === 0 ? "rounded-lg border border-red-300 bg-red-50 p-3" : ""}`}>
              {dayLabels.map((day) => (
                <label key={day} className="glass-control flex cursor-pointer items-center gap-3 px-4 py-3 text-sm font-bold text-[color:var(--ink)] transition hover:border-[color:var(--sage-dark)]">
                  <input
                    type="checkbox"
                    checked={values.availabilityDays[day]}
                    onChange={() => toggleDay(day)}
                    className="h-4 w-4 accent-[color:var(--sage-dark)]"
                  />
                  {day}
                </label>
              ))}
            </div>

            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <label className="text-sm font-bold text-[color:var(--ink)]">
                Mode de règlement
                <select
                  value={values.paymentMethod}
                  onChange={(event) => handleInput("paymentMethod", event.target.value)}
                  className="input-field"
                >
                  {paymentMethods.map((method) => (
                    <option key={method}>{method}</option>
                  ))}
                </select>
              </label>
              <label className="text-sm font-bold text-[color:var(--ink)]">
                Précision sur vos disponibilités
                <input
                  value={values.availabilityNote}
                  onChange={(event) => handleInput("availabilityNote", event.target.value)}
                  className="input-field"
                  placeholder="Ex. plutôt mardi ou jeudi matin"
                />
              </label>
            </div>

            <label className="mt-6 block text-sm font-bold text-[color:var(--ink)]">
              Commentaires complémentaires
              <textarea
                value={values.comments}
                onChange={(event) => handleInput("comments", event.target.value)}
                rows={5}
                className="input-field"
                placeholder="Informations utiles, contraintes, cicatrices, anciennes pièces, précision sur le flash..."
              />
            </label>
          </section>
        ) : null}

        {step === 6 ? (
          <section>
            <p className="eyebrow">Récapitulatif</p>
            <h2 className="mt-3 text-3xl font-black text-[color:var(--ink)]">Vérifiez votre demande avant envoi.</h2>
            <p className="mt-3 text-sm leading-7 text-[color:var(--muted)]">
              Cette étape sert à relire les informations et confirmer les points importants.
            </p>

            <div className="mt-8 grid gap-5 lg:grid-cols-2">
              <div className="glass-card p-5">
                <SummaryLine label="Contact" value={`${values.firstName} ${values.lastName}`} />
                <SummaryLine label="Portable" value={values.phone} />
                <SummaryLine label="Email" value={values.email} />
                <SummaryLine label="Type" value={values.requestType} />
                <SummaryLine label="Budget maximum" value={values.budgetMax} />
                <SummaryLine label="Flash" value={values.flashReference} />
              </div>
              <div className="glass-card p-5">
                <SummaryLine label="Zone" value={values.tattooZone} />
                <SummaryLine label="Taille" value={values.tattooSize} />
                <SummaryLine label="Jours entre 10h et 17h" value={selectedDays.join(", ")} />
                <SummaryLine label="Règlement" value={values.paymentMethod} />
                <SummaryLine label="Références" value={values.referenceFiles.join(", ")} />
                <SummaryLine label="Commentaires" value={values.comments} />
              </div>
            </div>

            <div className="glass-panel mt-6 p-5">
              <p className="font-black text-[color:var(--ink)]">Explication du projet</p>
              <p className="mt-3 text-sm leading-7 text-[color:var(--muted)]">{values.projectExplanation}</p>
            </div>

            <div className="mt-6 grid gap-3">
              <label className={`flex items-start gap-3 rounded-lg border p-4 text-sm leading-6 ${showErrors && !values.spamConfirmation ? "border-red-300 bg-red-50 text-red-800" : "glass-control text-[color:var(--muted)]"}`}>
                <input
                  type="checkbox"
                  checked={values.spamConfirmation}
                  onChange={(event) => handleInput("spamConfirmation", event.target.checked)}
                  className="mt-1 h-4 w-4 accent-[color:var(--sage-dark)]"
                />
                Je confirme avoir vérifié mes coordonnées et je penserai à consulter mes mails et mes spams après l’envoi.
              </label>
              <label className={`flex items-start gap-3 rounded-lg border p-4 text-sm leading-6 ${showErrors && !values.villiersConfirmation ? "border-red-300 bg-red-50 text-red-800" : "glass-control text-[color:var(--muted)]"}`}>
                <input
                  type="checkbox"
                  checked={values.villiersConfirmation}
                  onChange={(event) => handleInput("villiersConfirmation", event.target.checked)}
                  className="mt-1 h-4 w-4 accent-[color:var(--sage-dark)]"
                />
                Je confirme avoir pris en compte le déménagement du studio à Villiers-sur-Morin pour la suite de mon projet.
              </label>
            </div>
          </section>
        ) : null}

        <div className="mt-10 flex flex-col gap-3 border-t hairline pt-6 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={goBack}
            disabled={step === 1}
            className="btn btn-secondary disabled:cursor-not-allowed disabled:opacity-50"
          >
            Retour
          </button>
          <button type="submit" className="btn btn-primary">
            {step === totalSteps ? "Envoyer ma demande" : "Continuer"}
          </button>
        </div>
      </div>
    </form>
  );
}
