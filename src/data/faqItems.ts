export type FAQItemData = {
  category: string;
  question: string;
  answer: string;
};

export const faqItems: FAQItemData[] = [
  {
    category: "Demande",
    question: "Comment se déroule la demande de projet ?",
    answer:
      "Le formulaire recueille les informations indispensables : coordonnées, style, zone, taille, budget, références et disponibilités entre 10h et 17h. Le studio étudie ensuite la demande avant de revenir vers vous.",
  },
  {
    category: "Projet",
    question: "Dois-je choisir un flash ou un projet personnalisé ?",
    answer:
      "Si vous souhaitez un motif déjà créé, choisissez un flash. Si votre idée est personnelle ou nécessite une proposition unique, optez pour un projet personnalisé.",
  },
  {
    category: "Flashs",
    question: "Proposez-vous une galerie de flashs disponibles ?",
    answer:
      "Oui. La page Flashs présente une sélection de motifs disponibles, en étude ou déjà réservés. Chaque demande reste qualifiée et fait l’objet d’un échange préalable.",
  },
  {
    category: "Fonctionnement",
    question: "Y a-t-il un système de réservation en ligne ?",
    answer:
      "Non. Le studio ne propose pas de réservation automatique, de paiement en ligne ni de calendrier. La démarche consiste à soumettre une demande, puis à recevoir une réponse après analyse.",
  },
  {
    category: "Studio",
    question: "Pourquoi confirmer Villiers-sur-Morin dans le formulaire ?",
    answer:
      "Le studio indique clairement son installation à Villiers-sur-Morin afin d’éviter toute confusion avant d’étudier le projet.",
  },
  {
    category: "Références",
    question: "Combien de photos puis-je envoyer ?",
    answer:
      "Vous pouvez ajouter plusieurs références. Elles servent à préciser l’ambiance, la composition ou ce que vous souhaitez éviter.",
  },
  {
    category: "Budget",
    question: "Le budget maximum est-il obligatoire ?",
    answer:
      "Oui. Il permet de cadrer une proposition réaliste et d’éviter les échanges flous. Ce n’est pas un paiement en ligne.",
  },
];
