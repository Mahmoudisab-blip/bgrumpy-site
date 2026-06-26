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
  | "Réservé"
  | "Annulé";

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

export const normalizeClientEmail = (email: string) => email.trim().toLowerCase();

export const getClientScopedStorageKey = (key: string) => {
  const profile = readClientProfile();
  const email = normalizeClientEmail(profile.email);

  return email ? `${key}:${email}` : key;
};

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

  safeSetItem(
    clientProfileStorageKey,
    JSON.stringify({
      ...profile,
      email: normalizeClientEmail(profile.email),
    }),
  );
};

export const clearClientProfile = () => {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.removeItem(clientProfileStorageKey);
};

const normalizeClientAccount = (account: ClientAccount): ClientAccount => {
  const email = normalizeClientEmail(account.email);
  const profile = account.profile ?? emptyClientProfile;

  return {
    ...account,
    email,
    profile: {
      ...profile,
      email: normalizeClientEmail(profile.email || email),
    },
  };
};

export const readClientAccounts = () => {
  const uniqueAccounts = new Map<string, ClientAccount>();

  readArray<ClientAccount>(clientAccountsStorageKey).forEach((account) => {
    const normalized = normalizeClientAccount(account);

    if (!uniqueAccounts.has(normalized.email)) {
      uniqueAccounts.set(normalized.email, normalized);
    }
  });

  return Array.from(uniqueAccounts.values());
};

export const writeClientAccounts = (accounts: ClientAccount[]) => {
  if (!canUseStorage()) {
    return;
  }

  const uniqueAccounts = new Map<string, ClientAccount>();

  accounts.forEach((account) => {
    const normalized = normalizeClientAccount(account);

    if (!uniqueAccounts.has(normalized.email)) {
      uniqueAccounts.set(normalized.email, normalized);
    }
  });

  safeSetItem(clientAccountsStorageKey, JSON.stringify(Array.from(uniqueAccounts.values())));
};

export const upsertClientAccount = (account: ClientAccount) => {
  const accounts = readClientAccounts();
  const normalizedAccount = normalizeClientAccount(account);

  writeClientAccounts([
    normalizedAccount,
    ...accounts.filter((item) => normalizeClientEmail(item.email) !== normalizedAccount.email),
  ]);
};

export const findClientAccount = (email: string) =>
  readClientAccounts().find((account) => account.email === normalizeClientEmail(email));

export const replaceClientAccountEmail = (
  previousEmail: string,
  account: ClientAccount,
) => {
  const previousNormalizedEmail = normalizeClientEmail(previousEmail);
  const nextAccount = normalizeClientAccount(account);

  writeClientAccounts([
    nextAccount,
    ...readClientAccounts().filter(
      (item) =>
        normalizeClientEmail(item.email) !== previousNormalizedEmail &&
        normalizeClientEmail(item.email) !== nextAccount.email,
    ),
  ]);
};

const getQuoteEmail = (quote: ClientQuote) => normalizeClientEmail(quote.form?.email ?? "");

const belongsToCurrentClient = <Value extends { form?: { email?: string } }>(value: Value) => {
  const profile = readClientProfile();
  const currentEmail = normalizeClientEmail(profile.email);
  const valueEmail = normalizeClientEmail(value.form?.email ?? "");

  return !currentEmail || valueEmail === currentEmail;
};

export const readClientQuotes = () => {
  const scopedKey = getClientScopedStorageKey(clientQuotesStorageKey);
  const scopedQuotes = readArray<ClientQuote>(scopedKey);

  if (scopedKey !== clientQuotesStorageKey && scopedQuotes.length === 0) {
    const migratedQuotes = readArray<ClientQuote>(clientQuotesStorageKey).filter(belongsToCurrentClient);

    if (migratedQuotes.length) {
      writeClientQuotes(migratedQuotes);
    }

    return migratedQuotes;
  }

  return scopedQuotes.filter(belongsToCurrentClient);
};

export const writeClientQuotes = (quotes: ClientQuote[]) => {
  if (!canUseStorage()) {
    return;
  }

  const profile = readClientProfile();
  const currentEmail = normalizeClientEmail(profile.email);
  const scopedQuotes = currentEmail
    ? quotes.filter((quote) => {
        const quoteEmail = getQuoteEmail(quote);

        return quoteEmail === currentEmail;
      })
    : quotes;

  safeSetItem(getClientScopedStorageKey(clientQuotesStorageKey), JSON.stringify(scopedQuotes));
};

export const addClientQuote = (quote: ClientQuote) => {
  writeClientQuotes([quote, ...readClientQuotes().filter((item) => item.id !== quote.id)]);
};

export const readClientReservations = () => {
  const scopedKey = getClientScopedStorageKey(clientReservationsStorageKey);
  const scopedReservations = readArray<ClientReservation>(scopedKey);

  if (scopedKey !== clientReservationsStorageKey && scopedReservations.length === 0) {
    const legacyReservations = readArray<ClientReservation>(clientReservationsStorageKey);

    if (legacyReservations.length) {
      writeClientReservations(legacyReservations);
    }

    return legacyReservations;
  }

  return scopedReservations;
};

export const writeClientReservations = (reservations: ClientReservation[]) => {
  if (!canUseStorage()) {
    return;
  }

  safeSetItem(getClientScopedStorageKey(clientReservationsStorageKey), JSON.stringify(reservations));
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
