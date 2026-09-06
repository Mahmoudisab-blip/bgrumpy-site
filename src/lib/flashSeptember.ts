export const FLASH_SEPTEMBER_STATUS = "Acompte payé — date à confirmer";
export const FLASH_SEPTEMBER_CUSTOM_ID_PREFIX = "flash-septembre-perso-";
export const FLASH_SEPTEMBER_MAX_CUSTOM_FLASHES = 20;
export const FLASH_SEPTEMBER_PAYMENT_PROVIDERS = ["paypal", "paypal_card"] as const;

export type SeptemberPaymentProvider = typeof FLASH_SEPTEMBER_PAYMENT_PROVIDERS[number];

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
  size?: string;
  style?: string;
  placement?: string;
  custom?: boolean;
};

export type SeptemberContact = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  notes: string;
  customIdea?: string;
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

export function validateSeptemberContact(value: unknown, customFlashSelected = false): SeptemberContact {
  const raw = value && typeof value === "object" ? value as Record<string, unknown> : {};
  const clean = (key: string, max: number) => typeof raw[key] === "string" ? (raw[key] as string).trim().slice(0, max) : "";
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
  return contact;
}
