export type FlashStatus = "Disponible" | "En étude" | "Réservé";

export type FlashItem = {
  id: string;
  title: string;
  style: string;
  size: string;
  placement: string;
  status: FlashStatus;
  budgetHint: string;
  description: string;
  image: {
    src: string;
    alt: string;
  };
};

export const flashItems: FlashItem[] = [
  {
    id: "racine-graphique",
    title: "Racine graphique",
    style: "Blackwork fin",
    size: "10 x 8 cm",
    placement: "Avant-bras, cheville",
    status: "Disponible",
    budgetHint: "Budget à cadrer selon zone",
    description:
      "Lignes organiques, tension douce et silhouette végétale pour une pièce discrète.",
    image: {
      src: "https://images.unsplash.com/photo-1764605512907-4c31068a7ccc?auto=format&fit=crop&fm=jpg&q=70&w=1600",
      alt: "Machine de tatouage sur fond noir, ambiance studio",
    },
  },
  {
    id: "cadre-sauvage",
    title: "Cadre sauvage",
    style: "Botanique",
    size: "12 x 10 cm",
    placement: "Bras, mollet",
    status: "Disponible",
    budgetHint: "Format moyen",
    description:
      "Un motif végétal structuré, dessiné pour garder du contraste et une lecture claire.",
    image: {
      src: "https://images.unsplash.com/photo-1624918959325-4ab1f51306d1?auto=format&fit=crop&fm=jpg&q=70&w=1600",
      alt: "Table de studio noire près d’une fenêtre dans une ambiance d’atelier",
    },
  },
  {
    id: "echo-mineral",
    title: "Écho minéral",
    style: "Abstrait",
    size: "8 x 8 cm",
    placement: "Poignet, haut du bras",
    status: "En étude",
    budgetHint: "Petit format",
    description:
      "Un signe compact, sombre et texturé, idéal pour une demande simple et très graphique.",
    image: {
      src: "https://images.unsplash.com/photo-1482375702222-03a768d5ea3c?auto=format&fit=crop&fm=jpg&q=70&w=1600",
      alt: "Détail de tatouage noir et gris sur bras",
    },
  },
  {
    id: "silhouette-fluide",
    title: "Silhouette fluide",
    style: "Graphique",
    size: "11 x 9 cm",
    placement: "Épaule, côtes",
    status: "Disponible",
    budgetHint: "Format moyen",
    description:
      "Courbes franches et détails respirants pour un motif élégant, sans effet décoratif gratuit.",
    image: {
      src: "https://images.unsplash.com/photo-1568515045052-f9a854d70bfd?auto=format&fit=crop&fm=jpg&q=70&w=1600",
      alt: "Tatoueur au travail avec machine et gants dans un studio privé",
    },
  },
  {
    id: "ligne-fauve",
    title: "Ligne fauve",
    style: "Ornemental",
    size: "14 x 6 cm",
    placement: "Avant-bras, mollet",
    status: "Réservé",
    budgetHint: "Format allongé",
    description:
      "Une ligne tendue, presque sculptée, prévue pour accompagner une zone longue du corps.",
    image: {
      src: "https://images.unsplash.com/photo-1513078094721-e7b6e0394a6a?auto=format&fit=crop&fm=jpg&q=70&w=1600",
      alt: "Tatouage en cours sur bras avec ambiance atelier",
    },
  },
  {
    id: "noeud-sage",
    title: "Noeud sage",
    style: "Minimal noir",
    size: "7 x 7 cm",
    placement: "Poignet, clavicule",
    status: "Disponible",
    budgetHint: "Petit format",
    description:
      "Petit motif sobre, équilibré et lisible, pensé pour une première demande ou une pièce légère.",
    image: {
      src: "https://images.unsplash.com/photo-1624918959325-4ab1f51306d1?auto=format&fit=crop&fm=jpg&q=70&w=1600",
      alt: "Matériel de studio de tatouage dans une lumière sombre",
    },
  },
];
