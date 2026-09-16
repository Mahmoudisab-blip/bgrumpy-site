import type { Metadata } from "next";
import LegalPage, { LegalSection } from "@/src/components/LegalPage";

export const metadata: Metadata = {
  title: "Politique de confidentialité | B.Grumpy Tattoo",
  description: "Politique de confidentialité et protection des données de B.Grumpy Tattoo.",
};

export default function PolitiqueConfidentialitePage() {
  return (
    <LegalPage
      eyebrow="Vie privée"
      title="Politique de confidentialité"
      intro="Voici quelles données sont utilisées, pourquoi elles le sont et combien de temps elles restent nécessaires."
    >
      <LegalSection title="Responsable du traitement">
        <p>
          Le responsable du traitement est Bryan Bousch, entrepreneur individuel, exerçant sous le nom commercial B.GRUMPY. Pour toute question relative à tes données : <a href="mailto:info@bgrumpy-tattoo.fr">info@bgrumpy-tattoo.fr</a>.
        </p>
        <p>
          L’activité est exercée dans un shop privé en maison à Villiers-sur-Morin (77580). L’adresse exacte du rendez-vous est communiquée séparément après la prise de rendez-vous.
        </p>
      </LegalSection>

      <LegalSection title="Données utilisées">
        <ul>
          <li><strong>Compte client :</strong> prénom, nom, adresse email, téléphone et, si tu le renseignes, date de naissance. Le mot de passe est conservé sous forme hachée et n’est pas lisible par le shop.</li>
          <li><strong>Devis, contact et messagerie :</strong> informations de contact, description du projet, disponibilités, préférences de règlement, messages et photos ou références transmises.</li>
          <li><strong>Réservation Flash Septembre :</strong> coordonnées, flashs choisis, quantité de flashs personnalisés, idée et photo de référence, prix, acompte, reste à payer, prestataire choisi, statut de paiement, statut majeur/mineur déclaré, attestation sur l’honneur et horodatage de son acceptation. Si nécessaire, l’autorisation écrite du représentant légal est également conservée.</li>
          <li><strong>Statistiques facultatives :</strong> page visitée, origine générale de provenance et identifiant visiteur pseudonyme, uniquement après ton accord. Aucun nom, email, adresse IP ou carte bancaire n’est utilisé pour ces statistiques.</li>
          <li><strong>Preuve du choix statistique :</strong> décision acceptée ou refusée, version du texte présenté et date/heure du choix, enregistrées dans le navigateur et dans un journal technique côté serveur.</li>
          <li><strong>Stockage local fonctionnel :</strong> copies nécessaires au préremplissage du profil, aux brouillons de devis, à l’affichage des réservations et de la messagerie, aux favoris, au fonctionnement de Bobot et au maintien temporaire d’une sélection pendant la connexion. Le détail des clés utilisées figure dans la page <a href="/cookies">Cookies et statistiques</a>.</li>
        </ul>
      </LegalSection>

      <LegalSection title="Pourquoi et sur quelle base">
        <ul>
          <li>Créer et gérer ton compte, répondre à une demande ou préparer une réservation : mesures précontractuelles ou exécution du service demandé.</li>
          <li>Traiter et vérifier un acompte : exécution de la réservation et obligations de preuve ou de comptabilité.</li>
          <li>Envoyer les emails liés à ta demande ou à ton paiement : suivi de la demande ou de la réservation.</li>
          <li>Mesurer la fréquentation du site : ton consentement préalable. Tu peux refuser ou modifier ce choix à tout moment depuis la page <a href="/cookies">Cookies et statistiques</a>.</li>
        </ul>
      </LegalSection>

      <LegalSection title="Prestataires et destinataires">
        <p>
          Les données utiles peuvent être accessibles par B.Grumpy Tattoo et les prestataires techniques nécessaires au fonctionnement du site : hébergement Vercel, base de données configurée pour le site, service d’envoi d’emails configuré, ainsi que PayPal ou SumUp lorsque tu choisis l’un de ces prestataires pour le paiement.
        </p>
        <p>
          Les données bancaires sont saisies sur la page sécurisée du prestataire de paiement et ne sont pas stockées sur ce site. Chaque prestataire applique sa propre politique de confidentialité et peut traiter certaines données hors de l’Union européenne avec les garanties prévues par la réglementation applicable.
        </p>
      </LegalSection>

      <LegalSection title="Durées de conservation">
        <ul>
          <li>Compte client : pendant son utilisation, puis jusqu’à sa suppression, sauf conservation nécessaire pour une obligation légale ou la défense des droits.</li>
          <li>Demandes de devis, contact et échanges : le temps nécessaire au suivi, puis au maximum trois ans après le dernier contact lorsqu’aucune conservation plus longue n’est requise.</li>
          <li>Réservations et paiements : pendant les durées nécessaires au suivi de la prestation, à la preuve du paiement et aux obligations comptables ou légales.</li>
          <li>Photos et références : le temps nécessaire à l’étude ou à la réservation, puis aussi longtemps que nécessaire au suivi convenu.</li>
          <li>Déclaration d’âge et preuve d’acceptation : avec la réservation, pendant les durées nécessaires à la preuve et au respect des obligations applicables. L’autorisation écrite du représentant légal est conservée trois ans lorsque la réglementation relative au tatouage l’exige.</li>
          <li>Statistiques de fréquentation : au maximum treize mois ; les anciens enregistrements sont purgés automatiquement.</li>
          <li>Journal des choix de statistiques : au maximum treize mois, puis purge automatique.</li>
        </ul>
      </LegalSection>

      <LegalSection title="Tes droits">
        <p>
          Tu peux demander l’accès, la rectification, l’effacement, la limitation ou la portabilité de tes données, ainsi que t’opposer à certains traitements. Lorsque le traitement repose sur ton consentement, tu peux le retirer à tout moment ; ce retrait ne remet pas en cause ce qui a été fait avant.
        </p>
        <p>
          Pour exercer tes droits, écris à <a href="mailto:info@bgrumpy-tattoo.fr">info@bgrumpy-tattoo.fr</a> en précisant ta demande. Tu peux également adresser une réclamation à la <a href="https://www.cnil.fr/fr/plaintes" target="_blank" rel="noreferrer">CNIL</a>.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
