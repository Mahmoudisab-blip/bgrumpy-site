import type { Metadata } from "next";
import Link from "next/link";
import FAQItem from "@/src/components/FAQItem";
import SectionHeading from "@/src/components/SectionHeading";
import { faqItems } from "@/src/data/faqItems";

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Questions fréquentes B.Grumpy Tattoo : demande de projet, flashs, budget, références et fonctionnement du studio.",
};

export default function FAQPage() {
  return (
    <>
      <section className="border-b hairline bg-[color:var(--paper)] py-16">
        <div className="container-wide grid gap-8 lg:grid-cols-[0.9fr_0.45fr] lg:items-end">
          <SectionHeading
            eyebrow="FAQ"
            title="Tout comprendre avant d’envoyer une demande."
            description="Des réponses claires sur le fonctionnement du studio, les flashs, les projets personnalisés et les informations demandées dans le formulaire."
          />
          <Link href="/devis" className="btn btn-primary w-fit lg:justify-self-end">
            Envoyer mon projet
          </Link>
        </div>
      </section>

      <section className="section-space">
        <div className="container-wide grid gap-5 lg:grid-cols-2">
          {faqItems.map((item) => (
            <FAQItem
              key={item.question}
              category={item.category}
              question={item.question}
              answer={item.answer}
            />
          ))}
        </div>
      </section>
    </>
  );
}
