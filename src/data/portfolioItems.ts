export type PortfolioItem = {
  id: string;
  title: string;
  category: string;
  placement: string;
  year: string;
  description: string;
  image: {
    src: string;
    alt: string;
  };
};

export const portfolioItems: PortfolioItem[] = [
  {
    id: "organic-geometry",
    title: "Géométrie organique",
    category: "Blackwork fin",
    placement: "Avant-bras",
    year: "2026",
    description:
      "Lignes nettes, respiration visuelle et équilibre entre structure graphique et mouvement naturel.",
    image: {
      src: "https://images.unsplash.com/photo-1552627019-947c3789ffb5?auto=format&fit=crop&fm=jpg&q=70&w=1600",
      alt: "Tatoueur réalisant un motif noir et gris dans une ambiance de studio",
    },
  },
  {
    id: "mineral-lines",
    title: "Lignes minérales",
    category: "Noir et gris",
    placement: "Bras",
    year: "2026",
    description:
      "Un rendu sobre et profond, pensé pour suivre le corps sans perdre sa force graphique.",
    image: {
      src: "https://images.unsplash.com/photo-1568515045052-f9a854d70bfd?auto=format&fit=crop&fm=jpg&q=70&w=1600",
      alt: "Session de tatouage en noir et gris avec machine et gants noirs",
    },
  },
  {
    id: "private-session",
    title: "Session privée",
    category: "Composition",
    placement: "Épaule",
    year: "2025",
    description:
      "Une pièce construite autour de la peau, du silence et d’un contraste maîtrisé.",
    image: {
      src: "https://images.unsplash.com/photo-1513078094721-e7b6e0394a6a?auto=format&fit=crop&fm=jpg&q=70&w=1600",
      alt: "Tatoueur travaillant sur un bras dans un studio calme",
    },
  },
  {
    id: "skin-texture",
    title: "Texture de peau",
    category: "Détail",
    placement: "Poignet",
    year: "2025",
    description:
      "Trait précis, dosage des noirs et finition lisible pour une pièce discrète mais présente.",
    image: {
      src: "https://images.unsplash.com/photo-1565058379802-bbe93b2f703a?auto=format&fit=crop&fm=jpg&q=70&w=1600",
      alt: "Gros plan d’un tatouage en cours avec détails noirs",
    },
  },
  {
    id: "quiet-black",
    title: "Noir apaisé",
    category: "Ornemental",
    placement: "Dos",
    year: "2025",
    description:
      "Une approche masculine et douce à la fois, avec un motif qui garde de l’air.",
    image: {
      src: "https://images.unsplash.com/photo-1624918959325-4ab1f51306d1?auto=format&fit=crop&fm=jpg&q=70&w=1600",
      alt: "Studio de tatouage sombre avec matériel de précision",
    },
  },
  {
    id: "raw-symbol",
    title: "Symbole brut",
    category: "Graphique",
    placement: "Cuisse",
    year: "2024",
    description:
      "Un dessin frontal, sans surcharge, pensé pour garder sa présence dans le temps.",
    image: {
      src: "https://images.unsplash.com/photo-1482375702222-03a768d5ea3c?auto=format&fit=crop&fm=jpg&q=70&w=1600",
      alt: "Détail de tatouage noir sur bras dans une lumière naturelle",
    },
  },
];
