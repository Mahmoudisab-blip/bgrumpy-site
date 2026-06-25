export const clientProfileStorageKey = "bgrumpy-client-profile";
export const clientAccountsStorageKey = "bgrumpy-client-accounts";
export const clientQuotesStorageKey = "bgrumpy-client-quotes";
export const clientReservationsStorageKey = "bgrumpy-client-reservations";

export type ClientProfile = {
  prenom: string;
  nom: string;
  email: string;
  telephone: string;
  dateNaissance: string;
};

export type ClientAccount = {
  email: string;
  password: string;
  profile: ClientProfile;
};

export type QuoteStatus =
  | "En attente"
  | "Réponse envoyée"
  | "Accepté"
  | "Refusé"
  | "Réservé";

export type ClientQuote = {
  id: string;
  title: string;
  type: string;
  status: QuoteStatus;
  sentAt: string;
  flashId?: string;
  flashIds?: string[];
  budget?: number;
  zone?: string;
  taille?: number;
  projet?: string;
  disponibilites?: string[];
  reglement?: string;
  commentaires?: string;
  references?: Array<{
    id: string;
    name: string;
    url: string;
  }>;
  form?: {
    nom?: string;
    prenom?: string;
    portable?: string;
    email?: string;
    majeur?: string;
    age?: string;
    devis?: string;
    flashId?: string;
    flashIds?: string[];
    budget?: number;
    projet?: string;
    zone?: string;
    taille?: number;
    disponibilites?: string[];
    reglement?: string;
    commentaires?: string;
    spams?: boolean;
    demenagement?: boolean;
  };
};

export type ReservationStatus = "reserved" | "upcoming" | "past";

export type ClientReservation = {
  id: string;
  title: string;
  status: ReservationStatus;
  date?: string;
  note?: string;
  flashId?: string;
};

export const emptyClientProfile: ClientProfile = {
  prenom: "",
  nom: "",
  email: "",
  telephone: "",
  dateNaissance: "",
};

const canUseStorage = () => typeof window !== "undefined" && "localStorage" in window;

const safeSetItem = (key: string, value: string) => {
  try {
    window.localStorage.setItem(key, value);
  } catch (error) {
    if (error instanceof DOMException && error.name === "QuotaExceededError") {
      return;
    }

    throw error;
  }
};

const readJson = <Value>(key: string, fallback: Value): Value => {
  if (!canUseStorage()) {
    return fallback;
  }

  try {
    const raw = window.localStorage.getItem(key);

    return raw ? ({ ...fallback, ...JSON.parse(raw) } as Value) : fallback;
  } catch {
    window.localStorage.removeItem(key);
    return fallback;
  }
};

const readArray = <Value>(key: string): Value[] => {
  if (!canUseStorage()) {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(key);
    const parsed = raw ? JSON.parse(raw) : [];

    return Array.isArray(parsed) ? (parsed as Value[]) : [];
  } catch {
    window.localStorage.removeItem(key);
    return [];
  }
};

export const readClientProfile = () =>
  readJson<ClientProfile>(clientProfileStorageKey, emptyClientProfile);

export const writeClientProfile = (profile: ClientProfile) => {
  if (!canUseStorage()) {
    return;
  }

  safeSetItem(clientProfileStorageKey, JSON.stringify(profile));
};

export const clearClientProfile = () => {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.removeItem(clientProfileStorageKey);
};

export const readClientAccounts = () => readArray<ClientAccount>(clientAccountsStorageKey);

export const writeClientAccounts = (accounts: ClientAccount[]) => {
  if (!canUseStorage()) {
    return;
  }

  safeSetItem(clientAccountsStorageKey, JSON.stringify(accounts));
};

export const upsertClientAccount = (account: ClientAccount) => {
  const accounts = readClientAccounts();

  writeClientAccounts([
    account,
    ...accounts.filter((item) => item.email !== account.email),
  ]);
};

export const findClientAccount = (email: string) =>
  readClientAccounts().find((account) => account.email === email);

export const readClientQuotes = () => readArray<ClientQuote>(clientQuotesStorageKey);

export const writeClientQuotes = (quotes: ClientQuote[]) => {
  if (!canUseStorage()) {
    return;
  }

  safeSetItem(clientQuotesStorageKey, JSON.stringify(quotes));
};

export const addClientQuote = (quote: ClientQuote) => {
  writeClientQuotes([quote, ...readClientQuotes().filter((item) => item.id !== quote.id)]);
};

export const readClientReservations = () =>
  readArray<ClientReservation>(clientReservationsStorageKey);

export const writeClientReservations = (reservations: ClientReservation[]) => {
  if (!canUseStorage()) {
    return;
  }

  safeSetItem(clientReservationsStorageKey, JSON.stringify(reservations));
};

export const addClientReservation = (reservation: ClientReservation) => {
  writeClientReservations([
    reservation,
    ...readClientReservations().filter((item) => item.id !== reservation.id),
  ]);
};

export const readReservedFlashIds = () =>
  readClientReservations()
    .filter((reservation) => reservation.status === "reserved" && reservation.flashId)
    .map((reservation) => reservation.flashId as string);
