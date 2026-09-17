export const FLASH_SEPTEMBER_STATUS = "Acompte payé — date à confirmer";
export const FLASH_SEPTEMBER_TERMS_VERSION = "flash-septembre-2026-v3";
export const FLASH_SEPTEMBER_CUSTOM_ID_PREFIX = "flash-septembre-perso-";
export const FLASH_SEPTEMBER_MAX_CUSTOM_FLASHES = 20;
export const FLASH_SEPTEMBER_PAYMENT_PROVIDERS = ["paypal", "paypal_card", "sumup_card"] as const;
export const FLASH_SEPTEMBER_TEST_DEPOSIT_EMAIL = "mahmoudi.sab@gmail.com";

export const FLASH_SEPTEMBER_THEME_FILTERS = [
  "Personnage",
  "Portrait",
  "Anime Girl",
  "Manga",
  "Cartoon",
  "Kawaii",
  "Pokémon",
  "Naruto",
  "One Piece",
  "Jujutsu Kaisen",
  "Ghibli",
  "Sailor Moon",
  "Harry Potter",
  "Jeux vidéo",
  "Animaux",
  "Animaux marins",
  "Oiseaux",
  "Papillons",
  "Fleurs",
  "Botanique",
  "Nature",
  "Serpents",
  "Dragons",
  "Crânes",
  "Anges / Démons",
  "Oni / Yokai",
  "Yeux",
  "Soleil & Lune",
  "Étoiles",
  "Astral",
  "Magie",
  "Fantaisie",
  "Nourriture",
  "Boissons",
  "Objets",
  "Japon",
  "Samouraï",
  "Épées",
  "Halloween",
] as const;

export const FLASH_SEPTEMBER_STYLE_FILTERS = [
  "Manga / Animé",
  "Fineline",
  "Floral",
  "Minimaliste",
  "Ornemental",
  "Japonais",
  "Kawaii / Chibi",
  "Illustratif",
  "Graphique",
] as const;

export const FLASH_SEPTEMBER_SIZE_FILTERS = ["Petit", "Moyen", "Grand", "Manchette"] as const;

export const FLASH_SEPTEMBER_PLACEMENT_FILTERS = [
  "Avant-bras",
  "Bras",
  "Poignet",
  "Main",
  "Doigt",
  "Épaule",
  "Cuisse",
  "Jambe",
  "Mollet",
  "Cheville",
  "Pied",
  "Nuque",
  "Dos",
  "Côtes",
  "Torse",
] as const;

export const FLASH_SEPTEMBER_STATUS_FILTERS = ["Disponible", "En demande", "Réservé"] as const;

export type SeptemberPaymentProvider = typeof FLASH_SEPTEMBER_PAYMENT_PROVIDERS[number];

export type SeptemberFilterGroup = "themes" | "styles";

export type SeptemberFilterOptions = Record<SeptemberFilterGroup, string[]>;

export const createSeptemberFilterOptions = (): SeptemberFilterOptions => ({
  themes: [...FLASH_SEPTEMBER_THEME_FILTERS],
  styles: [...FLASH_SEPTEMBER_STYLE_FILTERS],
});

export type SeptemberAgeStatus = "majeur" | "mineur";

export type SeptemberReferenceAttachment = {
  filename: string;
  contentType: string;
  size: number;
  contentBase64: string;
};

export type SeptemberFlash = {
  id: string;
  reference: string;
  title: string;
  image: { src: string; alt: string } | null;
  status?: "Disponible" | "En demande" | "Réservé";
  description?: string;
  categories?: string[];
  searchTerms?: string[];
  metadataVersion?: number;
  size?: string;
  style?: string;
  placement?: string;
  custom?: boolean;
};

const splitSeptemberMetadata = (value: string | undefined) =>
  value
    ? value
        .split(/\s*(?:\/|,|·)\s*/)
        .map((entry) => entry.trim())
        .filter(Boolean)
    : [];

export function getSeptemberFlashCategories(item: SeptemberFlash) {
  return Array.from(new Set([
    ...(item.categories ?? []),
    ...splitSeptemberMetadata(item.style),
    ...splitSeptemberMetadata(item.size),
    ...splitSeptemberMetadata(item.placement),
  ]));
}

export type SeptemberContact = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  notes: string;
  customIdea?: string;
};

export type ValidatedSeptemberContact = SeptemberContact & {
  ageStatus: SeptemberAgeStatus;
  ageDeclarationAccepted: true;
};

export function createSeptemberCustomFlash(position: number): SeptemberFlash {
  if (!Number.isInteger(position) || position < 1 || position > FLASH_SEPTEMBER_MAX_CUSTOM_FLASHES) {
    throw new Error("Ce flash personnalisé ne peut pas être ajouté.");
  }

  return {
    id: `${FLASH_SEPTEMBER_CUSTOM_ID_PREFIX}${position}`,
    reference: position === 1 ? "PERSO" : `PERSO ${position}`,
    title: position === 1 ? "Flash personnalisé" : `Flash personnalisé ${position}`,
    image: null,
    custom: true,
  };
}

export function getSeptemberCustomFlash(id: string): SeptemberFlash | null {
  const match = id.match(new RegExp(`^${FLASH_SEPTEMBER_CUSTOM_ID_PREFIX}(\\d+)$`));
  const position = match ? Number(match[1]) : Number.NaN;

  return Number.isInteger(position) && position >= 1 && position <= FLASH_SEPTEMBER_MAX_CUSTOM_FLASHES
    ? createSeptemberCustomFlash(position)
    : null;
}

export function priceSeptemberSelection(items: SeptemberFlash[]) {
  if (new Set(items.map((item) => item.id)).size !== items.length) {
    throw new Error("Un même flash ne peut être sélectionné deux fois.");
  }
  const groupRate = items.length >= 3;
  const lines = items.map((item) => ({ ...item, price: groupRate ? 6000 : 7000 }));
  const total = lines.reduce((sum, line) => sum + line.price, 0);
  const deposit = items.length * 2000;
  return { lines, count: items.length, total, deposit, remaining: total - deposit, discount: groupRate ? items.length * 1000 : 0 };
}

export const formatSeptemberMoney = (cents: number) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: cents % 100 === 0 ? 0 : 2 }).format(cents / 100);

export function validateSeptemberContact(value: unknown, customFlashSelected = false): ValidatedSeptemberContact {
  const raw = value && typeof value === "object" ? value as Record<string, unknown> : {};
  const clean = (key: string, max: number) => typeof raw[key] === "string" ? (raw[key] as string).trim().slice(0, max) : "";
  const ageStatus = raw.ageStatus === "majeur" || raw.ageStatus === "mineur" ? raw.ageStatus : null;
  const ageDeclarationAccepted = raw.ageDeclarationAccepted === true
    || raw.ageDeclarationAccepted === "true"
    || raw.ageDeclarationAccepted === "on";
  const contact = {
    firstName: clean("firstName", 100),
    lastName: clean("lastName", 100),
    email: clean("email", 254).toLowerCase(),
    phone: clean("phone", 30),
    notes: clean("notes", 3000),
    customIdea: clean("customIdea", 3000),
  };
  if (!contact.firstName || !contact.lastName) throw new Error("Indique ton prénom et ton nom.");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(contact.email)) throw new Error("Indique une adresse email valide.");
  if (!/^\+?[\d\s().-]{8,30}$/.test(contact.phone) || contact.phone.replace(/\D/g, "").length < 8) throw new Error("Indique un numéro de téléphone valide.");
  if (customFlashSelected && contact.customIdea.length < 10) throw new Error("Décris brièvement ton idée de flash personnalisé.");
  if (!ageStatus) throw new Error("Indique si la personne tatouée est majeure ou mineure avant le paiement.");
  if (!ageDeclarationAccepted) throw new Error("Coche l’attestation sur l’honneur avant le paiement.");
  return { ...contact, ageStatus, ageDeclarationAccepted: true };
}
