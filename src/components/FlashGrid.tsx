import Link from "next/link";
import type { FlashItem, FlashStatus } from "@/src/data/flashItems";

type FlashGridProps = {
  items: FlashItem[];
};

const statusStyles: Record<FlashStatus, string> = {
  Disponible: "glass-chip text-[color:var(--sage-dark)]",
  "En demande": "glass-chip text-[color:var(--ink-soft)]",
  Réservé: "glass-chip text-[color:var(--muted)]",
};

export default function FlashGrid({ items }: FlashGridProps) {
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      {items.map((item) => (
        <article key={item.id} className="glass-card grid overflow-hidden sm:grid-cols-[0.42fr_0.58fr]">
          <div className="relative min-h-72 overflow-hidden bg-[#f8f0e1] sm:min-h-full">
            <span
              className="absolute inset-0 opacity-45"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 18% 22%, rgba(71,69,55,.13) 0 1px, transparent 1.6px), radial-gradient(circle at 72% 36%, rgba(118,105,78,.12) 0 1.2px, transparent 1.9px)",
                backgroundSize: "38px 38px, 52px 52px",
              }}
              aria-hidden
            />
            <img
              src={item.image.src}
              alt={item.image.alt}
              className="absolute object-contain grayscale contrast-110"
              style={{
                inset: "2rem",
                width: "calc(100% - 4rem)",
                height: "calc(100% - 4rem)",
              }}
            />
            <span className={`absolute left-4 top-4 px-3 py-1 text-xs font-black ${statusStyles[item.status]}`}>
              {item.status}
            </span>
          </div>

          <div className="flex flex-col justify-between p-6">
            <div>
              <p className="eyebrow">{item.style}</p>
              <h3 className="mt-3 text-2xl font-black leading-tight text-[color:var(--ink)]">{item.title}</h3>
              <p className="mt-4 text-sm leading-7 text-[color:var(--muted)]">{item.description}</p>
            </div>

            <dl className="mt-6 grid grid-cols-2 gap-3 text-sm">
              <div className="border-t hairline pt-3">
                <dt className="font-bold text-[color:var(--ink)]">Taille</dt>
                <dd className="mt-1 text-[color:var(--muted)]">{item.size}</dd>
              </div>
              <div className="border-t hairline pt-3">
                <dt className="font-bold text-[color:var(--ink)]">Zone idéale</dt>
                <dd className="mt-1 text-[color:var(--muted)]">{item.placement}</dd>
              </div>
              <div className="col-span-2 border-t hairline pt-3">
                <dt className="font-bold text-[color:var(--ink)]">Cadre</dt>
                <dd className="mt-1 text-[color:var(--muted)]">{item.budgetHint}</dd>
              </div>
            </dl>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs leading-5 text-[color:var(--muted)]">
                La demande ne bloque aucun créneau. Elle sert à ouvrir l’échange.
              </p>
              <Link href="/devis" className="btn btn-primary shrink-0">
                Demander ce flash
              </Link>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
