import type { Metadata } from "next";
import LegalPage, { LegalSection } from "@/src/components/LegalPage";

export const metadata: Metadata = {
  title: "CGV Flash Septembre 2026 | B.Grumpy Tattoo",
  description: "Conditions de réservation et de paiement de l’opération Flash Septembre 2026.",
};

export default function FlashSeptemberTermsPage() {
  return (
    <LegalPage
      eyebrow="Réservation"
      title="CGV Flash Septembre 2026"
      intro="Les conditions applicables aux réservations de flashs et de flashs personnalisés pendant l’opération de septembre 2026."
    >
      <LegalSection title="1. Offre et période">
        <p>
          L’opération est valable pendant le mois de septembre 2026, dans la limite des créneaux disponibles. Elle est proposée par B.GRUMPY, shop privé en maison à Villiers-sur-Morin (77580). L’adresse exacte est communiquée par le shop après la prise de rendez-vous.
        </p>
        <ul>
          <li>1 ou 2 flashs sélectionnés : 70 € par flash.</li>
          <li>À partir de 3 flashs sélectionnés : tous les flashs sélectionnés passent à 60 € chacun.</li>
          <li>Les flashs personnalisés sont soumis à validation du shop avant le rendez-vous et suivent le même tarif selon la quantité totale sélectionnée.</li>
        </ul>
      </LegalSection>

      <LegalSection title="2. Sélection et flash personnalisé">
        <p>
          La réservation nécessite de sélectionner un ou plusieurs flashs disponibles. Pour un flash personnalisé, le client indique la quantité souhaitée, décrit son idée et joint une photo, une capture ou une inspiration. Le shop vérifie ensuite que la demande peut être validée.
        </p>
        <p>
          Un flash personnalisé ne peut pas être considéré comme validé avant l’examen de la demande par le shop. La quantité affichée dans le panier sert au calcul de l’acompte et du prix ; la réalisation reste soumise à cette validation.
        </p>
        <p>
          Si le shop ne valide pas un flash personnalisé, le client peut proposer un autre projet. L’acompte correspondant est alors conservé et déduit si ce nouveau projet est accepté. Si aucun autre projet n’est accepté ou si le client ne souhaite pas modifier sa demande, l’acompte correspondant au flash personnalisé non validé est remboursé.
        </p>
      </LegalSection>

      <LegalSection title="3. Compte et informations client">
        <p>
          La création d’un compte client et la connexion sont obligatoires pour confirmer une réservation Flash Septembre. Lorsque le client est déjà connecté, les informations enregistrées dans son compte sont reprises dans la demande afin d’éviter de les saisir à nouveau. Le client doit les vérifier et les corriger si nécessaire.
        </p>
        <p>Aucun calendrier de rendez-vous n’est proposé en ligne et aucune date n’est choisie au moment du paiement.</p>
      </LegalSection>

      <LegalSection title="4. Âge et autorisation">
        <p>
          Avant le paiement, le client indique si la personne qui sera tatouée est majeure ou mineure et certifie sur l’honneur que cette déclaration est exacte. Cette déclaration, ainsi que la date et l’heure de son acceptation, sont enregistrées avec la réservation.
        </p>
        <p>
          Si la personne tatouée est mineure, une autorisation écrite de son représentant légal doit être fournie avant la séance. Le shop se réserve le droit d’annuler la réservation si la déclaration est inexacte ou si l’autorisation requise n’est pas fournie. L’autorisation est conservée trois ans lorsque la réglementation relative au tatouage l’exige.
        </p>
      </LegalSection>

      <LegalSection title="5. Prix, acompte et reste à payer">
        <p>
          L’acompte est de 20 € par flash sélectionné, y compris pour les flashs personnalisés après validation. Le prix total et le reste à payer sont calculés automatiquement avant le paiement.
        </p>
        <ul>
          <li>1 flash : total 70 €, acompte 20 €, reste 50 €.</li>
          <li>2 flashs : total 140 €, acompte 40 €, reste 100 €.</li>
          <li>3 flashs : total 180 €, acompte 60 €, reste 120 €.</li>
          <li>4 flashs : total 240 €, acompte 80 €, reste 160 €.</li>
        </ul>
        <p>Le reste à payer est réglé au rendez-vous, selon les modalités communiquées par le shop.</p>
      </LegalSection>

      <LegalSection title="6. Paiement et confirmation">
        <p>
          Le client choisit entre PayPal et le paiement par carte bancaire via SumUp. Il est redirigé vers la page sécurisée du prestataire choisi. Les données bancaires ne sont jamais stockées sur le site B.Grumpy Tattoo.
        </p>
        <p>
          Une réservation n’est considérée comme payée qu’après vérification du paiement par le prestataire. Après confirmation, elle est enregistrée avec le statut : <strong>Acompte payé — date à confirmer</strong>. Le shop confirme ou propose une date de rendez-vous dans les 24 à 48 heures suivant le paiement, puis communique l’adresse exacte du shop privé. Pour accélérer la prise de rendez-vous, le client peut envoyer après le paiement un message privé sur Instagram avec son nom et son prénom afin de valider ensemble une date.
        </p>
      </LegalSection>

      <LegalSection title="7. Annulation et acompte">
        <p>
          L’acompte versé est non remboursable en cas d’annulation définitive de la part du client, sous réserve des droits légaux applicables et de la situation concrète de la prestation. En cas de report demandé par le client ou proposé par le shop, l’acompte est conservé et déduit du nouveau rendez-vous dès qu’une nouvelle date est convenue. Aucun remboursement n’est effectué du seul fait du report.
        </p>
        <p>
          Si le shop ne peut finalement pas réaliser la prestation ou si aucune nouvelle date n’est convenue, les droits impératifs du client restent applicables. La case affichée avant le paiement confirme que le client a été informé de ces règles et a accepté les conditions de réservation.
        </p>
      </LegalSection>

      <LegalSection title="8. Emails et données de réservation">
        <p>
          Après confirmation du paiement, le client reçoit un email récapitulatif. Le shop reçoit les coordonnées, les flashs sélectionnés, les références ou photos transmises, le prix total, l’acompte, le reste à payer, la date et l’heure de confirmation du paiement, ainsi que le statut de la réservation.
        </p>
        <p>Les détails du traitement des données sont disponibles dans la <a href="/politique-confidentialite">politique de confidentialité</a>.</p>
      </LegalSection>
    </LegalPage>
  );
}
