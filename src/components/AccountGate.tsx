"use client";

import { FormEvent, useEffect, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, LockKeyhole, UserRound } from "lucide-react";
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
const generatedClientLastName = "b.grumpy";
const accountOnlyPaths = ["/profil", "/messagerie", "/devis/en-cours", "/flash", "/flashs"];

const hasRequiredAccount = (profile: ClientProfile) =>
  profile.prenom.trim().length >= 2 &&
  profile.nom.trim().length >= 2 &&
  profile.nom.trim().toLowerCase() !== generatedClientLastName &&
  emailPattern.test(profile.email.trim());

const isAccountOnlyPath = (pathname: string | null) =>
  Boolean(pathname && accountOnlyPaths.some((path) => pathname === path || pathname.startsWith(`${path}/`)));

type AuthMode = "login" | "register" | "profile" | "forgot" | "reset";

type AccountGateProps = {
  children?: ReactNode;
  embedded?: boolean;
};

export default function AccountGate({ children, embedded = false }: AccountGateProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [loaded, setLoaded] = useState(false);
  const [hasAccount, setHasAccount] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [forceLogin, setForceLogin] = useState(false);
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [profileDraft, setProfileDraft] = useState({ prenom: "", nom: "" });
  const [pendingClientCredentials, setPendingClientCredentials] = useState<{
    email: string;
    password: string;
  } | null>(null);
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [resetEmail, setResetEmail] = useState("");
  const [resetPassword, setResetPassword] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const searchParams = new URLSearchParams(window.location.search);
      const forceLogin = searchParams.get("login") === "1";
      const requestedResetToken = searchParams.get("reset")?.trim() ?? "";
      const storedProfile = readClientProfile();
      const storedProfileIsAdmin = isPrimaryAdminEmail(storedProfile.email);

      if (requestedResetToken) {
        setForceLogin(true);
        setResetToken(requestedResetToken);
        setAuthMode("reset");
        setHasAccount(false);
        setIsAdmin(false);
        setLoaded(true);
        return;
      }

      setForceLogin(forceLogin);

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

  const openProfileStep = (email: string, password: string) => {
    setPendingClientCredentials({ email, password });
    setProfileDraft({ prenom: "", nom: "" });
    setAuthMode("profile");
    setError("");
    setNotice("");
  };

  const registerClient = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setNotice("");
    setLoading(true);

    const email = normalizeLoginIdentifier(credentials.email);
    const password = credentials.password.trim();

    if (!emailPattern.test(email)) {
      setError("Indique une adresse mail valide.");
      setLoading(false);
      return;
    }

    if (password.length < 4) {
      setError("Le mot de passe doit contenir au moins 4 caractères.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/client/account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "register",
          email,
          password,
          profile: { ...emptyClientProfile, email },
        }),
      });
      const payload = (await response.json().catch(() => null)) as { error?: string } | null;

      if (response.status === 422) {
        openProfileStep(email, password);
        return;
      }

      if (!response.ok) {
        setError(payload?.error ?? "Création du compte impossible.");
        return;
      }

      setError("Ce compte existe déjà. Connecte-toi avec l’écran précédent.");
    } catch {
      setError("Création du compte impossible pour le moment.");
    } finally {
      setLoading(false);
    }
  };

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
      const fallbackProfile = existingAccount?.profile ?? {
        ...emptyClientProfile,
        email,
      };

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
          if (!hasRequiredAccount(clientPayload.account.profile)) {
            openProfileStep(email, password);
            return;
          }

          upsertClientAccount({
            email: clientPayload.account.email,
            password: "",
            profile: clientPayload.account.profile,
          });
          writeClientProfile(clientPayload.account.profile);
          setHasAccount(true);
          return;
        }

        if (clientResponse.status === 422) {
          openProfileStep(email, password);
          return;
        }

        setError(clientPayload?.error ?? "Connexion impossible.");
        return;
      } catch {
        setError("Connexion impossible pour le moment.");
        return;
      }

    } finally {
      setLoading(false);
    }
  };

  const completeClientProfile = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (!pendingClientCredentials) {
      return;
    }

    const prenom = profileDraft.prenom.trim();
    const nom = profileDraft.nom.trim();

    if (prenom.length < 2 || nom.length < 2) {
      setError("Indique au moins ton prénom et ton nom.");
      return;
    }

    setLoading(true);

    const profile: ClientProfile = {
      ...emptyClientProfile,
      prenom,
      nom,
      email: pendingClientCredentials.email,
    };

    try {
      const clientResponse = await fetch("/api/client/account", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: pendingClientCredentials.email,
          password: pendingClientCredentials.password,
          profile,
        }),
      });
      const clientPayload = (await clientResponse.json().catch(() => null)) as
        | { account?: { email: string; profile: ClientProfile }; error?: string }
        | null;

      if (clientResponse.ok && clientPayload?.account) {
        upsertClientAccount({
          email: clientPayload.account.email,
          password: "",
          profile: clientPayload.account.profile,
        });
        writeClientProfile(clientPayload.account.profile);
        setPendingClientCredentials(null);
        setAuthMode("login");
        setHasAccount(true);
        return;
      }

      setError(clientPayload?.error ?? "Création du compte impossible.");
    } catch {
      setError("Création du compte impossible pour le moment.");
    } finally {
      setLoading(false);
    }
  };

  const requestPasswordReset = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setNotice("");

    const email = normalizeLoginIdentifier(resetEmail);

    if (!emailPattern.test(email)) {
      setError("Indique une adresse mail valide.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/client/password-reset/request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });
      const payload = (await response.json().catch(() => null)) as { error?: string } | null;

      if (!response.ok) {
        setError(payload?.error ?? "L'email de réinitialisation n'a pas pu être envoyé.");
        return;
      }

      setNotice("Si un compte existe avec cette adresse, un email de réinitialisation vient d'être envoyé.");
    } finally {
      setLoading(false);
    }
  };

  const confirmPasswordReset = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setNotice("");

    const password = resetPassword.trim();

    if (password.length < 4) {
      setError("Le nouveau mot de passe doit contenir au moins 4 caractères.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/client/password-reset/confirm", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token: resetToken, password }),
      });
      const payload = (await response.json().catch(() => null)) as { error?: string } | null;

      if (!response.ok) {
        setError(payload?.error ?? "Le mot de passe n'a pas pu être réinitialisé.");
        return;
      }

      setResetPassword("");
      setResetToken("");
      setAuthMode("login");
      setNotice("Mot de passe réinitialisé. Tu peux te connecter avec le nouveau mot de passe.");
      router.replace("/?login=1");
    } finally {
      setLoading(false);
    }
  };

  if (pathname?.startsWith("/admin")) {
    return <>{children}</>;
  }

  if (!loaded) {
    return (
      <main className={styles.page} aria-busy="true">
        <section className={styles.card} aria-label="Chargement">
          <p className={styles.kicker}>B.Grumpy Tattoo</p>
          <p className={styles.intro}>Chargement de ton espace client...</p>
        </section>
      </main>
    );
  }

  if (isAdmin) {
    return pathname?.startsWith("/admin") ? <>{children}</> : null;
  }

  const requiresAccount = isAccountOnlyPath(pathname) || forceLogin || authMode !== "login" || Boolean(resetToken);

  if (!requiresAccount && !embedded) {
    return <>{children}</>;
  }

  if (!embedded && hasAccount && authMode === "login") {
    return <>{children}</>;
  }

  const titleByMode: Record<AuthMode, string> = {
    forgot: "Mot de passe oublié",
    login: "Se connecter",
    register: "Créer mon compte",
    profile: "Créer le compte",
    reset: "Nouveau mot de passe",
  };
  const introByMode: Record<AuthMode, string> = {
    forgot: "Indique ton adresse mail pour recevoir un lien de réinitialisation.",
    login: "Connecte-toi avec ton adresse mail et ton mot de passe pour accéder à ton espace.",
    register: "Crée ton espace client pour suivre tes échanges avec le studio.",
    profile: "Indique au moins ton prénom et ton nom pour finaliser ton espace client.",
    reset: "Choisis un nouveau mot de passe pour ton espace client.",
  };
  const privatePageImage = pathname?.startsWith("/messagerie")
    ? "/DFEEF94D-7BA4-4985-9823-CD269191360D.png"
    : pathname?.startsWith("/profil")
      ? "/7CD67A83-6067-4ECE-BC0C-ADBB221F50EF.png"
      : pathname?.startsWith("/devis/en-cours")
        ? "/E33945DF-ADFA-4EEB-B7B2-499B4C6C9CE5.png"
        : pathname === "/devis"
          ? "/E33945DF-ADFA-4EEB-B7B2-499B4C6C9CE5.png"
        : "/5CCA2C01-3444-46A6-8882-2E25F4F8C0B2.png";

  return (
    <div className={`${styles.page} ${embedded ? styles.embeddedPage : ""}`} data-account-gate>
      {!embedded ? (
        <>
          <img
            className={styles.pageImage}
            src={privatePageImage}
            alt=""
            aria-hidden="true"
          />
          <div className={styles.pageOverlay} aria-hidden="true" />
        </>
      ) : null}
      <section className={styles.card} aria-labelledby="account-title">
        <div className={styles.icon}>
          <UserRound strokeWidth={1.7} aria-hidden />
        </div>

        <div>
          <p className={styles.kicker}>B.Grumpy Tattoo</p>
          <h1 className={styles.title} id="account-title">
            {titleByMode[authMode]}
          </h1>
          <p className={styles.intro}>
            {introByMode[authMode]}
          </p>
        </div>

        <form
          className={styles.form}
          onSubmit={
            authMode === "profile"
              ? completeClientProfile
              : authMode === "forgot"
                ? requestPasswordReset
                : authMode === "reset"
                  ? confirmPasswordReset
                  : authMode === "register"
                    ? registerClient
                    : login
          }
        >
          {authMode === "profile" ? (
            <>
              <div className={styles.profileFields}>
                <label className={styles.field}>
                  <span>Prénom</span>
                  <input
                    autoComplete="given-name"
                    type="text"
                    value={profileDraft.prenom}
                    onChange={(event) => {
                      setError("");
                      setProfileDraft((current) => ({ ...current, prenom: event.target.value }));
                    }}
                    placeholder="Votre prénom"
                  />
                </label>

                <label className={styles.field}>
                  <span>Nom</span>
                  <input
                    autoComplete="family-name"
                    type="text"
                    value={profileDraft.nom}
                    onChange={(event) => {
                      setError("");
                      setProfileDraft((current) => ({ ...current, nom: event.target.value }));
                    }}
                    placeholder="Votre nom"
                  />
                </label>
              </div>

              {error && <p className={styles.error}>{error}</p>}

              <div className={styles.actions}>
                <button
                  className={styles.secondary}
                  type="button"
                  disabled={loading}
                  onClick={() => {
                    setPendingClientCredentials(null);
                    setError("");
                  }}
                >
                  <ArrowLeft strokeWidth={1.8} aria-hidden />
                  Retour
                </button>
                <button className={styles.submit} type="submit" disabled={loading}>
                  <LockKeyhole strokeWidth={1.8} aria-hidden />
                  {loading ? "Création..." : "Créer mon compte"}
                  <ArrowRight strokeWidth={1.8} aria-hidden />
                </button>
              </div>
            </>
          ) : authMode === "forgot" ? (
            <>
              <label className={styles.field}>
                <span>Adresse mail</span>
                <input
                  autoComplete="email"
                  inputMode="email"
                  type="email"
                  value={resetEmail}
                  onChange={(event) => {
                    setError("");
                    setNotice("");
                    setResetEmail(event.target.value);
                  }}
                  placeholder="prenom@email.fr"
                />
              </label>

              {notice && <p className={styles.notice}>{notice}</p>}
              {error && <p className={styles.error}>{error}</p>}

              <div className={styles.actions}>
                <button
                  className={styles.secondary}
                  type="button"
                  disabled={loading}
                  onClick={() => {
                    setAuthMode("login");
                    setError("");
                    setNotice("");
                  }}
                >
                  <ArrowLeft strokeWidth={1.8} aria-hidden />
                  Retour
                </button>
                <button className={styles.submit} type="submit" disabled={loading}>
                  <LockKeyhole strokeWidth={1.8} aria-hidden />
                  {loading ? "Envoi..." : "Recevoir le lien"}
                  <ArrowRight strokeWidth={1.8} aria-hidden />
                </button>
              </div>
            </>
          ) : authMode === "reset" ? (
            <>
              <label className={styles.field}>
                <span>Nouveau mot de passe</span>
                <input
                  autoComplete="new-password"
                  type="password"
                  value={resetPassword}
                  onChange={(event) => {
                    setError("");
                    setNotice("");
                    setResetPassword(event.target.value);
                  }}
                  placeholder="Nouveau mot de passe"
                />
              </label>

              {error && <p className={styles.error}>{error}</p>}

              <button className={styles.submit} type="submit" disabled={loading}>
                <LockKeyhole strokeWidth={1.8} aria-hidden />
                {loading ? "Enregistrement..." : "Changer le mot de passe"}
                <ArrowRight strokeWidth={1.8} aria-hidden />
              </button>
            </>
          ) : (
            <>
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
              {notice && <p className={styles.notice}>{notice}</p>}

              <button className={styles.submit} type="submit" disabled={loading}>
                <LockKeyhole strokeWidth={1.8} aria-hidden />
                {loading ? (authMode === "register" ? "Vérification..." : "Connexion...") : authMode === "register" ? "Continuer" : "Se connecter"}
                <ArrowRight strokeWidth={1.8} aria-hidden />
              </button>
              {authMode === "register" ? (
                <button
                  className={styles.linkButton}
                  type="button"
                  onClick={() => {
                    setAuthMode("login");
                    setError("");
                    setNotice("");
                  }}
                >
                  J&apos;ai déjà un compte
                </button>
              ) : (
                <>
                  <button
                    className={styles.linkButton}
                    type="button"
                    onClick={() => {
                      setResetEmail(credentials.email);
                      setAuthMode("forgot");
                      setError("");
                      setNotice("");
                    }}
                  >
                    Mot de passe oublié ?
                  </button>
                  <button
                    className={styles.linkButton}
                    type="button"
                    onClick={() => {
                      setAuthMode("register");
                      setError("");
                      setNotice("");
                    }}
                  >
                    Nouveau client ? Créer un compte
                  </button>
                </>
              )}
            </>
          )}
        </form>
      </section>
    </div>
  );
}
