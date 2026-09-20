import type { FlashItem } from "@/src/data/flashItems";
import type { PortfolioItem } from "@/src/data/portfolioItems";
import type { ClientReservation } from "@/src/lib/clientProfileStorage";
import { createSeptemberFilterOptions, type SeptemberFilterGroup, type SeptemberFilterOptions, type SeptemberFlash } from "@/src/lib/flashSeptember";

export type AdminQuoteStatus =
  | "Nouveau"
  | "En cours"
  | "Répondu"
  | "Rendez-vous fixé"
  | "Refusé"
  | "Annulé"
  | "Archivé";

export type AdminAppointmentStatus = "À confirmer" | "Confirmé" | "Déplacé" | "Annulé" | "Terminé";
export type PortfolioAvailability = "Publié" | "Brouillon" | "Archivé";

export type ManagedPortfolioItem = PortfolioItem & {
  availability?: PortfolioAvailability;
  createdAt?: string;
  featured?: boolean;
  price?: number;
  size?: string;
  style?: string;
};

export type ManagedFlashItem = FlashItem & {
  availability?: "Disponible" | "Réservé" | "Vendu";
  createdAt?: string;
};

export type ManagedSeptemberFlash = SeptemberFlash & {
  createdAt?: string;
};

export type ManagedSeptemberFilterGroup = SeptemberFilterGroup;
export type ManagedSeptemberFilterOptions = SeptemberFilterOptions;

export type AdminState = {
  appointmentStatusesById: Record<string, AdminAppointmentStatus>;
  clientNotes: Record<string, string>;
  contentInitialized: boolean;
  flashs: ManagedFlashItem[];
  flashSeptemberFlashs: ManagedSeptemberFlash[];
  deletedFlashSeptemberIds: string[];
  flashSeptemberFilters: ManagedSeptemberFilterOptions;
  flashSeptemberInitialized: boolean;
  portfolio: ManagedPortfolioItem[];
  quoteStatusesById: Record<string, AdminQuoteStatus>;
  reservations: ClientReservation[];
};

export const emptyAdminState: AdminState = {
  appointmentStatusesById: {},
  clientNotes: {},
  contentInitialized: false,
  flashs: [],
  flashSeptemberFlashs: [],
  deletedFlashSeptemberIds: [],
  flashSeptemberFilters: createSeptemberFilterOptions(),
  flashSeptemberInitialized: false,
  portfolio: [],
  quoteStatusesById: {},
  reservations: [],
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);

const readRecord = <Value>(value: unknown): Record<string, Value> =>
  isRecord(value) ? (value as Record<string, Value>) : {};

const readArray = <Value>(value: unknown): Value[] =>
  Array.isArray(value) ? (value as Value[]) : [];

const readStringArray = (value: unknown): string[] => Array.from(new Set(
  readArray<unknown>(value)
    .filter((entry): entry is string => typeof entry === "string")
    .map((entry) => entry.trim())
    .filter(Boolean),
));

const readSeptemberFilterOptions = (value: unknown): ManagedSeptemberFilterOptions => {
  const defaults = createSeptemberFilterOptions();
  const raw = isRecord(value) ? value : {};
  const themes = Object.prototype.hasOwnProperty.call(raw, "themes") ? readStringArray(raw.themes) : defaults.themes;
  const styles = Object.prototype.hasOwnProperty.call(raw, "styles") ? readStringArray(raw.styles) : defaults.styles;

  return {
    themes: themes.filter((entry) => entry !== "Gothique"),
    styles: styles.filter((entry) => !["Whip Shading", "Dotwork", "Blackwork", "Gothique"].includes(entry)),
  };
};

export const normalizeAdminState = (value: Partial<AdminState> | null | undefined): AdminState => ({
  appointmentStatusesById: readRecord<AdminAppointmentStatus>(value?.appointmentStatusesById),
  clientNotes: readRecord<string>(value?.clientNotes),
  contentInitialized: value?.contentInitialized === true,
  flashs: readArray<ManagedFlashItem>(value?.flashs),
  flashSeptemberFlashs: readArray<ManagedSeptemberFlash>(value?.flashSeptemberFlashs),
  deletedFlashSeptemberIds: readStringArray(value?.deletedFlashSeptemberIds),
  flashSeptemberFilters: readSeptemberFilterOptions(value?.flashSeptemberFilters),
  flashSeptemberInitialized: value?.flashSeptemberInitialized === true,
  portfolio: readArray<ManagedPortfolioItem>(value?.portfolio),
  quoteStatusesById: readRecord<AdminQuoteStatus>(value?.quoteStatusesById),
  reservations: readArray<ClientReservation>(value?.reservations),
});
