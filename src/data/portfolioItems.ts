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
    id: "psykokwak-bras",
    title: "Psykokwak",
    category: "Couleur fine",
    placement: "Bras",
    year: "2026",
    description:
      "Tatouage pop et expressif réalisé sur le bras, avec un tracé léger et une touche de couleur.",
    image: {
      src: "/tatouage-psykokwak.png",
      alt: "Tatouage Psykokwak sur un bras",
    },
  },
  {
    id: "tatouage-373ae924",
    title: "Hommage Dragon Ball",
    category: "Manga",
    placement: "Dos",
    year: "2026",
    description:
      "Composition manga en noir et gris avec personnages Dragon Ball et date commémorative.",
    image: {
      src: "/Tatouages/373AE924-547D-4770-927F-456503C575CF.png",
      alt: "Tatouage hommage Dragon Ball avec date sur le dos",
    },
  },
  {
    id: "tatouage-1de23ba1",
    title: "Carpe koi érable",
    category: "Japonais",
    placement: "Mollet",
    year: "2026",
    description:
      "Carpe koi en noir et gris accompagnée de feuilles d'érable rouges.",
    image: {
      src: "/Tatouages/1DE23BA1-2F62-4154-B5F6-46B5692BFA14.png",
      alt: "Tatouage carpe koi avec feuilles d'érable rouges sur le mollet",
    },
  },
  {
    id: "tatouage-6e10098a",
    title: "Portrait Todoroki",
    category: "Manga",
    placement: "Bras",
    year: "2026",
    description:
      "Portrait manga encadré, réalisé en lignes fines et ombrages doux.",
    image: {
      src: "/Tatouages/6E10098A-CEC2-4795-8031-42C3C06943A7.png",
      alt: "Tatouage portrait manga Todoroki sur le bras",
    },
  },
  {
    id: "tatouage-e6cfe19d",
    title: "Thousand Sunny",
    category: "Manga",
    placement: "Bras",
    year: "2026",
    description:
      "Bateau Thousand Sunny inspiré de One Piece, travaillé en ligne fine et dotwork.",
    image: {
      src: "/Tatouages/E6CFE19D-0777-4574-AFB5-3429685A985E.png",
      alt: "Tatouage bateau Thousand Sunny inspiré de One Piece sur le bras",
    },
  },
  {
    id: "tatouage-09377fe9",
    title: "Crâne pirate",
    category: "Blackwork",
    placement: "Épaule",
    year: "2026",
    description:
      "Grande pièce pirate en noir et gris avec crâne, chapeau, gouvernail et boussole.",
    image: {
      src: "/Tatouages/09377FE9-EFE1-4559-BD33-4DDCFBA18826.png",
      alt: "Tatouage crâne pirate avec boussole sur l'épaule",
    },
  },
  {
    id: "tatouage-99769aac",
    title: "Kaneki rouge",
    category: "Manga",
    placement: "Bras",
    year: "2026",
    description:
      "Portrait manga inspiré de Tokyo Ghoul, avec touches rouges et ombrages noirs.",
    image: {
      src: "/Tatouages/99769AAC-29F9-4F0A-ABFA-EB8FC3DEA45D.png",
      alt: "Tatouage manga Kaneki avec touches rouges sur le bras",
    },
  },
  {
    id: "tatouage-6ba53f76",
    title: "Guerrier viking",
    category: "Réalisme noir",
    placement: "Épaule",
    year: "2026",
    description:
      "Portrait de guerrier viking en noir et gris, avec haches, runes et bouclier.",
    image: {
      src: "/Tatouages/6BA53F76-6AB2-404F-92D5-1D029FCC2D7A.png",
      alt: "Tatouage guerrier viking avec haches et runes sur l'épaule",
    },
  },
  {
    id: "tatouage-b8075592",
    title: "Portraits One Piece",
    category: "Manga",
    placement: "Avant-bras",
    year: "2026",
    description:
      "Composition manga One Piece en panneaux, avec portraits et détails rouges.",
    image: {
      src: "/Tatouages/B8075592-1B93-4D05-954E-AF1D58324E72.png",
      alt: "Tatouage portraits One Piece sur l'avant-bras",
    },
  },
  {
    id: "tatouage-7c5e4242",
    title: "Sukuna",
    category: "Manga",
    placement: "Mollet",
    year: "2026",
    description:
      "Personnage manga Sukuna en lignes noires, avec mains expressives et contraste marqué.",
    image: {
      src: "/Tatouages/7C5E4242-C1BA-411F-A08F-3396BE24FA4C.png",
      alt: "Tatouage manga Sukuna sur le mollet",
    },
  },
  {
    id: "tatouage-7288cfb7",
    title: "Totoro",
    category: "Manga",
    placement: "Mollet",
    year: "2026",
    description:
      "Totoro minimaliste en noir et gris, avec dotwork doux et lignes légères.",
    image: {
      src: "/Tatouages/7288CFB7-DF41-4F0F-924B-B7AE2938A8EC.png",
      alt: "Tatouage Totoro minimaliste sur le mollet",
    },
  },
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
