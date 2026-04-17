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
    <div className="overflow-hidden rounded-lg border hairline bg-[color:var(--paper)] shadow-[0_14px_34px_rgba(21,21,18,0.06)]">
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
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border hairline text-lg font-bold text-[color:var(--ink)]">
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
