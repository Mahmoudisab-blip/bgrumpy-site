"use client";

import { FormEvent, useEffect, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ArrowRight, LockKeyhole, UserRound } from "lucide-react";
import {
  clearClientProfile,
  emptyClientProfile,
  findClientAccount,
  readClientProfile,
  upsertClientAccount,
  writeClientProfile,
  type ClientProfile,
} from "@/src/lib/clientProfileStorage";
import { isPrimaryAdminEmail, normalizeLoginIdentifier } from "@/src/lib/adminIdentity";
import styles from "./AccountGate.module.css";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const hasRequiredAccount = (profile: ClientProfile) =>
  profile.prenom.trim().length >= 2 &&
  profile.nom.trim().length >= 2 &&
  emailPattern.test(profile.email.trim());

const createProfileFromEmail = (email: string): ClientProfile => {
  const localPart = email.split("@")[0]?.trim() || "client";
  const cleanedName = localPart
    .replace(/[._-]+/g, " ")
    .replace(/\d+/g, "")
    .trim();
  const prenom = cleanedName.split(" ")[0] || "Client";

  return {
    ...emptyClientProfile,
    prenom: prenom.charAt(0).toUpperCase() + prenom.slice(1),
    nom: "B.Grumpy",
    email,
  };
};

type AccountGateProps = {
  children: ReactNode;
};

export default function AccountGate({ children }: AccountGateProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [loaded, setLoaded] = useState(false);
  const [hasAccount, setHasAccount] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const forceLogin = new URLSearchParams(window.location.search).get("login") === "1";
      const storedProfile = readClientProfile();
      const storedProfileIsAdmin = isPrimaryAdminEmail(storedProfile.email);

      if (storedProfileIsAdmin) {
        clearClientProfile();
      }

      setCredentials((current) => ({
        ...current,
        email: current.email || (storedProfileIsAdmin ? "" : storedProfile.email),
      }));
      setHasAccount(!forceLogin && !storedProfileIsAdmin && hasRequiredAccount(storedProfile));

      if (forceLogin) {
        setIsAdmin(false);
        setLoaded(true);
        return;
      }

      fetch("/api/admin/session", {
        cache: "no-store",
      })
        .then((response) => response.json())
        .then((payload: { authenticated?: boolean }) => {
          setIsAdmin(Boolean(payload.authenticated));
        })
        .catch(() => {
          setIsAdmin(false);
        })
        .finally(() => {
          setLoaded(true);
        });
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (!loaded || !isAdmin || pathname?.startsWith("/admin")) {
      return;
    }

    router.replace("/admin");
  }, [isAdmin, loaded, pathname, router]);

  const login = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    const email = normalizeLoginIdentifier(credentials.email);
    const password = credentials.password.trim();

    if (!emailPattern.test(email)) {
      setError("Indique une adresse mail valide.");
      setLoading(false);
      return;
    }

    if (password.length < 4) {
      setError("Indique un mot de passe.");
      setLoading(false);
      return;
    }

    try {
      const adminResponse = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username: email, password }),
      });
      const adminPayload = (await adminResponse.json().catch(() => null)) as
        | { error?: string; isAdminAccount?: boolean }
        | null;

      if (adminResponse.ok) {
        clearClientProfile();
        setHasAccount(false);
        setIsAdmin(true);
        router.replace("/admin");
        router.refresh();
        return;
      }

      if (adminPayload?.isAdminAccount) {
        setError(adminPayload.error ?? "Identifiants administrateur incorrects.");
        return;
      }

      const existingAccount = findClientAccount(email);

      const fallbackProfile = existingAccount?.profile ?? createProfileFromEmail(email);

      try {
        const clientResponse = await fetch("/api/client/account", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password, profile: fallbackProfile }),
        });
        const clientPayload = (await clientResponse.json().catch(() => null)) as
          | { account?: { email: string; profile: ClientProfile }; error?: string }
          | null;

        if (clientResponse.ok && clientPayload?.account) {
          upsertClientAccount({
            email: clientPayload.account.email,
            password,
            profile: clientPayload.account.profile,
          });
          writeClientProfile(clientPayload.account.profile);
          setHasAccount(true);
          return;
        }

        if (clientResponse.status !== 503) {
          setError(clientPayload?.error ?? "Connexion impossible.");
          return;
        }
      } catch {
        // Continue with local fallback for development/offline usage.
      }

      if (existingAccount && existingAccount.password !== password) {
        setError("Mot de passe client incorrect.");
        return;
      }

      upsertClientAccount({ email, password, profile: fallbackProfile });
      writeClientProfile(fallbackProfile);
      setHasAccount(true);
    } finally {
      setLoading(false);
    }
  };

  if (pathname?.startsWith("/admin")) {
    return <>{children}</>;
  }

  if (!loaded) {
    return null;
  }

  if (isAdmin) {
    return pathname?.startsWith("/admin") ? <>{children}</> : null;
  }

  if (hasAccount) {
    return <>{children}</>;
  }

  return (
    <main className={styles.page}>
      <section className={styles.card} aria-labelledby="account-title">
        <div className={styles.icon}>
          <UserRound strokeWidth={1.7} aria-hidden />
        </div>

        <div>
          <p className={styles.kicker}>B.Grumpy Tattoo</p>
          <h1 className={styles.title} id="account-title">
            Se connecter
          </h1>
          <p className={styles.intro}>
            Connectez-vous avec votre adresse mail et votre mot de passe pour accéder à votre espace.
          </p>
        </div>

        <form className={styles.form} onSubmit={login}>
          <label className={styles.field}>
            <span>Adresse mail</span>
            <input
              autoComplete="email"
              inputMode="email"
              type="email"
              value={credentials.email}
              onChange={(event) => {
                setError("");
                setCredentials((current) => ({ ...current, email: event.target.value }));
              }}
              placeholder="prenom@email.fr"
            />
          </label>

          <label className={styles.field}>
            <span>Mot de passe</span>
            <input
              autoComplete="current-password"
              type="password"
              value={credentials.password}
              onChange={(event) => {
                setError("");
                setCredentials((current) => ({ ...current, password: event.target.value }));
              }}
              placeholder="Votre mot de passe"
            />
          </label>

          {error && <p className={styles.error}>{error}</p>}

          <button className={styles.submit} type="submit" disabled={loading}>
            <LockKeyhole strokeWidth={1.8} aria-hidden />
            {loading ? "Connexion..." : "Se connecter"}
            <ArrowRight strokeWidth={1.8} aria-hidden />
          </button>
        </form>
      </section>
    </main>
  );
}
