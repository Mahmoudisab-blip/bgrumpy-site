import Image from "next/image";
import Link from "next/link";
import type { FlashItem, FlashStatus } from "@/src/data/flashItems";

type FlashGridProps = {
  items: FlashItem[];
};

const statusStyles: Record<FlashStatus, string> = {
  Disponible: "bg-[rgba(119,128,106,0.18)] text-[color:var(--sage-dark)]",
  "En étude": "bg-[rgba(183,169,143,0.25)] text-[color:var(--ink-soft)]",
  Réservé: "bg-[rgba(21,21,18,0.08)] text-[color:var(--muted)]",
};

export default function FlashGrid({ items }: FlashGridProps) {
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      {items.map((item) => (
        <article key={item.id} className="grid overflow-hidden rounded-lg border hairline bg-[color:var(--paper)] shadow-[0_18px_44px_rgba(21,21,18,0.08)] sm:grid-cols-[0.42fr_0.58fr]">
          <div className="relative min-h-72 bg-[color:var(--ink)] sm:min-h-full">
            <Image
              src={item.image.src}
              alt={item.image.alt}
              fill
              sizes="(min-width: 1024px) 320px, 100vw"
              className="object-cover opacity-90"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <span className={`absolute left-4 top-4 rounded-md px-3 py-1 text-xs font-black ${statusStyles[item.status]}`}>
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
