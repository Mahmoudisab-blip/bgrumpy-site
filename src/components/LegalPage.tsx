import Link from "next/link";
import type { ReactNode } from "react";
import styles from "./LegalPage.module.css";

export function LegalSection({ children, title }: { children: ReactNode; title: string }) {
  return (
    <section className={styles.section}>
      <h2>{title}</h2>
      {children}
    </section>
  );
}

export function LegalFacts({ children }: { children: ReactNode }) {
  return <dl className={styles.facts}>{children}</dl>;
}

export function LegalFact({ children, label }: { children: ReactNode; label: string }) {
  return (
    <div className={styles.fact}>
      <dt>{label}</dt>
      <dd>{children}</dd>
    </div>
  );
}

export function LegalNotice({ children }: { children: ReactNode }) {
  return <p className={styles.notice}>{children}</p>;
}

export default function LegalPage({
  children,
  eyebrow = "B.Grumpy Tattoo",
  intro,
  title,
  updatedAt = "6 septembre 2026",
}: {
  children: ReactNode;
  eyebrow?: string;
  intro: string;
  title: string;
  updatedAt?: string;
}) {
  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <div className={styles.topbar}>
          <Link href="/">B.Grumpy Tattoo</Link>
          <Link href="/devis">Demander un devis</Link>
        </div>
        <article className={styles.card}>
          <header className={styles.header}>
            <p className={styles.eyebrow}>{eyebrow}</p>
            <h1 className={styles.title}>{title}</h1>
            <p className={styles.intro}>{intro}</p>
            <p className={styles.updated}>Dernière mise à jour : {updatedAt}</p>
          </header>
          <div className={styles.body}>{children}</div>
        </article>
        <div className={styles.bottom}>
          <Link href="/mentions-legales">Mentions légales</Link>
          <Link href="/politique-confidentialite">Confidentialité</Link>
          <Link href="/cookies">Cookies</Link>
          <Link href="/cgv/flash-septembre">CGV Flash Septembre</Link>
        </div>
      </div>
    </main>
  );
}
