import type { Metadata } from "next";
import LegalPage, { LegalFact, LegalFacts, LegalNotice, LegalSection } from "@/src/components/LegalPage";

export const metadata: Metadata = {
  title: "Mentions légales | B.Grumpy Tattoo",
  description: "Mentions légales de B.Grumpy Tattoo.",
};

export default function MentionsLegalesPage() {
  return (
    <LegalPage
      eyebrow="Informations"
      title="Mentions légales"
      intro="Les informations utiles pour identifier B.Grumpy Tattoo et contacter le shop."
    >
      <LegalSection title="Éditeur du site">
        <LegalFacts>
          <LegalFact label="Exploitant">Bryan Bousch, entrepreneur individuel</LegalFact>
          <LegalFact label="Nom commercial">B.GRUMPY</LegalFact>
          <LegalFact label="SIREN">847 904 307</LegalFact>
          <LegalFact label="SIRET">847 904 307 00018</LegalFact>
          <LegalFact label="Activité">APE 9609Z</LegalFact>
          <LegalFact label="Email"><a href="mailto:info@bgrumpy-tattoo.fr">info@bgrumpy-tattoo.fr</a></LegalFact>
          <LegalFact label="Téléphone"><a href="tel:+33756854799">07 56 85 47 99</a></LegalFact>
        </LegalFacts>
        <LegalNotice>
          B.Grumpy Tattoo reçoit dans un shop privé en maison à Villiers-sur-Morin (77580). L’adresse exacte du rendez-vous est communiquée après la prise de rendez-vous. L’adresse personnelle du siège de l’entrepreneur individuel n’est pas reproduite sur cette page.
        </LegalNotice>
      </LegalSection>

      <LegalSection title="Directeur de la publication">
        <p>Bryan Bousch.</p>
      </LegalSection>

      <LegalSection title="Hébergement">
        <p>
          Le site est hébergé par Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, États-Unis. Vercel assure l’hébergement technique du site ; les paiements sont traités par le prestataire choisi au moment de la réservation.
        </p>
      </LegalSection>

      <LegalSection title="Propriété intellectuelle">
        <p>
          Les textes, visuels, photographies, illustrations et éléments graphiques présents sur ce site sont réservés à B.Grumpy Tattoo ou à leurs ayants droit. Toute reproduction ou réutilisation non autorisée est interdite.
        </p>
      </LegalSection>

      <LegalSection title="Données personnelles et cookies">
        <p>
          Pour comprendre l’utilisation des données et les choix de statistiques, consulte la <a href="/politique-confidentialite">politique de confidentialité</a> et la page <a href="/cookies">Cookies et statistiques</a>.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
