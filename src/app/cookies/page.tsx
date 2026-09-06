import type { Metadata } from "next";
import CookiePreferencesButton from "@/src/components/CookiePreferencesButton";
import LegalPage, { LegalFact, LegalFacts, LegalSection } from "@/src/components/LegalPage";

export const metadata: Metadata = {
  title: "Cookies et statistiques | B.Grumpy Tattoo",
  description: "Informations sur les cookies nécessaires et les statistiques facultatives de B.Grumpy Tattoo.",
};

export default function CookiesPage() {
  return (
    <LegalPage
      eyebrow="Choix de confidentialité"
      title="Cookies et statistiques"
      intro="Les cookies nécessaires au compte et au paiement restent distincts des statistiques facultatives."
    >
      <LegalSection title="Cookies nécessaires">
        <p>
          Le site utilise uniquement les éléments techniques nécessaires pour faire fonctionner ton compte, maintenir ta session et sécuriser les parcours de réservation et de paiement. Ils ne servent pas à faire de la publicité.
        </p>
        <LegalFacts>
          <LegalFact label="Session client"><code>bgrumpy-client-session-v1</code>, jusqu’à 14 jours, pour rester connecté(e) à ton espace.</LegalFact>
          <LegalFact label="Session administration"><code>bgrumpy-admin-session-v2</code>, jusqu’à 8 heures, uniquement lorsque le compte d’administration est connecté. Le cookie historique <code>bgrumpy-admin-session</code> sert seulement à être supprimé lors d’un ancien nettoyage ; il n’est plus créé.</LegalFact>
          <LegalFact label="Préférence statistiques">La préférence est enregistrée dans le stockage local du navigateur sous <code>bgrumpy-analytics-consent-v2</code> ; ce n’est pas un cookie. Elle contient le choix, sa date et la version du texte présenté.</LegalFact>
          <LegalFact label="Paiement">PayPal ou SumUp peuvent déposer leurs propres cookies lorsque tu es redirigé(e) vers leur page sécurisée.</LegalFact>
        </LegalFacts>
      </LegalSection>

      <LegalSection title="Stockage local fonctionnel">
        <p>
          Le site utilise aussi le stockage local ou de session du navigateur pour conserver les éléments nécessaires à ton espace ou les préférences que tu demandes. Ces éléments ne sont pas des cookies publicitaires et ne servent pas à suivre ta navigation à des fins publicitaires.
        </p>
        <LegalFacts>
          <LegalFact label="Profil et compte"><code>bgrumpy-client-profile</code> et <code>bgrumpy-client-accounts</code> gardent une copie locale des informations utiles à la connexion et au préremplissage des formulaires. La session authentifiée côté serveur reste la référence.</LegalFact>
          <LegalFact label="Devis et réservations"><code>bgrumpy-devis-draft</code>, <code>bgrumpy-devis-drafts</code>, <code>bgrumpy-devis-completed</code>, ainsi que <code>bgrumpy-client-quotes</code> et <code>bgrumpy-client-reservations</code> (éventuellement suivis de l’adresse email) servent à reprendre un brouillon et à afficher l’historique de ton espace.</LegalFact>
          <LegalFact label="Messagerie"><code>bgrumpy-messagerie-conversations</code> (éventuellement suivi de l’adresse email) conserve localement l’affichage des conversations et des pièces jointes déjà transmises ; les échanges authentifiés sont également enregistrés côté serveur pour le suivi.</LegalFact>
          <LegalFact label="Favoris et Bobot"><code>bgrumpy-flash-favorites</code> mémorise tes favoris. <code>bgrumpy-bobot-last-greeting</code> et <code>bgrumpy-bobot-daily-answers</code> servent uniquement à éviter les répétitions de Bobot et à varier ses réponses.</LegalFact>
          <LegalFact label="Sélection temporaire"><code>bgrumpy-flash-september-pending-selection</code> est conservé dans le stockage de session uniquement pour retrouver ta sélection après la connexion obligatoire ; il est supprimé ensuite.</LegalFact>
        </LegalFacts>
        <p>
          Effacer les données du navigateur peut supprimer ces copies locales sans supprimer les données déjà enregistrées par le site. Pour une demande d’accès ou d’effacement des données côté serveur, écris à l’adresse indiquée dans la <a href="/politique-confidentialite">politique de confidentialité</a>.
        </p>
      </LegalSection>

      <LegalSection title="Statistiques facultatives">
        <p>
          Si tu acceptes les statistiques, le site mesure de façon pseudonyme les pages consultées. Les données enregistrées sont le chemin de la page, la date et l’heure de la visite, une provenance réduite à l’origine du site et un identifiant visiteur pseudonyme. Le navigateur utilisé peut être lu uniquement pour écarter les robots ; il n’est pas conservé. Aucun nom, email, adresse IP ou donnée bancaire n’est associé à ces statistiques.
        </p>
        <LegalFacts>
          <LegalFact label="Cookie statistique"><code>bgrumpy-visitor-id</code>, identifiant pseudonyme HttpOnly, créé uniquement après acceptation, conservé au maximum 12 mois.</LegalFact>
          <LegalFact label="Anti-doublon et résumé local"><code>bgrumpy-analytics:&lt;page&gt;</code> dans le stockage de session évite de compter plusieurs fois la même page dans un même onglet. <code>bgrumpy-admin-analytics</code> peut conserver localement le résumé nécessaire à l’affichage des statistiques de contenu.</LegalFact>
          <LegalFact label="Preuve du consentement">Le choix accepté ou refusé, sa date et la version du texte présenté sont conservés dans le navigateur et enregistrés côté serveur pour documenter le choix proposé.</LegalFact>
          <LegalFact label="Durée des statistiques">Les événements de fréquentation sont purgés automatiquement après 13 mois.</LegalFact>
        </LegalFacts>
        <p>
          Si tu refuses, aucune nouvelle statistique de fréquentation n’est enregistrée et le cookie visiteur associé est supprimé. Les éventuelles données collectées avant le retrait restent soumises à leur durée de conservation puis sont purgées. Ton choix ne bloque ni ton compte, ni les demandes de devis, ni les paiements.
        </p>
      </LegalSection>

      <LegalSection title="Modifier mon choix">
        <p>Tu peux rouvrir le choix à tout moment. Après modification, recharge une page si tu veux que la nouvelle préférence soit prise en compte partout.</p>
        <CookiePreferencesButton />
      </LegalSection>
    </LegalPage>
  );
}
