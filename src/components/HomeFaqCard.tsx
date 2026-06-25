import Link from "next/link";
import { ArrowRight, MessageCircleQuestion } from "lucide-react";
import type { CSSProperties } from "react";
import styles from "@/src/app/HomePage.module.css";

const faqTopics = [
  {
    label: "Acompte",
    question: "Pourquoi il n'est pas remboursable ?",
    meta: "Réservation",
  },
  {
    label: "Séance",
    question: "Comment bien se préparer ?",
    meta: "Avant RDV",
  },
  {
    label: "Soins",
    question: "Que faire après le tattoo ?",
    meta: "Cica",
  },
];

export default function HomeFaqCard() {
  return (
    <article className={`${styles.quickCard} ${styles.flashCard} ${styles.faqHomeCard}`}>
      <div className={`${styles.quickLink} ${styles.flashLink} ${styles.faqHomeLink}`}>
        <div className={styles.flashContent}>
          <h2 className={`${styles.quickTitle} ${styles.flashTitle}`}>
            <MessageCircleQuestion
              className={styles.flashTitleIcon}
              strokeWidth={1.65}
              aria-hidden="true"
            />
            FAQ
          </h2>
          <p className={styles.quickText}>Réponses aux questions fréquentes</p>
        </div>

        <div className={styles.faqHomeStack} aria-hidden="true">
          {faqTopics.map((topic, index) => (
            <span
              className={styles.faqHomeMiniCard}
              key={topic.label}
              style={{ "--index": index } as CSSProperties}
            >
              <span>{topic.label}</span>
              <strong>{topic.question}</strong>
              <small>{topic.meta}</small>
              <i />
            </span>
          ))}
        </div>

        <Link href="/faq" className={styles.flashDiscover}>
          Découvrir
          <ArrowRight className={styles.quickArrow} strokeWidth={1.8} />
        </Link>
      </div>
    </article>
  );
}
