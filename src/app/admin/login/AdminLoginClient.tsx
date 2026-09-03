"use client";

import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, LockKeyhole, ShieldCheck } from "lucide-react";
import styles from "./AdminLoginPage.module.css";

export default function AdminLoginClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });
      const payload = (await response.json().catch(() => null)) as
        | { error?: string }
        | null;

      if (!response.ok) {
        setError(payload?.error ?? "Connexion impossible.");
        return;
      }

      router.replace(searchParams.get("next") || "/admin");
      router.refresh();
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className={styles.page} data-admin-login>
      <section className={styles.card} aria-labelledby="admin-login-title">
        <span className={styles.icon}>
          <ShieldCheck strokeWidth={1.7} aria-hidden />
        </span>

        <div>
          <p className={styles.kicker}>B.Grumpy Tattoo</p>
          <h1 className={styles.title} id="admin-login-title">
            Connexion administrateur
          </h1>
          <p className={styles.intro}>
            Accès réservé au studio avec identifiant et mot de passe administrateur.
          </p>
        </div>

        <form className={styles.form} onSubmit={login}>
          <label className={styles.field}>
            <span>Identifiant</span>
            <input
              autoComplete="username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="Votre identifiant"
            />
          </label>

          <label className={styles.field}>
            <span>Mot de passe</span>
            <input
              autoComplete="current-password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Votre mot de passe"
            />
          </label>

          {error ? <p className={styles.error}>{error}</p> : null}

          <button className={styles.submit} type="submit" disabled={isSubmitting}>
            <LockKeyhole strokeWidth={1.8} aria-hidden />
            {isSubmitting ? "Connexion..." : "Accéder à l'administration"}
            <ArrowRight strokeWidth={1.8} aria-hidden />
          </button>
        </form>
      </section>
    </main>
  );
}
