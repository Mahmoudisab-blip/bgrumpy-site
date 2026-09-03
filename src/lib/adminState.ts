import type { FlashItem } from "@/src/data/flashItems";
import type { PortfolioItem } from "@/src/data/portfolioItems";
import type { ClientReservation } from "@/src/lib/clientProfileStorage";

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

export type AdminState = {
  appointmentStatusesById: Record<string, AdminAppointmentStatus>;
  clientNotes: Record<string, string>;
  contentInitialized: boolean;
  flashs: ManagedFlashItem[];
  portfolio: ManagedPortfolioItem[];
  quoteStatusesById: Record<string, AdminQuoteStatus>;
  reservations: ClientReservation[];
};

export const emptyAdminState: AdminState = {
  appointmentStatusesById: {},
  clientNotes: {},
  contentInitialized: false,
  flashs: [],
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

export const normalizeAdminState = (value: Partial<AdminState> | null | undefined): AdminState => ({
  appointmentStatusesById: readRecord<AdminAppointmentStatus>(value?.appointmentStatusesById),
  clientNotes: readRecord<string>(value?.clientNotes),
  contentInitialized: value?.contentInitialized === true,
  flashs: readArray<ManagedFlashItem>(value?.flashs),
  portfolio: readArray<ManagedPortfolioItem>(value?.portfolio),
  quoteStatusesById: readRecord<AdminQuoteStatus>(value?.quoteStatusesById),
  reservations: readArray<ClientReservation>(value?.reservations),
});
