"use client";

import { FormEvent, useState } from "react";
import { ArrowRight, CheckCircle2, Mail, MessageCircle } from "lucide-react";
import styles from "./ContactForm.module.css";

type ContactValues = {
  name: string;
  email: string;
  phone: string;
  message: string;
  consent: boolean;
};

const initialValues: ContactValues = {
  name: "",
  email: "",
  phone: "",
  message: "",
  consent: false,
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export default function ContactForm() {
  const [values, setValues] = useState<ContactValues>(initialValues);
  const [status, setStatus] = useState<"idle" | "sending" | "success">("idle");
  const [error, setError] = useState("");

  const update = <Key extends keyof ContactValues>(key: Key, value: ContactValues[Key]) => {
    setError("");
    setValues((current) => ({ ...current, [key]: value }));
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (values.name.trim().length < 2) {
      setError("Indique ton nom.");
      return;
    }

    if (!emailPattern.test(values.email.trim())) {
      setError("Indique une adresse mail valide.");
      return;
    }

    if (values.message.trim().length < 10) {
      setError("Ajoute quelques mots à ton message.");
      return;
    }

    if (!values.consent) {
      setError("Confirme l'utilisation de tes informations pour recevoir une réponse.");
      return;
    }

    setStatus("sending");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const payload = (await response.json().catch(() => null)) as { error?: string } | null;

      if (!response.ok) {
        setError(payload?.error ?? "Le message n'a pas pu être envoyé.");
        setStatus("idle");
        return;
      }

      setStatus("success");
    } catch {
      setError("Le message n'a pas pu être envoyé. Vérifie ta connexion puis réessaie.");
      setStatus("idle");
    }
  };

  if (status === "success") {
    return (
      <div className={styles.success} role="status">
        <CheckCircle2 className={styles.successIcon} strokeWidth={1.7} aria-hidden="true" />
        <p className={styles.kicker}>Message envoyé</p>
        <h2>Merci, ton message est bien arrivé.</h2>
        <p>Le studio reviendra vers toi sous une semaine. Pense à vérifier tes spams.</p>
        <button type="button" className={styles.secondaryButton} onClick={() => {
          setValues(initialValues);
          setStatus("idle");
        }}>
          Envoyer un autre message
        </button>
      </div>
    );
  }

  return (
    <form className={styles.form} onSubmit={submit} noValidate>
      <div className={styles.formHeader}>
        <div className={styles.formIcon} aria-hidden="true">
          <MessageCircle strokeWidth={1.7} />
        </div>
        <div>
          <p className={styles.kicker}>Contact rapide</p>
          <h2>Écris au studio</h2>
          <p>Une question générale ? Ce formulaire suffit. Pour un tatouage, passe par le devis complet.</p>
        </div>
      </div>

      <div className={styles.fields}>
        <label>
          <span>Nom</span>
          <input
            autoComplete="name"
            className={styles.input}
            name="name"
            type="text"
            value={values.name}
            onChange={(event) => update("name", event.target.value)}
            required
          />
        </label>

        <label>
          <span>Adresse mail</span>
          <input
            autoComplete="email"
            className={styles.input}
            name="email"
            type="email"
            inputMode="email"
            placeholder="prenom@email.fr"
            value={values.email}
            onChange={(event) => update("email", event.target.value)}
            required
          />
        </label>

        <label>
          <span>Téléphone <small>facultatif</small></span>
          <input
            autoComplete="tel"
            className={styles.input}
            name="phone"
            type="tel"
            inputMode="tel"
            placeholder="06..."
            value={values.phone}
            onChange={(event) => update("phone", event.target.value)}
          />
        </label>

        <label>
          <span>Message</span>
          <textarea
            className={styles.textarea}
            name="message"
            placeholder="Comment peut-on t'aider ?"
            value={values.message}
            onChange={(event) => update("message", event.target.value)}
            required
          />
        </label>
      </div>

      <label className={styles.consent}>
        <input
          type="checkbox"
          checked={values.consent}
          onChange={(event) => update("consent", event.target.checked)}
          required
        />
        <span>J&apos;accepte que ces informations soient utilisées pour répondre à mon message.</span>
      </label>

      {error && <p className={styles.error} role="alert">{error}</p>}

      <div className={styles.actions}>
        <span className={styles.responseHint}>
          <Mail strokeWidth={1.7} aria-hidden="true" />
          Réponse sous une semaine
        </span>
        <button className={styles.submit} type="submit" disabled={status === "sending"}>
          {status === "sending" ? "Envoi..." : "Envoyer le message"}
          <ArrowRight strokeWidth={1.7} aria-hidden="true" />
        </button>
      </div>
    </form>
  );
}
