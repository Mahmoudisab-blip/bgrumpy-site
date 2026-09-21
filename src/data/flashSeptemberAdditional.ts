import type { SeptemberFlash } from "@/src/lib/flashSeptember";

type SeptemberFlashMetadata = Pick<SeptemberFlash, "categories" | "origin" | "style" | "title" | "description" | "searchTerms">;

const createRange = (
  start: number,
  count: number,
  base: Omit<SeptemberFlashMetadata, "title" | "searchTerms"> & { title: string; searchTerms: string[] },
) => Object.fromEntries(
  Array.from({ length: count }, (_, index) => [
    start + index,
    {
      ...base,
      title: `${base.title} ${index + 1}`,
      searchTerms: [...base.searchTerms, `F${String(start + index).padStart(3, "0")}`],
    },
  ]),
) as Record<number, SeptemberFlashMetadata>;

const createEntries = (start: number, entries: SeptemberFlashMetadata[]) => Object.fromEntries(
  entries.map((entry, index) => [start + index, {
    ...entry,
    searchTerms: [...(entry.searchTerms ?? []), `F${String(start + index).padStart(3, "0")}`],
  }]),
) as Record<number, SeptemberFlashMetadata>;

export const flashSeptemberAdditionalMetadataBySlot: Record<number, SeptemberFlashMetadata> = {
  ...createRange(217, 14, {
    categories: ["Fleurs", "Botanique", "Nature", "Fantaisie"],
    style: "Ornemental",
    title: "Mandala floral",
    searchTerms: ["mandala", "floral", "ornement"],
  }),
  ...createRange(231, 7, {
    categories: ["Yeux", "Magie", "Fantaisie", "Objets"],
    style: "Illustratif",
    title: "Mains et magie",
    searchTerms: ["œil", "main", "cristal", "magie"],
  }),
  ...createRange(238, 8, {
    categories: ["Fleurs", "Botanique", "Nature"],
    style: "Floral",
    title: "Fleur botanique",
    searchTerms: ["fleur", "botanique", "branche"],
  }),
  ...createRange(246, 11, {
    categories: ["Fleurs", "Botanique", "Nature", "Astral"],
    style: "Ornemental",
    title: "Signe botanique",
    searchTerms: ["botanique", "signe", "zodiaque", "branche"],
  }),
  ...createRange(257, 8, {
    categories: ["Soleil & Lune", "Astral", "Étoiles", "Fantaisie"],
    style: "Ornemental",
    title: "Soleil et lune",
    searchTerms: ["soleil", "lune", "astral", "étoiles"],
  }),
  ...createRange(265, 6, {
    categories: ["Fleurs", "Botanique", "Nature", "Fantaisie"],
    style: "Ornemental",
    title: "Ornement botanique",
    searchTerms: ["ornement", "feuilles", "floral"],
  }),
  ...createEntries(271, [
    { categories: ["Dragons", "Animaux", "Fantaisie"], style: "Illustratif", title: "Dragon fantastique", searchTerms: ["dragon"] },
    { categories: ["Personnage", "Cartoon", "Kawaii"], style: "Kawaii / Chibi", title: "Duo cartoon", searchTerms: ["cartoon", "duo"] },
    { categories: ["Personnage", "Portrait", "Fantaisie"], style: "Illustratif", title: "Personnage aux lunettes", searchTerms: ["personnage", "lunettes"] },
    { categories: ["Personnage", "Cartoon"], style: "Illustratif", title: "Betty Boop", searchTerms: ["betty boop"] },
    { categories: ["Personnage", "Cartoon", "Jeux vidéo"], style: "Illustratif", title: "Mario", searchTerms: ["mario", "nintendo"] },
    { categories: ["Personnage", "Manga"], style: "Manga / Animé", title: "Personnage manga encadré", searchTerms: ["manga", "personnage"] },
    { categories: ["Yeux", "Fantaisie", "Étoiles"], style: "Graphique", title: "Sceau étoilé", searchTerms: ["œil", "étoile", "sceau"] },
    { categories: ["Personnage", "Cartoon", "Kawaii"], style: "Kawaii / Chibi", title: "Duo cartoon", searchTerms: ["cartoon", "duo"] },
  ]),
  ...createEntries(279, [
    { categories: ["Personnage", "Cartoon", "Jeux vidéo"], style: "Illustratif", title: "Rick Sanchez", searchTerms: ["rick", "rick et morty"] },
    { categories: ["Personnage", "Manga", "Fantaisie"], style: "Manga / Animé", title: "Personnage anime en case", searchTerms: ["anime", "manga"] },
    { categories: ["Personnage", "Manga", "Fantaisie"], style: "Manga / Animé", title: "Bakugo", searchTerms: ["bakugo", "my hero academia"] },
    { categories: ["Personnage", "Manga", "Portrait"], style: "Manga / Animé", title: "Portrait anime", searchTerms: ["anime", "portrait"] },
  ]),
  ...createEntries(283, [
    { categories: ["Personnage", "Cartoon", "Kawaii"], style: "Kawaii / Chibi", title: "Poupée cousue", searchTerms: ["poupée", "couture", "cartoon"] },
    { categories: ["Animaux", "Cartoon", "Kawaii"], style: "Illustratif", title: "Raton laveur", searchTerms: ["raton laveur", "animal"] },
    { categories: ["Fleurs", "Botanique", "Objets"], style: "Floral", title: "Peigne fleuri", searchTerms: ["peigne", "fleurs", "accessoire"] },
    { categories: ["Personnage", "Cartoon", "Kawaii"], style: "Kawaii / Chibi", title: "Olaf", searchTerms: ["olaf", "la reine des neiges"] },
  ]),
  ...createEntries(287, [
    { categories: ["Personnage", "Cartoon", "Kawaii"], style: "Kawaii / Chibi", title: "Duo de petites créatures", searchTerms: ["créatures", "cartoon"] },
    { categories: ["Personnage", "Cartoon"], style: "Illustratif", title: "Monsieur Patate", searchTerms: ["monsieur patate", "toy story"] },
    { categories: ["Personnage", "Cartoon", "Objets"], style: "Illustratif", title: "Forky", searchTerms: ["forky", "toy story"] },
    { categories: ["Animaux", "Cartoon", "Kawaii"], style: "Kawaii / Chibi", title: "Petit cochon", searchTerms: ["cochon", "animal"] },
    { categories: ["Personnage", "Cartoon", "Nourriture"], style: "Kawaii / Chibi", title: "Personnage gourmand", searchTerms: ["gourmand", "cartoon"] },
    { categories: ["Personnage", "Cartoon", "Fantaisie"], style: "Illustratif", title: "Créature cartoon", searchTerms: ["créature", "cartoon"] },
    { categories: ["One Piece", "Manga", "Personnage"], style: "Manga / Animé", title: "Luffy", searchTerms: ["luffy", "one piece"] },
  ]),
  ...createEntries(294, [
    { categories: ["Yeux", "Objets", "Fantaisie"], style: "Graphique", title: "Œil géométrique", searchTerms: ["œil", "triangle", "géométrique"] },
    { categories: ["Animaux", "Cartoon", "Kawaii"], style: "Kawaii / Chibi", title: "Petit dinosaure fantôme", searchTerms: ["dinosaure", "fantôme", "animal"] },
    { categories: ["Jeux vidéo", "Objets", "Kawaii"], style: "Illustratif", title: "Robot", searchTerms: ["robot", "machine"] },
    { categories: ["Ghibli", "Personnage", "Animaux", "Nature"], style: "Illustratif", title: "Totoro", searchTerms: ["totoro", "ghibli"] },
    { categories: ["Personnage", "Cartoon", "Nourriture"], style: "Illustratif", title: "Femme et gâteau", searchTerms: ["gâteau", "pâtisserie", "personnage"] },
    { categories: ["Papillons", "Fleurs", "Nature", "Botanique"], style: "Floral", title: "Papillon de nuit fleuri", searchTerms: ["papillon de nuit", "fleurs"] },
    { categories: ["Jeux vidéo", "Fantaisie", "Objets", "Kawaii"], style: "Illustratif", title: "Slime dans un coffre", searchTerms: ["slime", "coffre", "dragon quest"] },
  ]),
  ...createRange(301, 8, {
    categories: ["Fleurs", "Botanique", "Astral", "Fantaisie"],
    style: "Ornemental",
    title: "Ornement pointillé",
    searchTerms: ["ornement", "astral", "botanique"],
  }),
  ...createRange(309, 6, {
    categories: ["Fleurs", "Botanique", "Nature", "Astral"],
    style: "Floral",
    title: "Botanique géométrique",
    searchTerms: ["feuille", "botanique", "géométrique"],
  }),
  ...createRange(315, 6, {
    categories: ["Papillons", "Animaux", "Nature"],
    style: "Floral",
    title: "Papillon",
    searchTerms: ["papillon", "aile", "insecte"],
  }),
  ...createRange(321, 9, {
    categories: ["Soleil & Lune", "Astral", "Étoiles", "Fantaisie"],
    style: "Ornemental",
    title: "Ornement céleste",
    searchTerms: ["lune", "soleil", "astral", "étoiles"],
  }),
  330: {
    categories: ["Fleurs", "Botanique", "Nature"],
    style: "Floral",
    title: "Branche botanique courbe",
    searchTerms: ["branche", "botanique", "feuilles", "F330"],
  },
};
