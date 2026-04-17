import Image from "next/image";
import type { PortfolioItem } from "@/src/data/portfolioItems";

type PortfolioGridProps = {
  items: PortfolioItem[];
  compact?: boolean;
};

export default function PortfolioGrid({ items, compact = false }: PortfolioGridProps) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {items.map((item) => (
        <article key={item.id} className="group overflow-hidden rounded-lg border hairline bg-[color:var(--paper)] shadow-[0_18px_44px_rgba(21,21,18,0.08)] transition hover:-translate-y-1 hover:shadow-[0_24px_64px_rgba(21,21,18,0.12)]">
          <div className={`relative ${compact ? "aspect-[4/3]" : "aspect-[3/4]"} overflow-hidden bg-[color:var(--ink)]`}>
            <Image
              src={item.image.src}
              alt={item.image.alt}
              fill
              sizes="(min-width: 1280px) 360px, (min-width: 640px) 50vw, 100vw"
              className="object-cover opacity-90 transition duration-500 group-hover:scale-105 group-hover:opacity-100"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
              <p className="text-xs font-bold uppercase">{item.category}</p>
              <h3 className="mt-2 text-2xl font-black leading-tight">{item.title}</h3>
            </div>
          </div>

          <div className="p-5">
            <div className="flex flex-wrap gap-2 text-xs font-semibold text-[color:var(--sage-dark)]">
              <span className="rounded-md bg-[color:var(--mineral)] px-2.5 py-1">{item.placement}</span>
              <span className="rounded-md bg-[rgba(119,128,106,0.16)] px-2.5 py-1">{item.year}</span>
            </div>
            <p className="mt-4 text-sm leading-7 text-[color:var(--muted)]">{item.description}</p>
          </div>
        </article>
      ))}
    </div>
  );
}
