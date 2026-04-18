"use client";

import { useState } from "react";

type FAQItemProps = {
  category?: string;
  question: string;
  answer: string;
};

export default function FAQItem({ category, question, answer }: FAQItemProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="glass-card overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-start justify-between gap-4 px-5 py-5 text-left"
        aria-expanded={open}
      >
        <span>
          {category ? <span className="eyebrow block">{category}</span> : null}
          <span className="mt-2 block text-base font-black leading-6 text-[color:var(--ink)]">{question}</span>
        </span>
        <span className="glass-control flex h-8 w-8 shrink-0 items-center justify-center text-lg font-bold text-[color:var(--ink)]">
          {open ? "-" : "+"}
        </span>
      </button>
      {open ? (
        <div className="border-t hairline px-5 pb-6 pt-4 text-sm leading-7 text-[color:var(--muted)]">
          {answer}
        </div>
      ) : null}
    </div>
  );
}
