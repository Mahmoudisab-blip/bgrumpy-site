"use client";

import { useState } from "react";
import styles from "./FAQItem.module.css";

type FAQItemProps = {
  category?: string;
  question: string;
  answer: string | string[];
};

export default function FAQItem({ category, question, answer }: FAQItemProps) {
  const [open, setOpen] = useState(false);

  return (
    <article className={styles.card}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={styles.trigger}
        aria-expanded={open}
      >
        <span className={styles.label}>
          {category ? <span className={styles.category}>{category}</span> : null}
          <span className={styles.question}>{question}</span>
        </span>
        <span className={styles.toggle} aria-hidden="true">
          {open ? "-" : "+"}
        </span>
      </button>
      {open ? (
        <div className={styles.answer}>
          {Array.isArray(answer)
            ? answer.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))
            : answer}
        </div>
      ) : null}
    </article>
  );
}
