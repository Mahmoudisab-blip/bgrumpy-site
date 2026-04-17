import type { Metadata } from "next";
import ProjectInquiryForm from "@/src/components/ProjectInquiryForm";
import SectionHeading from "@/src/components/SectionHeading";

export const metadata: Metadata = {
  title: "Demande de devis et projet",
  description:
    "Formulaire de demande de devis B.Grumpy Tattoo pour flash proposé ou projet personnalisé. Pas de réservation automatique.",
};

export default function DevisPage() {
  return (
    <>
      <section className="border-b hairline bg-[color:var(--paper)] py-16">
        <div className="container-wide grid gap-8 lg:grid-cols-[0.95fr_0.45fr] lg:items-end">
          <SectionHeading
            eyebrow="Demande de devis"
            title="Un formulaire premium pour poser les bonnes informations."
            description="Projet personnalisé ou flash proposé : cette page sert uniquement à envoyer une demande structurée. Elle ne bloque aucun créneau et ne déclenche aucun paiement."
          />
          <div className="subtle-panel p-5">
            <p className="eyebrow">Cadre</p>
            <p className="mt-3 text-sm leading-7 text-[color:var(--muted)]">
              Les disponibilités entre 10h et 17h servent seulement à faciliter l’échange après analyse du projet.
            </p>
          </div>
        </div>
      </section>

      <section className="section-space">
        <div className="container-wide">
          <ProjectInquiryForm />
        </div>
      </section>
    </>
  );
}
