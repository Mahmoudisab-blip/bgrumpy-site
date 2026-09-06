export type BobotStudioResponseRule = {
  all?: string[][];
  any: string[];
  answer: string;
};

export const bobotStudioResponseRules: BobotStudioResponseRule[] = [
  {
    all: [
      ["compte", "inscrire", "inscription", "connecter", "connexion"],
      ["devis", "demande", "formulaire", "projet"],
    ],
    any: ["compte", "inscrire", "inscription", "connecter", "connexion"],
    answer:
      "Non, tu n’as pas besoin de créer un compte pour envoyer une demande de devis. Remplis simplement le formulaire avec ton idée, la zone, la taille, tes références et tes disponibilités. Le compte sert surtout à retrouver le suivi de tes demandes et tes échanges.",
  },
  {
    any: ["photo référence", "photos référence", "photo projet", "image inspiration", "combien photo"],
    answer:
      "Pour une demande de projet, ajoute au minimum deux photos de référence quand elles sont utiles. Elles servent à montrer l’ambiance, le niveau de détail et ce que tu veux éviter : elles ne sont pas là pour imposer une copie. Ajoute aussi la zone et une taille en centimètres pour que le devis soit exploitable.",
  },
  {
    any: ["moyen de paiement", "paiement", "carte bancaire", "espèces", "virement", "alma", "3x", "4x", "payer par carte"],
    answer:
      "Le formulaire propose le paiement en espèces, par carte bancaire, ou en 3x ou 4x par carte bancaire avec Alma. Le choix est transmis avec ta demande ; le site ne déclenche pas de paiement et ne réserve pas automatiquement un créneau.",
  },
  {
    any: ["horaire ouverture", "heures ouverture", "horaires", "heure ouverture", "ouvert", "fermé"],
    answer:
      "Pour les disponibilités affichées dans le formulaire : lundi, mardi, jeudi et vendredi de 14 h à 18 h, et samedi de 10 h à 19 h. Le formulaire recueille tes jours possibles ; Bryan confirme ensuite le créneau avec toi, il n’y a pas de réservation automatique.",
  },
  {
    any: ["disponibilité", "disponibilités", "dispo", "créneau", "date libre", "quand prendre rendez vous", "quand rdv"],
    answer:
      "Le site ne montre pas un agenda avec des créneaux réservables. Indique plusieurs jours qui te conviennent dans le formulaire, avec une préférence si tu en as une ; Bryan étudie le projet puis revient vers toi pour confirmer une date réellement disponible.",
  },
];
