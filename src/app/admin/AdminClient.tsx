"use client";

import type { CSSProperties } from "react";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import {
  Archive,
  ArrowUpDown,
  CalendarCheck,
  CalendarDays,
  Check,
  CheckCheck,
  ChevronRight,
  Clock,
  Euro,
  Eye,
  FileText,
  Heart,
  ImagePlus,
  Images,
  Inbox,
  LayoutDashboard,
  Leaf,
  LogOut,
  Mail,
  MapPin,
  MessageCircle,
  MessageSquareText,
  MoreHorizontal,
  Palette,
  Pencil,
  Phone,
  Plus,
  RefreshCcw,
  Ruler,
  Search,
  Send,
  Settings,
  SlidersHorizontal,
  Sparkles,
  Trash2,
  UserRound,
  UsersRound,
  X,
  Zap,
} from "lucide-react";
import { flashItems, type FlashItem } from "@/src/data/flashItems";
import { portfolioItems, type PortfolioItem } from "@/src/data/portfolioItems";
import { readAdminAnalytics, type AnalyticsEvent, type StoredAdminAnalytics } from "@/src/lib/adminAnalyticsStorage";
import type { StoredServerDevis } from "@/src/lib/serverDevisStore";
import {
  readClientAccounts,
  readClientQuotes,
  readClientReservations,
  writeClientQuotes,
  writeClientReservations,
  type ClientAccount,
  type ClientQuote,
  type ClientReservation,
} from "@/src/lib/clientProfileStorage";
import { logoutEverywhere } from "@/src/lib/logoutSession";
import {
  messagerieStorageKey,
  parseQuoteProposal,
  readImageAttachments,
  readStoredMessagerieFromServer,
  writeStoredMessagerie,
  type MessagerieAttachment,
  type MessagerieMessage,
  type MessagerieThread,
  type StoredMessagerie,
} from "@/src/lib/messagerieStorage";
import styles from "./AdminPage.module.css";

type AdminTab =
  | "dashboard"
  | "quotes"
  | "messages"
  | "appointments"
  | "clients"
  | "portfolio"
  | "flashs"
  | "settings";

type AdminQuoteStatus = "Nouveau" | "En cours" | "Répondu" | "Rendez-vous fixé" | "Refusé" | "Annulé" | "Archivé";
type AdminAppointmentStatus = "À confirmer" | "Confirmé" | "Déplacé" | "Annulé" | "Terminé";
type PortfolioAvailability = "Publié" | "Brouillon" | "Archivé";
type ManagedPortfolioItem = PortfolioItem & {
  availability?: PortfolioAvailability;
  createdAt?: string;
  featured?: boolean;
  price?: number;
  size?: string;
  style?: string;
};
type ManagedFlashItem = FlashItem & { availability?: "Disponible" | "Réservé" | "Vendu"; createdAt?: string };
type PortfolioEditDraft = {
  availability: PortfolioAvailability;
  description: string;
  imageSrc: string;
  placement: string;
  price: string;
  size: string;
  style: string;
  title: string;
};
type VisitDayStat = {
  date: string;
  label: string;
  visits: number;
};
type AdminClientRecord = {
  account?: ClientAccount;
  email: string;
  key: string;
  lastActivityAt: string;
  messages: MessagerieMessage[];
  name: string;
  phone: string;
  quotes: ClientQuote[];
  reservations: ClientReservation[];
  sources: string[];
  threads: MessagerieThread[];
};
type FlashEditDraft = {
  availability: NonNullable<ManagedFlashItem["availability"]>;
  description: string;
  imageSrc: string;
  placement: string;
  price: string;
  size: string;
  style: string;
  title: string;
};

const flashStyleKeywords: Array<{ keywords: string[]; style: string }> = [
  { keywords: ["floral", "fleur", "flower", "botanique", "plante", "leaf", "feuille"], style: "Floral" },
  { keywords: ["manga", "anime", "naruto", "pokemon", "kawaii", "chibi", "ghibli"], style: "Manga / Animé" },
  { keywords: ["japon", "japanese", "samourai", "samurai", "dragon", "oni", "yokai", "katana"], style: "Japonais" },
  { keywords: ["blackwork", "black", "noir", "dark", "ornement", "ornemental"], style: "Blackwork" },
  { keywords: ["fineline", "fine-line", "ligne", "minimal", "minimaliste"], style: "Fineline" },
  { keywords: ["dot", "dotwork", "point", "pointillisme"], style: "Dotwork" },
  { keywords: ["letter", "lettering", "typo", "texte", "gothique"], style: "Lettering" },
  { keywords: ["skull", "crane", "crâne", "demon", "démon", "ange"], style: "Ornemental" },
  { keywords: ["cyber", "futur", "futuriste", "graphique"], style: "Cyber / Futuriste" },
];

const adminQuoteStatusStorageKey = "bgrumpy-admin-quote-statuses";
const adminAppointmentStatusStorageKey = "bgrumpy-admin-appointment-statuses";
const adminClientNotesStorageKey = "bgrumpy-admin-client-notes";
const adminPortfolioStorageKey = "bgrumpy-admin-portfolio-items";
const adminFlashStorageKey = "bgrumpy-admin-flash-items";
const completedDevisStorageKey = "bgrumpy-devis-completed";

const emptyAnalytics: StoredAdminAnalytics = {
  totalVisits: 0,
  visitsByPath: {},
  contentStats: {},
  events: [],
};

const navigation: Array<{ id: AdminTab; label: string; icon: typeof FileText }> = [
  { id: "dashboard", label: "Tableau de bord", icon: LayoutDashboard },
  { id: "quotes", label: "Devis", icon: FileText },
  { id: "messages", label: "Messagerie", icon: MessageSquareText },
  { id: "appointments", label: "Rendez-vous", icon: CalendarDays },
  { id: "clients", label: "Clients", icon: UsersRound },
  { id: "portfolio", label: "Portfolio", icon: Images },
  { id: "flashs", label: "Flashs", icon: Zap },
  { id: "settings", label: "Paramètres", icon: Settings },
];

const clientMirrors: Record<
  AdminTab,
  {
    actions: string[];
    clientRoute: string;
    data: string[];
    image: string;
    intro: string;
    title: string;
  }
> = {
  dashboard: {
    actions: ["Suivre l'activité", "Repérer les demandes chaudes", "Accéder aux contenus à traiter"],
    clientRoute: "/",
    data: ["Visites de la page d'accueil", "Vues des réalisations", "J'aime sur les photos"],
    image: "/44745E65-2925-4E28-B97C-8492E35BC5B6.png",
    intro: "Miroir de la page d'accueil client : ce que les visiteurs voient, aiment et déclenchent.",
    title: "Accueil client",
  },
  quotes: {
    actions: ["Lire les demandes reçues", "Changer le statut", "Répondre", "Convertir en rendez-vous"],
    clientRoute: "/devis",
    data: ["Demandes envoyées par les clients", "Identité client", "Projet", "Zone", "Taille", "Budget"],
    image: "/E33945DF-ADFA-4EEB-B7B2-499B4C6C9CE5.png",
    intro: "Boîte de réception du formulaire client : ici tu consultes et traites les demandes, tu ne crées pas de demande.",
    title: "Demandes de devis reçues",
  },
  messages: {
    actions: ["Répondre", "Envoyer une image", "Marquer comme lu", "Archiver"],
    clientRoute: "/messagerie",
    data: ["Conversations", "Messages client", "Réponses studio", "Pièces jointes à venir"],
    image: "/DFEEF94D-7BA4-4985-9823-CD269191360D.png",
    intro: "Miroir de la messagerie client : la cliente écrit dans l'app, tu réponds ici.",
    title: "Messagerie client",
  },
  appointments: {
    actions: ["Confirmer", "Déplacer", "Annuler", "Suivre l'acompte"],
    clientRoute: "/profil",
    data: ["Flashs réservés", "Devis acceptés", "Rendez-vous à venir", "Statuts"],
    image: "/7CD67A83-6067-4ECE-BC0C-ADBB221F50EF.png",
    intro: "Version studio des réservations visibles dans l'espace client.",
    title: "Réservations client",
  },
  clients: {
    actions: ["Ouvrir la fiche", "Relire l'historique", "Ajouter une note privée"],
    clientRoute: "/profil",
    data: ["Profil", "Coordonnées", "Devis", "Messages", "Réservations"],
    image: "/7CD67A83-6067-4ECE-BC0C-ADBB221F50EF.png",
    intro: "Miroir des profils clients : chaque compte créé côté app devient une fiche studio.",
    title: "Profil client",
  },
  portfolio: {
    actions: ["Ajouter une réalisation", "Mettre en avant", "Modifier", "Réorganiser"],
    clientRoute: "/tatouages",
    data: ["Photos publiées", "Catégories", "Emplacements", "J'aime", "Vues"],
    image: "/6BF88BF7-71DA-4E00-AB25-74EDB3CEB72A.png",
    intro: "Back-office de la galerie tatouages réalisés publiée dans l'application.",
    title: "Page tatouages client",
  },
  flashs: {
    actions: ["Ajouter un flash", "Changer la disponibilité", "Réserver", "Vendre"],
    clientRoute: "/flash",
    data: ["Images", "Prix", "Taille", "Emplacement conseillé", "Favoris", "Réservations"],
    image: "/E33945DF-ADFA-4EEB-B7B2-499B4C6C9CE5.png",
    intro: "Miroir de la galerie flashs : ce qui est disponible côté client se pilote ici.",
    title: "Page flashs client",
  },
  settings: {
    actions: ["Modifier les infos studio", "Préparer les notifications", "Gérer la sécurité"],
    clientRoute: "/",
    data: ["Nom du studio", "Contact", "Horaires", "Réseaux", "Configuration"],
    image: "/44745E65-2925-4E28-B97C-8492E35BC5B6.png",
    intro: "Centre de réglages qui alimente l'identité et les informations visibles dans l'app.",
    title: "Informations site client",
  },
};

const quoteStatuses: AdminQuoteStatus[] = [
  "Nouveau",
  "En cours",
  "Répondu",
  "Rendez-vous fixé",
  "Refusé",
  "Annulé",
  "Archivé",
];

const appointmentStatuses: AdminAppointmentStatus[] = [
  "À confirmer",
  "Confirmé",
  "Déplacé",
  "Annulé",
  "Terminé",
];

const readRecord = <Value,>(key: string): Record<string, Value> => {
  try {
    const raw = window.localStorage.getItem(key);
    const parsed = raw ? JSON.parse(raw) : {};

    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
  } catch {
    window.localStorage.removeItem(key);
    return {};
  }
};

const writeRecord = <Value,>(key: string, value: Record<string, Value>) => {
  window.localStorage.setItem(key, JSON.stringify(value));
};

const readArray = <Value,>(key: string): Value[] => {
  try {
    const raw = window.localStorage.getItem(key);
    const parsed = raw ? JSON.parse(raw) : [];

    return Array.isArray(parsed) ? parsed : [];
  } catch {
    window.localStorage.removeItem(key);
    return [];
  }
};

const writeArray = <Value,>(key: string, value: Value[]) => {
  window.localStorage.setItem(key, JSON.stringify(value));
};

const formatDateTime = (value?: string) => {
  if (!value) return "À planifier";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "short",
  }).format(date);
};

const formatDate = (value?: string) => {
  if (!value) return "Non renseigné";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
};

const toDateKey = (date: Date) =>
  [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");

const formatShortDate = (date: Date) =>
  new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
  }).format(date);

const buildVisitSeries = (events: AnalyticsEvent[], days = 14): VisitDayStat[] => {
  const visitsByDate = new Map<string, number>();

  events.forEach((event) => {
    if (event.type !== "visit") {
      return;
    }

    const date = new Date(event.createdAt);

    if (Number.isNaN(date.getTime())) {
      return;
    }

    const key = toDateKey(date);
    visitsByDate.set(key, (visitsByDate.get(key) ?? 0) + 1);
  });

  const today = new Date();

  return Array.from({ length: days }, (_, index) => {
    const date = new Date(today);
    date.setHours(0, 0, 0, 0);
    date.setDate(today.getDate() - (days - 1 - index));

    const key = toDateKey(date);

    return {
      date: key,
      label: formatShortDate(date),
      visits: visitsByDate.get(key) ?? 0,
    };
  });
};

const getQuoteStatus = (quote: ClientQuote, statuses: Record<string, AdminQuoteStatus>): AdminQuoteStatus => {
  if (statuses[quote.id]) return statuses[quote.id];
  if (quote.status === "Réponse envoyée") return "Répondu";
  if (quote.status === "Réservé" || quote.status === "Accepté") return "Rendez-vous fixé";
  if (quote.status === "Refusé") return "Refusé";
  if (quote.status === "Annulé") return "Annulé";

  return "Nouveau";
};

const getQuoteClientName = (quote: ClientQuote) =>
  [quote.form?.prenom, quote.form?.nom].filter(Boolean).join(" ") || quote.title || "Client";

const getQuoteEmail = (quote: ClientQuote) => quote.form?.email || "Email non renseigné";
const getQuotePhone = (quote: ClientQuote) => quote.form?.portable || "Téléphone non renseigné";
const getQuoteDescription = (quote: ClientQuote) =>
  quote.form?.projet || quote.projet || quote.form?.commentaires || quote.commentaires || "Description non renseignée.";
const getQuotePlacement = (quote: ClientQuote) => quote.form?.zone || quote.zone || "Emplacement non renseigné";
const getQuoteSize = (quote: ClientQuote) => {
  const size = quote.form?.taille ?? quote.taille;

  return size ? `${size} cm` : "Taille non renseignée";
};
const getQuoteBudget = (quote: ClientQuote) => {
  const budget = quote.form?.budget ?? quote.budget;

  return budget ? `${budget} €` : "Budget non renseigné";
};
const getQuoteBudgetValue = (quote: ClientQuote) => quote.form?.budget ?? quote.budget ?? 0;
const getQuoteStyle = (quote: ClientQuote) => quote.form?.devis || quote.type || "Projet tattoo";
const getQuoteProject = (quote: ClientQuote) => {
  const description = getQuoteDescription(quote);

  return description.length > 42 ? `${description.slice(0, 42)}...` : description;
};
const getQuoteImage = (quote: ClientQuote) => {
  const reference = quote.references?.find((item) => item.url);
  const flash = flashItems.find((item) => quote.flashIds?.includes(item.id) || quote.flashId === item.id);

  return reference?.url || flash?.image.src || "/tatouage-psykokwak.png";
};

const formatMessageTime = (date: Date) =>
  new Intl.DateTimeFormat("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);

const getQuoteThreadId = (quote: ClientQuote) => `devis-${quote.id}`;

const getQuoteThreadProject = (quote: ClientQuote) => {
  const selectedFlashIds = quote.flashIds?.length
    ? quote.flashIds
    : quote.flashId
      ? [quote.flashId]
      : [];
  const selectedFlashTitle = flashItems
    .filter((item) => selectedFlashIds.includes(item.id))
    .map((item) => item.title)
    .join(", ");

  return selectedFlashTitle || `Devis - ${getQuotePlacement(quote)}`;
};

const buildQuoteThreadMessage = (quote: ClientQuote) => {
  const references = quote.references?.map((reference) => reference.name).filter(Boolean).join(", ");
  const selectedFlashIds = quote.flashIds?.length
    ? quote.flashIds
    : quote.flashId
      ? [quote.flashId]
      : [];
  const selectedFlashTitle = flashItems
    .filter((item) => selectedFlashIds.includes(item.id))
    .map((item) => item.title)
    .join(", ");
  const rows = [
    ["Nom", quote.form?.nom],
    ["Prénom", quote.form?.prenom],
    ["Portable", getQuotePhone(quote)],
    ["Adresse mail", getQuoteEmail(quote)],
    ["Type de demande", getQuoteStyle(quote)],
    ["Flash sélectionné", selectedFlashTitle],
    ["Budget maximum", getQuoteBudget(quote)],
    ["Projet", getQuoteDescription(quote)],
    ["Zone", getQuotePlacement(quote)],
    ["Taille", getQuoteSize(quote)],
    ["Disponibilités", quote.form?.disponibilites?.join(", ") || quote.disponibilites?.join(", ")],
    ["Règlement", quote.form?.reglement || quote.reglement],
    ["Commentaires", quote.form?.commentaires || quote.commentaires],
    ["Références", references],
  ].filter(([, value]) => value && !String(value).toLowerCase().includes("non renseigné"));

  return [
    "Nouvelle demande de devis",
    "",
    ...rows.map(([label, value]) => `${label}: ${value}`),
  ].join("\n");
};

const findExistingQuoteThread = (
  quote: ClientQuote,
  threads: MessagerieThread[],
  messages: MessagerieMessage[],
) => {
  const expectedThreadId = getQuoteThreadId(quote);
  const expectedEmail = getQuoteEmail(quote).toLowerCase();
  const expectedName = normalizeClientText(getQuoteClientName(quote));
  const expectedProject = getQuoteThreadProject(quote);
  const exactThread = threads.find((thread) => thread.id === expectedThreadId);

  if (exactThread) return exactThread;

  return threads.find((thread) => {
    if (thread.source !== "devis") return false;

    const threadMessages = messages.filter((message) => message.threadId === thread.id);
    const threadEmail = getThreadEmail(thread, threadMessages).toLowerCase();
    const hasSameEmail = expectedEmail !== "email non renseigné" && threadEmail === expectedEmail;
    const hasSameName = normalizeClientText(thread.name) === expectedName;
    const hasSameProject = thread.project === expectedProject || thread.project === `Devis - ${getQuotePlacement(quote)}`;

    return (hasSameEmail || hasSameName) && hasSameProject;
  });
};

const isQuoteThreadSummaryMessage = (message: MessagerieMessage) =>
  message.id.endsWith("-devis") ||
  (message.author === "client" && message.text.trim().toLowerCase().startsWith("nouvelle demande de devis"));

const getLastMessage = (threadId: string, messages: MessagerieMessage[]) =>
  messages.filter((message) => message.threadId === threadId).at(-1);

const normalizeClientText = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

const clientKeyFromEmail = (email: string) => `email:${email.toLowerCase()}`;
const clientKeyFromName = (name: string) => `name:${normalizeClientText(name).replace(/\s+/g, "-") || "client"}`;

const extractEmail = (value: string) => value.match(/[^\s:<>()[\],;]+@[^\s:<>()[\],;]+/)?.[0]?.toLowerCase() ?? "";

const getQuoteClientPhone = (quote: ClientQuote) => quote.form?.portable || "";

const getThreadEmail = (thread: MessagerieThread, threadMessages: MessagerieMessage[]) =>
  extractEmail(threadMessages.map((message) => message.text).join(" ")) || extractEmail(thread.lastMessage);

const makeEmptyAdminClient = (key: string, name: string, email = ""): AdminClientRecord => ({
  email,
  key,
  lastActivityAt: "",
  messages: [],
  name: name.trim() || email || "Client",
  phone: "",
  quotes: [],
  reservations: [],
  sources: [],
  threads: [],
});

const addSource = (client: AdminClientRecord, source: string) => {
  if (!client.sources.includes(source)) {
    client.sources.push(source);
  }
};

const upsertAdminClient = (
  clients: Map<string, AdminClientRecord>,
  key: string,
  name: string,
  email = "",
) => {
  const existing = clients.get(key);

  if (existing) {
    if (!existing.email && email) existing.email = email;
    if ((!existing.name || existing.name === "Client") && name.trim()) existing.name = name.trim();
    return existing;
  }

  const client = makeEmptyAdminClient(key, name, email);
  clients.set(key, client);

  return client;
};

const touchClient = (client: AdminClientRecord, value?: string) => {
  if (!value) return;

  const date = new Date(value);
  const current = client.lastActivityAt ? new Date(client.lastActivityAt) : null;

  if (!Number.isNaN(date.getTime()) && (!current || date > current)) {
    client.lastActivityAt = value;
  }
};

const buildAdminClients = ({
  accounts,
  messages,
  quotes,
  reservations,
  threads,
}: {
  accounts: ClientAccount[];
  messages: MessagerieMessage[];
  quotes: ClientQuote[];
  reservations: ClientReservation[];
  threads: MessagerieThread[];
}) => {
  const clients = new Map<string, AdminClientRecord>();
  const quoteById = new Map(quotes.map((quote) => [quote.id, quote]));

  accounts.forEach((account) => {
    const email = account.email.toLowerCase();
    const name = [account.profile.prenom, account.profile.nom].filter(Boolean).join(" ");
    const client = upsertAdminClient(clients, clientKeyFromEmail(email), name, email);

    client.account = account;
    client.phone = account.profile.telephone || client.phone;
    addSource(client, "Compte");
  });

  quotes.forEach((quote) => {
    const email = getQuoteEmail(quote).toLowerCase();
    const hasEmail = email && email !== "email non renseigné";
    const key = hasEmail ? clientKeyFromEmail(email) : clientKeyFromName(getQuoteClientName(quote));
    const client = upsertAdminClient(clients, key, getQuoteClientName(quote), hasEmail ? email : "");

    client.quotes.push(quote);
    client.phone ||= getQuoteClientPhone(quote);
    touchClient(client, quote.sentAt);
    addSource(client, "Devis");
  });

  threads.forEach((thread) => {
    const threadMessages = messages.filter((message) => message.threadId === thread.id);
    const email = getThreadEmail(thread, threadMessages);
    const key = email ? clientKeyFromEmail(email) : clientKeyFromName(thread.name);
    const client = upsertAdminClient(clients, key, thread.name, email);

    client.threads.push(thread);
    client.messages.push(...threadMessages);
    addSource(client, "Messages");
  });

  reservations.forEach((reservation) => {
    const quoteId = reservation.id.startsWith("quote-rdv-") ? reservation.id.replace("quote-rdv-", "") : "";
    const linkedQuote = quoteById.get(quoteId);
    const email = linkedQuote ? getQuoteEmail(linkedQuote).toLowerCase() : "";
    const hasEmail = email && email !== "email non renseigné";
    const key = linkedQuote
      ? hasEmail
        ? clientKeyFromEmail(email)
        : clientKeyFromName(getQuoteClientName(linkedQuote))
      : clientKeyFromName(reservation.title);
    const client = upsertAdminClient(clients, key, linkedQuote ? getQuoteClientName(linkedQuote) : reservation.title, hasEmail ? email : "");

    client.reservations.push(reservation);
    touchClient(client, reservation.date);
    addSource(client, "Rendez-vous");
  });

  return Array.from(clients.values())
    .map((client) => ({
      ...client,
      messages: client.messages.sort((a, b) => a.time.localeCompare(b.time)),
      quotes: client.quotes.sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime()),
      reservations: client.reservations.sort(
        (a, b) => new Date(b.date ?? 0).getTime() - new Date(a.date ?? 0).getTime(),
      ),
    }))
    .sort((a, b) => new Date(b.lastActivityAt || 0).getTime() - new Date(a.lastActivityAt || 0).getTime());
};

const getEventLabel = (event: AnalyticsEvent) => {
  if (event.type === "visit") return "Visite";
  if (event.type === "content_view") return "Vue photo";
  if (event.type === "content_like") return "J'aime";

  return "J'aime retiré";
};

const makePortfolioFromStatic = (item: PortfolioItem): ManagedPortfolioItem => ({
  ...item,
  availability: "Publié",
  featured: item.id === "psykokwak-bras",
  price: 0,
  size: "À renseigner",
  style: item.category,
});

const mergeStoredPortfolio = (storedPortfolio: ManagedPortfolioItem[]) => {
  const storedById = new Map(storedPortfolio.map((item) => [item.id, item]));
  const customPortfolio = storedPortfolio.filter((item) => item.id.startsWith("admin-portfolio-"));
  const staticPortfolio = portfolioItems.map((item) => {
    const fallback = makePortfolioFromStatic(item);

    return storedById.has(item.id) ? { ...fallback, ...storedById.get(item.id) } : fallback;
  });

  return [...customPortfolio, ...staticPortfolio];
};

const makePortfolioEditDraft = (item: ManagedPortfolioItem): PortfolioEditDraft => ({
  availability: item.availability || "Publié",
  description: item.description,
  imageSrc: item.image.src,
  placement: item.placement,
  price: String(item.price ?? 0),
  size: item.size || "À renseigner",
  style: item.style || item.category,
  title: item.title,
});

const applyPortfolioEditDraft = (
  item: ManagedPortfolioItem,
  draft: PortfolioEditDraft,
): ManagedPortfolioItem => {
  const title = draft.title.trim();
  const style = draft.style.trim() || "Nouvelle réalisation";
  const placement = draft.placement.trim() || "À renseigner";
  const size = draft.size.trim() || "À renseigner";
  const price = Number.parseInt(draft.price, 10);

  return {
    ...item,
    availability: draft.availability,
    category: style,
    description: draft.description.trim() || item.description,
    image: {
      src: draft.imageSrc.trim() || item.image.src,
      alt: title || item.image.alt,
    },
    placement,
    price: Number.isFinite(price) ? price : item.price,
    size,
    style,
    title: title || item.title,
  };
};

const makeAdminPortfolioFromDraft = (draft: PortfolioEditDraft): ManagedPortfolioItem => {
  const now = Date.now();

  return applyPortfolioEditDraft(
    {
      id: `admin-portfolio-${now}`,
      title: draft.title.trim(),
      category: draft.style.trim() || "Nouvelle réalisation",
      placement: draft.placement.trim() || "À renseigner",
      year: new Date().getFullYear().toString(),
      description: draft.description.trim() || "Réalisation ajoutée depuis l'administration.",
      image: {
        src: draft.imageSrc.trim() || "/tatouage-psykokwak.png",
        alt: draft.title.trim(),
      },
      availability: draft.availability,
      createdAt: new Date().toISOString(),
      featured: false,
      price: 0,
      size: draft.size.trim() || "À renseigner",
      style: draft.style.trim() || "Nouvelle réalisation",
    },
    draft,
  );
};

const makeFlashFromStatic = (item: FlashItem): ManagedFlashItem => ({
  ...item,
  availability: item.status === "Réservé" ? "Réservé" : "Disponible",
});

const mergeStoredFlashs = (storedFlashs: ManagedFlashItem[]) => {
  const storedById = new Map(storedFlashs.map((item) => [item.id, item]));
  const customFlashs = storedFlashs.filter((item) => item.id.startsWith("admin-flash-"));
  const staticFlashs = flashItems.map((item) => {
    const fallback = makeFlashFromStatic(item);

    return storedById.has(item.id) ? { ...fallback, ...storedById.get(item.id) } : fallback;
  });

  return [...customFlashs, ...staticFlashs];
};

const makeFlashEditDraft = (item: ManagedFlashItem): FlashEditDraft => ({
  availability: item.availability || (item.status === "Réservé" ? "Réservé" : "Disponible"),
  description: item.description,
  imageSrc: item.image.src,
  placement: item.placement,
  price: String(item.price),
  size: item.size,
  style: item.style || item.styles[0] || "Fineline",
  title: item.title,
});

const normalizeFlashText = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

const titleFromImageFile = (file: File) => {
  const nameWithoutExtension = file.name.replace(/\.[^.]+$/, "");
  const cleaned = nameWithoutExtension
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!cleaned) return "";

  return cleaned
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const styleFromImageFile = (file: File) => {
  const haystack = normalizeFlashText(file.name);
  const match = flashStyleKeywords.find((item) =>
    item.keywords.some((keyword) => haystack.includes(normalizeFlashText(keyword))),
  );

  return match?.style ?? "";
};

const inferFlashDraftFromImage = (current: FlashEditDraft, file: File): FlashEditDraft => {
  const inferredTitle = titleFromImageFile(file);
  const inferredStyle = styleFromImageFile(file);

  return {
    ...current,
    style: current.style.trim() || inferredStyle,
    title: current.title.trim() || inferredTitle,
  };
};

const makeNewFlashDraft = (): FlashEditDraft => ({
  availability: "Disponible",
  description: "",
  imageSrc: "",
  placement: "",
  price: "",
  size: "",
  style: "",
  title: "",
});

const applyFlashEditDraft = (item: ManagedFlashItem, draft: FlashEditDraft): ManagedFlashItem => {
  const title = draft.title.trim();
  const style = draft.style.trim() || "Fineline";
  const size = draft.size.trim() || "Moyen";
  const placement = draft.placement.trim() || "Avant-bras";
  const price = Number.parseInt(draft.price, 10);

  return {
    ...item,
    availability: draft.availability,
    budgetHint: Number.isFinite(price) ? `${price} €` : item.budgetHint,
    description: draft.description.trim() || item.description,
    image: {
      src: draft.imageSrc.trim() || item.image.src,
      alt: title || item.image.alt,
    },
    placement,
    placements: [placement],
    price: Number.isFinite(price) ? price : item.price,
    size,
    sizes: [size],
    status: draft.availability === "Réservé" ? "Réservé" : "Disponible",
    style,
    styles: [style],
    title: title || item.title,
  };
};

const makeAdminFlashFromDraft = (draft: FlashEditDraft): ManagedFlashItem => {
  const now = Date.now();

  return applyFlashEditDraft(
    {
      ...flashItems[0],
      id: `admin-flash-${now}`,
      reference: `BG-${now.toString().slice(-4)}`,
      title: draft.title.trim(),
      image: {
        src: draft.imageSrc.trim() || flashItems[0]?.image.src || "/tatouage-psykokwak.png",
        alt: draft.title.trim(),
      },
      createdAt: new Date().toISOString(),
    },
    draft,
  );
};

const makeQuoteFromServerDevis = (devis: StoredServerDevis): ClientQuote => {
  const payload = devis.payload;
  const selectedFlashIds =
    payload.flashIds && payload.flashIds.length > 0
      ? payload.flashIds
      : payload.flashId
        ? [payload.flashId]
        : [];
  const selectedFlashTitle = flashItems
    .filter((item) => selectedFlashIds.includes(item.id))
    .map((item) => item.title)
    .join(", ");

  return {
    id: devis.id,
    title: selectedFlashTitle || payload.devis || "Demande de devis",
    type: payload.devis || "Demande de devis",
    status: "En attente",
    sentAt: devis.sentAt,
    flashId: selectedFlashIds[0] ?? payload.flashId,
    flashIds: selectedFlashIds,
    budget: payload.budget,
    zone: payload.zone,
    taille: payload.taille,
    projet: payload.projet,
    disponibilites: payload.disponibilites,
    reglement: payload.reglement,
    commentaires: payload.commentaires,
    references: payload.referencePhotos?.length
      ? payload.referencePhotos
      : payload.references?.map((name, index) => ({
          id: `${devis.id}-reference-${index}`,
          name,
          url: "",
        })),
    form: {
      ...payload,
      flashId: selectedFlashIds[0] ?? payload.flashId,
      flashIds: selectedFlashIds,
    },
  };
};

const makeQuoteFromCompleted = (completed: {
  form?: ClientQuote["form"];
  references?: ClientQuote["references"];
  sentAt?: string;
}): ClientQuote | null => {
  if (!completed.form || !completed.sentAt) {
    return null;
  }

  const selectedFlashIds =
    completed.form.flashIds && completed.form.flashIds.length > 0
      ? completed.form.flashIds
      : completed.form.flashId
        ? [completed.form.flashId]
        : [];
  const selectedFlashTitle = flashItems
    .filter((item) => selectedFlashIds.includes(item.id))
    .map((item) => item.title)
    .join(", ");

  return {
    id: `completed-${completed.sentAt}`,
    title: selectedFlashTitle || completed.form.devis || "Demande de devis",
    type: completed.form.devis || "Demande de devis",
    status: "En attente",
    sentAt: completed.sentAt,
    flashId: selectedFlashIds[0] ?? completed.form.flashId,
    flashIds: selectedFlashIds,
    budget: completed.form.budget,
    zone: completed.form.zone,
    taille: completed.form.taille,
    projet: completed.form.projet,
    disponibilites: completed.form.disponibilites,
    reglement: completed.form.reglement,
    commentaires: completed.form.commentaires,
    references: completed.references,
    form: completed.form,
  };
};

export default function AdminClient() {
  const [activeTab, setActiveTab] = useState<AdminTab>("dashboard");
  const [analytics, setAnalytics] = useState<StoredAdminAnalytics>(emptyAnalytics);
  const [threads, setThreads] = useState<MessagerieThread[]>([]);
  const [messages, setMessages] = useState<MessagerieMessage[]>([]);
  const [accounts, setAccounts] = useState<ClientAccount[]>([]);
  const [quotes, setQuotes] = useState<ClientQuote[]>([]);
  const [reservations, setReservations] = useState<ClientReservation[]>([]);
  const [quoteStatusesById, setQuoteStatusesById] = useState<Record<string, AdminQuoteStatus>>({});
  const [appointmentStatusesById, setAppointmentStatusesById] = useState<Record<string, AdminAppointmentStatus>>({});
  const [clientNotes, setClientNotes] = useState<Record<string, string>>({});
  const [portfolio, setPortfolio] = useState<ManagedPortfolioItem[]>([]);
  const [flashs, setFlashs] = useState<ManagedFlashItem[]>([]);
  const [query, setQuery] = useState("");
  const [selectedThreadId, setSelectedThreadId] = useState("");
  const [selectedQuoteId, setSelectedQuoteId] = useState("");
  const [selectedClientEmail, setSelectedClientEmail] = useState("");
  const [reply, setReply] = useState("");
  const [replyAttachments, setReplyAttachments] = useState<MessagerieAttachment[]>([]);
  const [newPortfolioTitle, setNewPortfolioTitle] = useState("");
  const [newFlashTitle, setNewFlashTitle] = useState("");

  const loadAdmin = async () => {
    const storedThreads = await readStoredMessagerieFromServer() ?? (() => {
      try {
        const raw = window.localStorage.getItem(messagerieStorageKey);
        const parsed = raw ? (JSON.parse(raw) as Partial<StoredMessagerie>) : {};

        return {
          threads: Array.isArray(parsed.threads) ? parsed.threads : [],
          messages: Array.isArray(parsed.messages) ? parsed.messages : [],
        };
      } catch {
        window.localStorage.removeItem(messagerieStorageKey);
        return { threads: [], messages: [] };
      }
    })();

    const serverQuotes = await fetch("/api/admin/devis", {
      cache: "no-store",
    })
      .then((response) => (response.ok ? response.json() : null))
      .then((payload: { devis?: StoredServerDevis[] } | null) =>
        Array.isArray(payload?.devis) ? payload.devis.map(makeQuoteFromServerDevis) : [],
      )
      .catch(() => []);
    const storedAccounts = await fetch("/api/admin/accounts", {
      cache: "no-store",
    })
      .then((response) => (response.ok ? response.json() : null))
      .then((payload: { accounts?: ClientAccount[] } | null) =>
        Array.isArray(payload?.accounts) && payload.accounts.length > 0
          ? payload.accounts
          : readClientAccounts(),
      )
      .catch(() => readClientAccounts());
    const storedQuotes = readClientQuotes();
    const completedQuote = (() => {
      try {
        const raw = window.localStorage.getItem(completedDevisStorageKey);

        return raw ? makeQuoteFromCompleted(JSON.parse(raw) as { form?: ClientQuote["form"]; sentAt?: string }) : null;
      } catch {
        window.localStorage.removeItem(completedDevisStorageKey);
        return null;
      }
    })();
    const browserQuotes = completedQuote && !storedQuotes.some((quote) => quote.id === completedQuote.id)
      ? [completedQuote, ...storedQuotes]
      : storedQuotes;
    const allQuotes = [
      ...serverQuotes,
      ...browserQuotes.filter(
        (quote) => !serverQuotes.some((serverQuote) => serverQuote.id === quote.id),
      ),
    ];
    if (browserQuotes !== storedQuotes) {
      writeClientQuotes(browserQuotes);
    }
    const storedReservations = readClientReservations();
    const storedPortfolio = readArray<ManagedPortfolioItem>(adminPortfolioStorageKey);
    const storedFlashs = readArray<ManagedFlashItem>(adminFlashStorageKey);

    setAnalytics(readAdminAnalytics());
    setThreads(storedThreads.threads);
    setMessages(storedThreads.messages);
    setAccounts(storedAccounts);
    setQuotes(allQuotes);
    setReservations(storedReservations);
    setQuoteStatusesById(readRecord<AdminQuoteStatus>(adminQuoteStatusStorageKey));
    setAppointmentStatusesById(readRecord<AdminAppointmentStatus>(adminAppointmentStatusStorageKey));
    setClientNotes(readRecord<string>(adminClientNotesStorageKey));
    setPortfolio(mergeStoredPortfolio(storedPortfolio));
    setFlashs(mergeStoredFlashs(storedFlashs));
    setSelectedThreadId((current) => current || storedThreads.threads[0]?.id || "");
    setSelectedQuoteId((current) => current || allQuotes[0]?.id || "");
    setSelectedClientEmail((current) => {
      if (current) return current;

      const firstAccount = storedAccounts[0];
      if (firstAccount?.email) return clientKeyFromEmail(firstAccount.email);

      const firstQuote = allQuotes[0];
      if (firstQuote) {
        const email = getQuoteEmail(firstQuote).toLowerCase();
        return email && email !== "email non renseigné"
          ? clientKeyFromEmail(email)
          : clientKeyFromName(getQuoteClientName(firstQuote));
      }

      return storedThreads.threads[0] ? clientKeyFromName(storedThreads.threads[0].name) : "";
    });
  };

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      void loadAdmin();
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  const contentStats = useMemo(() => Object.values(analytics.contentStats), [analytics.contentStats]);
  const totalViews = contentStats.reduce((total, item) => total + item.views, 0);
  const totalLikes = contentStats.reduce((total, item) => total + item.likes, 0);
  const visitSeries = useMemo(() => buildVisitSeries(analytics.events), [analytics.events]);
  const unreadMessages = threads.reduce((total, thread) => total + (thread.unread ?? 0), 0);
  const upcomingAppointments = reservations.filter((item) => item.status !== "past");
  const newClients = accounts.filter((account) => {
    const hasQuote = quotes.some((quote) => quote.form?.email === account.email);
    const hasThread = threads.some((thread) => thread.name.toLowerCase().includes(account.profile.prenom.toLowerCase()));

    return hasQuote || hasThread || !account.profile.dateNaissance;
  });
  const recentEvents = analytics.events.slice(0, 8);
  const visibleQuotes = quotes.filter((quote) => {
    const haystack = [
      quote.title,
      quote.type,
      getQuoteClientName(quote),
      getQuoteEmail(quote),
      getQuotePhone(quote),
      getQuoteDescription(quote),
      getQuoteStatus(quote, quoteStatusesById),
    ].join(" ");

    return haystack.toLowerCase().includes(query.trim().toLowerCase());
  });
  const visibleThreads = threads.filter((thread) =>
    [thread.name, thread.project, thread.lastMessage, thread.status]
      .join(" ")
      .toLowerCase()
      .includes(query.trim().toLowerCase()),
  );
  const adminClients = buildAdminClients({
    accounts,
    messages,
    quotes,
    reservations,
    threads,
  });
  const visibleClients = adminClients.filter((client) =>
    [client.email, client.name, client.phone, client.sources.join(" "), client.quotes.map((quote) => quote.title).join(" ")]
      .join(" ")
      .toLowerCase()
      .includes(query.trim().toLowerCase()),
  );
  const selectedClient = adminClients.find((client) => client.key === selectedClientEmail) ?? adminClients[0];
  const selectedThread = threads.find((thread) => thread.id === selectedThreadId) ?? threads[0];
  const selectedQuote = quotes.find((quote) => quote.id === selectedQuoteId) ?? quotes[0];
  const selectedThreadMessages = selectedThread
    ? messages.filter((message) => message.threadId === selectedThread.id)
    : [];
  const selectedThreadQuote = selectedThread
    ? quotes.find((quote) => findExistingQuoteThread(quote, threads, messages)?.id === selectedThread.id)
    : undefined;
  const topPaths = Object.entries(analytics.visitsByPath)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 6);
  const maxPathVisits = Math.max(1, ...topPaths.map(([, count]) => count));
  const mirrorMetrics: Record<AdminTab, Array<{ label: string; value: number }>> = {
    dashboard: [
      { label: "Visites accueil", value: analytics.visitsByPath["/"] ?? 0 },
      { label: "Vues photos", value: totalViews },
      { label: "J'aime", value: totalLikes },
    ],
    quotes: [
      { label: "Devis reçus", value: quotes.length },
      { label: "Nouveaux", value: quotes.filter((quote) => getQuoteStatus(quote, quoteStatusesById) === "Nouveau").length },
      { label: "Convertis", value: reservations.filter((item) => item.id.startsWith("quote-rdv-")).length },
    ],
    messages: [
      { label: "Conversations", value: threads.length },
      { label: "Non lus", value: unreadMessages },
      { label: "Messages", value: messages.length },
    ],
    appointments: [
      { label: "Rendez-vous", value: reservations.length },
      { label: "À venir", value: upcomingAppointments.length },
      { label: "Confirmés", value: Object.values(appointmentStatusesById).filter((status) => status === "Confirmé").length },
    ],
    clients: [
      { label: "Clients", value: adminClients.length },
      { label: "Avec devis", value: adminClients.filter((client) => client.quotes.length > 0).length },
      { label: "Notes privées", value: Object.values(clientNotes).filter(Boolean).length },
    ],
    portfolio: [
      { label: "Réalisations", value: portfolio.length },
      { label: "Mises en avant", value: portfolio.filter((item) => item.featured).length },
      { label: "J'aime tattoos", value: contentStats.filter((item) => item.itemKind === "tattoo").reduce((total, item) => total + item.likes, 0) },
    ],
    flashs: [
      { label: "Flashs", value: flashs.length },
      { label: "Disponibles", value: flashs.filter((item) => (item.availability || "Disponible") === "Disponible").length },
      { label: "Réservés", value: flashs.filter((item) => item.availability === "Réservé").length },
      { label: "Vendus", value: flashs.filter((item) => item.availability === "Vendu").length },
    ],
    settings: [
      { label: "Données client", value: accounts.length + quotes.length + threads.length + reservations.length },
      { label: "Contenus", value: portfolio.length + flashs.length },
      { label: "Événements", value: analytics.events.length },
    ],
  };

  const setQuoteStatus = (quote: ClientQuote, status: AdminQuoteStatus) => {
    const nextStatuses = { ...quoteStatusesById, [quote.id]: status };
    setQuoteStatusesById(nextStatuses);
    writeRecord(adminQuoteStatusStorageKey, nextStatuses);

    const mappedStatus =
      status === "Répondu"
        ? "Réponse envoyée"
        : status === "Rendez-vous fixé"
          ? "Réservé"
          : status === "Refusé"
            ? "Refusé"
            : status === "Annulé"
              ? "Annulé"
              : quote.status;
    const nextQuotes = quotes.map((item) => (item.id === quote.id ? { ...item, status: mappedStatus } : item));
    setQuotes(nextQuotes);
    writeClientQuotes(nextQuotes);
  };

  const startQuoteReply = (quote: ClientQuote) => {
    const existingThread = findExistingQuoteThread(quote, threads, messages);
    const now = new Date();
    const time = formatMessageTime(now);
    const threadId = existingThread?.id ?? getQuoteThreadId(quote);
    const sentAt = quote.sentAt ? new Date(quote.sentAt) : null;
    const messageTime = sentAt && !Number.isNaN(sentAt.getTime()) ? formatMessageTime(sentAt) : time;
    const nextThread: MessagerieThread = existingThread ?? {
      id: threadId,
      name: getQuoteClientName(quote),
      project: getQuoteThreadProject(quote),
      lastMessage: "Demande de devis reçue depuis le formulaire.",
      time,
      status: "Devis à traiter",
      source: "devis",
      unread: 0,
    };
    const firstMessageExists = messages.some((message) => message.threadId === threadId);
    const quoteMessage: MessagerieMessage = {
      id: `${threadId}-devis`,
      threadId,
      author: "client",
      text: buildQuoteThreadMessage(quote),
      time: messageTime,
      state: "sent",
    };
    const nextThreads = existingThread
      ? threads.map((thread) => (thread.id === threadId ? { ...thread, unread: 0 } : thread))
      : [nextThread, ...threads];
    const nextMessages = firstMessageExists ? messages : [quoteMessage, ...messages];

    setThreads(nextThreads);
    setMessages(nextMessages);
    setSelectedThreadId(threadId);
    setReplyAttachments([]);
    setActiveTab("messages");
    writeStoredMessagerie({ threads: nextThreads, messages: nextMessages, activeThreadId: threadId });
    setQuoteStatus(quote, "En cours");
  };

  const convertQuoteToAppointment = (quote: ClientQuote) => {
    const reservation: ClientReservation = {
      id: `quote-rdv-${quote.id}`,
      title: `${getQuoteClientName(quote)} - ${quote.type || "Tatouage"}`,
      status: "upcoming",
      date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(),
      note: getQuoteDescription(quote),
      flashId: quote.flashId || quote.flashIds?.[0],
    };
    const nextReservations = [reservation, ...reservations.filter((item) => item.id !== reservation.id)];

    setReservations(nextReservations);
    writeClientReservations(nextReservations);
    setQuoteStatus(quote, "Rendez-vous fixé");
  };

  const archiveQuote = (quote: ClientQuote) => {
    setQuoteStatus(quote, "Archivé");
  };

  const replyToThread = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const text = reply.trim();
    if (!selectedThread || (!text && !replyAttachments.length)) return;

    const time = new Intl.DateTimeFormat("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date());
    const lastMessage = text || (replyAttachments.length > 1 ? `${replyAttachments.length} photos ajoutées` : "Photo ajoutée");
    const quoteProposal = parseQuoteProposal(text);
    const message: MessagerieMessage = {
      id: `${selectedThread.id}-studio-${Date.now()}`,
      threadId: selectedThread.id,
      author: "studio",
      attachments: replyAttachments.length ? replyAttachments : undefined,
      text,
      time,
      state: "sent",
    };
    const nextMessages = [...messages, message];
    const nextThreads = threads.map((thread) =>
      thread.id === selectedThread.id
        ? { ...thread, lastMessage, time, status: quoteProposal ? "Devis proposé" : "Réponse envoyée", unread: 0 }
        : thread,
    );

    setMessages(nextMessages);
    setThreads(nextThreads);
    setReply("");
    setReplyAttachments([]);
    writeStoredMessagerie({ threads: nextThreads, messages: nextMessages, activeThreadId: selectedThread.id });

    const relatedQuote = quotes.find((quote) => findExistingQuoteThread(quote, nextThreads, nextMessages)?.id === selectedThread.id);
    if (relatedQuote) {
      setQuoteStatus(relatedQuote, "Répondu");
    }
  };

  const addImagesToThread = async (files: FileList | null) => {
    if (!selectedThread || !files?.length) return;

    const attachments = await readImageAttachments(files);
    if (!attachments.length) return;

    setReplyAttachments((current) => [...current, ...attachments]);
  };

  const markThreadAsRead = (thread: MessagerieThread) => {
    const nextThreads = threads.map((item) => (item.id === thread.id ? { ...item, unread: 0 } : item));
    const nextMessages = messages.map((message) =>
      message.threadId === thread.id && message.author === "client"
        ? { ...message, state: "read" as const }
        : message,
    );

    setThreads(nextThreads);
    setMessages(nextMessages);
    writeStoredMessagerie({ threads: nextThreads, messages: nextMessages, activeThreadId: thread.id });
  };

  const archiveThread = (thread: MessagerieThread) => {
    const nextThreads = threads.map((item) => (item.id === thread.id ? { ...item, status: "Archivée", unread: 0 } : item));

    setThreads(nextThreads);
    writeStoredMessagerie({ threads: nextThreads, messages, activeThreadId: thread.id });
  };

  const setAppointmentStatus = (reservation: ClientReservation, status: AdminAppointmentStatus) => {
    const nextStatuses = { ...appointmentStatusesById, [reservation.id]: status };
    setAppointmentStatusesById(nextStatuses);
    writeRecord(adminAppointmentStatusStorageKey, nextStatuses);
  };

  const saveClientNote = (email: string, note: string) => {
    const nextNotes = { ...clientNotes, [email]: note };

    setClientNotes(nextNotes);
    writeRecord(adminClientNotesStorageKey, nextNotes);
  };

  const addPortfolioItem = (draft: PortfolioEditDraft) => {
    if (!draft.title.trim()) return;

    const item = makeAdminPortfolioFromDraft(draft);
    const nextPortfolio = [item, ...portfolio];

    setPortfolio(nextPortfolio);
    writeArray(adminPortfolioStorageKey, nextPortfolio);
    setNewPortfolioTitle("");
  };

  const removePortfolioItem = (item: ManagedPortfolioItem) => {
    const nextPortfolio = portfolio.filter((portfolioItem) => portfolioItem.id !== item.id);

    setPortfolio(nextPortfolio);
    writeArray(adminPortfolioStorageKey, nextPortfolio);
  };

  const updatePortfolioItem = (item: ManagedPortfolioItem, draft: PortfolioEditDraft) => {
    const nextPortfolio = portfolio.map((portfolioItem) =>
      portfolioItem.id === item.id ? applyPortfolioEditDraft(portfolioItem, draft) : portfolioItem,
    );

    setPortfolio(nextPortfolio);
    writeArray(adminPortfolioStorageKey, nextPortfolio);
  };

  const addFlashItem = (draft: FlashEditDraft) => {
    if (!draft.title.trim()) return;

    const item = makeAdminFlashFromDraft(draft);
    const nextFlashs = [item, ...flashs];

    setFlashs(nextFlashs);
    writeArray(adminFlashStorageKey, nextFlashs);
    setNewFlashTitle("");
  };

  const updateFlashAvailability = (item: ManagedFlashItem, availability: ManagedFlashItem["availability"]) => {
    const nextFlashs = flashs.map((flash) => (flash.id === item.id ? { ...flash, availability } : flash));

    setFlashs(nextFlashs);
    writeArray(adminFlashStorageKey, nextFlashs);
  };

  const updateFlashItem = (item: ManagedFlashItem, draft: FlashEditDraft) => {
    const nextFlashs = flashs.map((flash) =>
      flash.id === item.id ? applyFlashEditDraft(flash, draft) : flash,
    );

    setFlashs(nextFlashs);
    writeArray(adminFlashStorageKey, nextFlashs);
  };

  const removeFlashItem = (item: ManagedFlashItem) => {
    const nextFlashs = flashs.filter((flash) => flash.id !== item.id);

    setFlashs(nextFlashs);
    writeArray(adminFlashStorageKey, nextFlashs);
  };

  const logout = async () => {
    await logoutEverywhere();
  };

  return (
    <main className={styles.adminShell}>
      <aside className={styles.sidebar} aria-label="Navigation administrateur">
        <div className={styles.brand}>
          <span>
            <Leaf strokeWidth={1.8} aria-hidden="true" />
          </span>
          <div>
            <p>B.Grumpy Tattoo</p>
            <strong>Atelier admin</strong>
          </div>
        </div>

        <nav className={styles.nav}>
          {navigation.map((item) => {
            const Icon = item.icon;

            return (
              <button
                className={activeTab === item.id ? styles.navActive : ""}
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
              >
                <Icon strokeWidth={1.7} aria-hidden="true" />
                <span>{item.label}</span>
                {item.id === "quotes" && quotes.length > 0 && <small>{quotes.length}</small>}
                {item.id === "messages" && unreadMessages > 0 && <small>{unreadMessages}</small>}
              </button>
            );
          })}
        </nav>

        <button className={styles.logoutButton} type="button" onClick={logout}>
          <LogOut strokeWidth={1.7} aria-hidden="true" />
          Déconnexion
        </button>
      </aside>

      <section className={styles.workspace}>
        {activeTab !== "dashboard" && (
          <ClientMirrorPanel activeTab={activeTab} metrics={mirrorMetrics[activeTab]} />
        )}

        {activeTab === "dashboard" && (
          <DashboardSection
            accounts={accounts}
            analytics={analytics}
            maxPathVisits={maxPathVisits}
            newClients={newClients.length}
            recentEvents={recentEvents}
            reservations={upcomingAppointments}
            setActiveTab={setActiveTab}
            threads={threads}
            topPaths={topPaths}
            totalLikes={totalLikes}
            totalViews={totalViews}
            unreadMessages={unreadMessages}
            visitSeries={visitSeries}
            visibleQuotes={visibleQuotes}
          />
        )}

        {activeTab === "quotes" && (
          <QuotesSection
            archiveQuote={archiveQuote}
            convertQuoteToAppointment={convertQuoteToAppointment}
            startQuoteReply={startQuoteReply}
            quoteStatusesById={quoteStatusesById}
            quotes={visibleQuotes}
            selectedQuote={selectedQuote}
            setSelectedQuoteId={setSelectedQuoteId}
          />
        )}

        {activeTab === "messages" && (
          <MessagesSection
            archiveThread={archiveThread}
            archiveQuote={archiveQuote}
            convertQuoteToAppointment={convertQuoteToAppointment}
            addImagesToThread={addImagesToThread}
            markThreadAsRead={markThreadAsRead}
            messages={selectedThreadMessages}
            reply={reply}
            replyAttachments={replyAttachments}
            replyToThread={replyToThread}
            selectedThread={selectedThread}
            selectedThreadQuote={selectedThreadQuote}
            selectedThreadQuoteStatus={selectedThreadQuote ? getQuoteStatus(selectedThreadQuote, quoteStatusesById) : "Nouveau"}
            setReply={setReply}
            setReplyAttachments={setReplyAttachments}
            setSelectedThreadId={setSelectedThreadId}
            startQuoteReply={startQuoteReply}
            threads={visibleThreads}
          />
        )}

        {activeTab === "appointments" && (
          <AppointmentsSection
            appointmentStatusesById={appointmentStatusesById}
            reservations={reservations}
            setAppointmentStatus={setAppointmentStatus}
          />
        )}

        {activeTab === "clients" && (
          <ClientsSection
            clientNotes={clientNotes}
            saveClientNote={saveClientNote}
            selectedClient={selectedClient}
            setSelectedClientEmail={setSelectedClientEmail}
            visibleClients={visibleClients}
          />
        )}

        {activeTab === "portfolio" && (
          <PortfolioSection
            addPortfolioItem={addPortfolioItem}
            newPortfolioTitle={newPortfolioTitle}
            portfolio={portfolio}
            removePortfolioItem={removePortfolioItem}
            setNewPortfolioTitle={setNewPortfolioTitle}
            updatePortfolioItem={updatePortfolioItem}
          />
        )}

        {activeTab === "flashs" && (
          <FlashsSection
            addFlashItem={addFlashItem}
            flashs={flashs}
            newFlashTitle={newFlashTitle}
            removeFlashItem={removeFlashItem}
            setNewFlashTitle={setNewFlashTitle}
            updateFlashAvailability={updateFlashAvailability}
            updateFlashItem={updateFlashItem}
          />
        )}

        {activeTab === "settings" && (
          <SettingsSection
            accounts={accounts}
            analytics={analytics}
            flashs={flashs}
            messages={messages}
            portfolio={portfolio}
            quotes={quotes}
            reservations={reservations}
            threads={threads}
          />
        )}
      </section>
    </main>
  );
}

function ClientMirrorPanel({
  activeTab,
  metrics,
}: {
  activeTab: AdminTab;
  metrics: Array<{ label: string; value: number }>;
}) {
  const mirror = clientMirrors[activeTab];
  const heroCopy: Record<AdminTab, { intro: string[]; title: string[] }> = {
    dashboard: {
      intro: [
        "Vue studio de l'activité globale.",
        "Suis les visites, les contenus vus et les actions importantes.",
      ],
      title: ["Tableau", "de bord"],
    },
    quotes: {
      intro: [
        "Boîte de réception des demandes client.",
        "Lis, trie, réponds et transforme les devis en rendez-vous.",
      ],
      title: ["Devis", "admin"],
    },
    messages: {
      intro: [
        "Messagerie studio connectée aux clientes.",
        "Réponds, archive et garde les conversations au même endroit.",
      ],
      title: ["Messages", "admin"],
    },
    appointments: {
      intro: [
        "Planning studio des réservations.",
        "Confirme, déplace et suis les rendez-vous depuis l'espace admin.",
      ],
      title: ["Rendez-vous", "admin"],
    },
    clients: {
      intro: [
        "Fiches client et historique studio.",
        "Retrouve les profils, les devis, les messages et les notes privées.",
      ],
      title: ["Clients", "admin"],
    },
    flashs: {
      intro: [
        "Version studio de la galerie client.",
        "Ajoute, modifie, réserve et vends les flashs visibles dans l'application.",
      ],
      title: ["Flashs", "admin"],
    },
    portfolio: {
      intro: [
        "Version studio de la galerie tatouages.",
        "Ajoute, modifie, publie et archive les réalisations visibles dans l'application.",
      ],
      title: ["Portfolio", "admin"],
    },
    settings: {
      intro: [
        "Centre de réglages du site.",
        "Gère les informations studio, l'identité et la configuration.",
      ],
      title: ["Paramètres", "admin"],
    },
  };
  const hero = heroCopy[activeTab];

  return (
    <section className={styles.flashAdminHero}>
      <img src={mirror.image} alt="" aria-hidden="true" />
      <div className={styles.flashAdminHeroOverlay} aria-hidden="true" />
      <div className={styles.flashAdminHeroVeil} aria-hidden="true" />

      <div className={styles.flashAdminHeroContent}>
        <div>
          <p className={styles.flashAdminBrand}>B.Grumpy</p>
          <p className={styles.flashAdminBrandSub}>Tatouage</p>
        </div>

        <div className={styles.flashAdminHeroCopy}>
          <h2>
            {hero.title.map((line) => (
              <span key={line}>{line}</span>
            ))}
          </h2>
          <p>
            {hero.intro.map((line) => (
              <span key={line}>{line}</span>
            ))}
          </p>
        </div>

        <div className={styles.flashAdminHeroBadges}>
          {metrics.map((metric) => (
            <span key={metric.label}>
              <strong>{metric.value}</strong>
              {metric.label}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

function DashboardSection({
  accounts,
  analytics,
  maxPathVisits,
  newClients,
  recentEvents,
  reservations,
  setActiveTab,
  threads,
  topPaths,
  totalLikes,
  totalViews,
  unreadMessages,
  visitSeries,
  visibleQuotes,
}: {
  accounts: ClientAccount[];
  analytics: StoredAdminAnalytics;
  maxPathVisits: number;
  newClients: number;
  recentEvents: AnalyticsEvent[];
  reservations: ClientReservation[];
  setActiveTab: (tab: AdminTab) => void;
  threads: MessagerieThread[];
  topPaths: [string, number][];
  totalLikes: number;
  totalViews: number;
  unreadMessages: number;
  visitSeries: VisitDayStat[];
  visibleQuotes: ClientQuote[];
}) {
  const revenue = visibleQuotes.reduce((total, quote) => total + (quote.budget ?? quote.form?.budget ?? 0), 0);
  const recentQuotes = visibleQuotes.slice(0, 5);
  const pendingQuotes = visibleQuotes.filter((quote) => quote.status === "En attente");
  const urgentMessages = threads.filter((thread) => (thread.unread ?? 0) > 0).slice(0, 4);
  const upcoming = reservations.slice(0, 5);
  const taskItems = [
    {
      icon: FileText,
      label: `${pendingQuotes.length} devis à traiter`,
      helper: "Répondre rapidement",
      tab: "quotes" as AdminTab,
    },
    {
      icon: MessageCircle,
      label: `${unreadMessages} messages non lus`,
      helper: "Clients en attente",
      tab: "messages" as AdminTab,
    },
    {
      icon: CalendarCheck,
      label: `${reservations.length} rendez-vous à confirmer`,
      helper: "Vérifier les détails",
      tab: "appointments" as AdminTab,
    },
    {
      icon: Euro,
      label: `${revenue > 0 ? "1" : "0"} acompte en attente`,
      helper: "Relance nécessaire",
      tab: "appointments" as AdminTab,
    },
  ];

  return (
    <div className={styles.studioHome}>
      <section className={styles.studioHero}>
        <img src="/44745E65-2925-4E28-B97C-8492E35BC5B6.png" alt="" aria-hidden="true" />
        <div>
          <p className={styles.kicker}>Atelier B.Grumpy</p>
          <h2>Bonjour, voici le centre de contrôle du studio.</h2>
          <span>
            Les demandes client, messages, rendez-vous et contenus importants sont regroupés ici.
          </span>
        </div>
        <div className={styles.studioHeroStats}>
          <strong>{visibleQuotes.length}</strong>
          <span>devis reçus</span>
          <strong>{unreadMessages}</strong>
          <span>messages à lire</span>
          <strong>{reservations.length}</strong>
          <span>rendez-vous</span>
        </div>
      </section>

      <section className={styles.studioPriority}>
        <div className={styles.studioSectionTitle}>
          <p className={styles.kicker}>À faire maintenant</p>
          <h3>Priorités du jour</h3>
        </div>
        <div className={styles.studioTaskGrid}>
          {taskItems.map((task) => {
            const Icon = task.icon;

            return (
              <button key={task.label} type="button" onClick={() => setActiveTab(task.tab)}>
                <Icon strokeWidth={1.7} aria-hidden="true" />
                <span>
                  <strong>{task.label}</strong>
                  {task.helper}
                </span>
                <ChevronRight strokeWidth={1.7} aria-hidden="true" />
              </button>
            );
          })}
        </div>
      </section>

      <section className={styles.studioGrid}>
        <article className={styles.studioPanel}>
          <div className={styles.studioPanelHeader}>
            <div>
              <p className={styles.kicker}>Demandes client</p>
              <h3>Devis récents</h3>
            </div>
            <button type="button" onClick={() => setActiveTab("quotes")}>Tout voir</button>
          </div>
          <QuoteMiniList quotes={recentQuotes} />
        </article>

        <article className={styles.studioPanel}>
          <div className={styles.studioPanelHeader}>
            <div>
              <p className={styles.kicker}>Messagerie</p>
              <h3>Messages à reprendre</h3>
            </div>
            <button type="button" onClick={() => setActiveTab("messages")}>Ouvrir</button>
          </div>
          <ThreadMiniList threads={urgentMessages.length ? urgentMessages : threads.slice(0, 4)} />
        </article>

        <article className={styles.studioPanel}>
          <div className={styles.studioPanelHeader}>
            <div>
              <p className={styles.kicker}>Agenda</p>
              <h3>Prochains rendez-vous</h3>
            </div>
            <button type="button" onClick={() => setActiveTab("appointments")}>Calendrier</button>
          </div>
          <ReservationMiniList reservations={upcoming} />
        </article>

        <article className={styles.studioPanel}>
          <div className={styles.studioPanelHeader}>
            <div>
              <p className={styles.kicker}>Activité</p>
              <h3>Ce que les clients font</h3>
            </div>
          </div>
          <div className={styles.studioActivitySummary}>
            <div>
              <Eye strokeWidth={1.7} aria-hidden="true" />
              <strong>{analytics.totalVisits}</strong>
              <span>visites</span>
            </div>
            <div>
              <Heart strokeWidth={1.7} aria-hidden="true" />
              <strong>{totalLikes}</strong>
              <span>j&apos;aime</span>
            </div>
            <div>
              <Images strokeWidth={1.7} aria-hidden="true" />
              <strong>{totalViews}</strong>
              <span>vues photos</span>
            </div>
            <div>
              <Euro strokeWidth={1.7} aria-hidden="true" />
              <strong>{revenue.toLocaleString("fr-FR")} €</strong>
              <span>budgets devis</span>
            </div>
          </div>
          <VisitDateChart series={visitSeries} />
          <PathList maxPathVisits={maxPathVisits} topPaths={topPaths} />
        </article>
      </section>

      <section className={styles.studioShortcuts}>
        <button type="button" onClick={() => setActiveTab("flashs")}>
          <Zap strokeWidth={1.7} aria-hidden="true" />
          Nouveau flash
        </button>
        <button type="button" onClick={() => setActiveTab("portfolio")}>
          <ImagePlus strokeWidth={1.7} aria-hidden="true" />
          Ajouter une réalisation
        </button>
        <button type="button" onClick={() => setActiveTab("quotes")}>
          <Send strokeWidth={1.7} aria-hidden="true" />
          Répondre aux devis
        </button>
      </section>
    </div>
  );
}

function QuotesSection({
  archiveQuote,
  convertQuoteToAppointment,
  startQuoteReply,
  quoteStatusesById,
  quotes,
  selectedQuote,
  setSelectedQuoteId,
}: {
  archiveQuote: (quote: ClientQuote) => void;
  convertQuoteToAppointment: (quote: ClientQuote) => void;
  startQuoteReply: (quote: ClientQuote) => void;
  quoteStatusesById: Record<string, AdminQuoteStatus>;
  quotes: ClientQuote[];
  selectedQuote?: ClientQuote;
  setSelectedQuoteId: (id: string) => void;
}) {
  const columns = [
    { id: "new", label: "Nouveau", tone: "sage", quotes: quotes.filter((quote) => getQuoteStatus(quote, quoteStatusesById) === "Nouveau") },
    { id: "todo", label: "À traiter", tone: "amber", quotes: quotes.filter((quote) => getQuoteStatus(quote, quoteStatusesById) === "En cours") },
    { id: "waiting", label: "En attente client", tone: "blue", quotes: quotes.filter((quote) => getQuoteStatus(quote, quoteStatusesById) === "Répondu") },
    { id: "proposed", label: "Rendez-vous proposé", tone: "purple", quotes: quotes.filter((quote) => getQuoteStatus(quote, quoteStatusesById) === "Rendez-vous fixé") },
    { id: "accepted", label: "Accepté", tone: "green", quotes: quotes.filter((quote) => quote.status === "Accepté") },
    { id: "refused", label: "Refusé", tone: "red", quotes: quotes.filter((quote) => getQuoteStatus(quote, quoteStatusesById) === "Refusé") },
    { id: "cancelled", label: "Annulé", tone: "red", quotes: quotes.filter((quote) => getQuoteStatus(quote, quoteStatusesById) === "Annulé") },
    { id: "archived", label: "Archivé", tone: "neutral", quotes: quotes.filter((quote) => getQuoteStatus(quote, quoteStatusesById) === "Archivé") },
  ];
  const activeQuote = selectedQuote ?? quotes[0];
  const activeQuoteStatus = activeQuote ? getQuoteStatus(activeQuote, quoteStatusesById) : "Nouveau";
  const [openedQuoteId, setOpenedQuoteId] = useState("");
  const openedQuote = quotes.find((quote) => quote.id === openedQuoteId);
  const openQuote = (quote: ClientQuote) => {
    setSelectedQuoteId(quote.id);
    setOpenedQuoteId(quote.id);
  };

  return (
    <section className={styles.devisBoard}>
      <header className={styles.devisHeader}>
        <div>
          <h2>Devis</h2>
          <p>Gérez toutes les demandes de devis reçues</p>
        </div>
        <div className={styles.devisToolbar}>
          <label>
            <Search strokeWidth={1.7} aria-hidden="true" />
            <input value="" readOnly placeholder="Rechercher un client, un projet, un mot clé..." />
          </label>
          <button type="button"><SlidersHorizontal strokeWidth={1.7} aria-hidden="true" />Filtrer</button>
          <button type="button"><ArrowUpDown strokeWidth={1.7} aria-hidden="true" />Trier</button>
          <button className={styles.devisPrimaryAction} type="button"><Plus strokeWidth={1.7} aria-hidden="true" />Nouvelle action</button>
        </div>
      </header>

      <section className={styles.devisKanban} aria-label="Demandes par statut">
        {columns.map((column) => (
          <article className={`${styles.devisColumn} ${styles[`devisColumn-${column.tone}`]}`} key={column.id}>
            <header>
              <strong>{column.label}</strong>
              <span>{column.quotes.length}</span>
            </header>
            {column.quotes.length ? (
              column.quotes.slice(0, 3).map((quote) => (
                <button
                  className={`${styles.devisCard} ${activeQuote?.id === quote.id ? styles.devisCardActive : ""}`}
                  key={quote.id}
                  type="button"
                  onClick={() => openQuote(quote)}
                >
                  <div className={styles.devisCardTop}>
                    <strong>{getQuoteClientName(quote)}</strong>
                    <span>{formatDateTime(quote.sentAt)}</span>
                  </div>
                  <div className={styles.devisCardImage}>
                    <img src={getQuoteImage(quote)} alt="" />
                    {quote.references?.length ? <small>+{quote.references.length}</small> : null}
                  </div>
                  <dl>
                    <div><MapPin strokeWidth={1.7} aria-hidden="true" /><dt>Emplacement</dt><dd>{getQuotePlacement(quote)}</dd></div>
                    <div><Ruler strokeWidth={1.7} aria-hidden="true" /><dt>Taille</dt><dd>{getQuoteSize(quote)}</dd></div>
                    <div><Palette strokeWidth={1.7} aria-hidden="true" /><dt>Style</dt><dd>{getQuoteStyle(quote)}</dd></div>
                    <div><Euro strokeWidth={1.7} aria-hidden="true" /><dt>Budget</dt><dd>{getQuoteBudget(quote)}</dd></div>
                  </dl>
                  <span className={styles.devisOpen}>Ouvrir</span>
                </button>
              ))
            ) : (
              <p className={styles.devisEmptyColumn}>Aucun devis</p>
            )}
          </article>
        ))}
      </section>

      <section className={styles.devisMainGrid}>
        <article className={styles.devisTablePanel}>
          <header>
            <h3>Toutes les demandes</h3>
            <span>{quotes.length}</span>
          </header>
          <div className={styles.devisTable}>
            <div className={styles.devisTableHead}>
              <span>Client</span>
              <span>Projet</span>
              <span>Emplacement</span>
              <span>Taille</span>
              <span>Budget</span>
              <span>Statut</span>
              <span>Reçu le</span>
            </div>
            {quotes.map((quote) => (
              <button
                className={`${styles.devisTableRow} ${activeQuote?.id === quote.id ? styles.devisTableRowActive : ""}`}
                key={quote.id}
                type="button"
                onClick={() => openQuote(quote)}
              >
                <span><img src={getQuoteImage(quote)} alt="" />{getQuoteClientName(quote)}</span>
                <span>{getQuoteProject(quote)}</span>
                <span>{getQuotePlacement(quote)}</span>
                <span>{getQuoteSize(quote)}</span>
                <span>{getQuoteBudget(quote)}</span>
                <span><i>{getQuoteStatus(quote, quoteStatusesById)}</i></span>
                <span>{formatDateTime(quote.sentAt)}</span>
              </button>
            ))}
          </div>
        </article>

        <article className={styles.devisDetailPanel}>
          {activeQuote ? (
            <QuoteDetailContent
              activeQuote={activeQuote}
              activeQuoteStatus={activeQuoteStatus}
              archiveQuote={archiveQuote}
              convertQuoteToAppointment={convertQuoteToAppointment}
              startQuoteReply={startQuoteReply}
            />
          ) : (
            <EmptyState text="Aucune demande de devis reçue pour le moment." />
          )}
        </article>
      </section>

      {openedQuote ? (
        <div
          className={styles.devisModalBackdrop}
          role="dialog"
          aria-modal="true"
          aria-label={`Devis de ${getQuoteClientName(openedQuote)}`}
          onClick={() => setOpenedQuoteId("")}
        >
          <article className={styles.devisModal} onClick={(event) => event.stopPropagation()}>
            <button
              className={styles.devisModalClose}
              type="button"
              aria-label="Fermer le devis"
              onClick={() => setOpenedQuoteId("")}
            >
              <X strokeWidth={1.8} aria-hidden="true" />
            </button>
            <QuoteDetailContent
              activeQuote={openedQuote}
              activeQuoteStatus={getQuoteStatus(openedQuote, quoteStatusesById)}
              archiveQuote={archiveQuote}
              convertQuoteToAppointment={convertQuoteToAppointment}
              startQuoteReply={startQuoteReply}
            />
          </article>
        </div>
      ) : null}
    </section>
  );
}

function QuoteDetailContent({
  activeQuote,
  activeQuoteStatus,
  archiveQuote,
  convertQuoteToAppointment,
  startQuoteReply,
}: {
  activeQuote: ClientQuote;
  activeQuoteStatus: AdminQuoteStatus;
  archiveQuote: (quote: ClientQuote) => void;
  convertQuoteToAppointment: (quote: ClientQuote) => void;
  startQuoteReply: (quote: ClientQuote) => void;
}) {
  const selectedFlashIds = activeQuote.flashIds?.length
    ? activeQuote.flashIds
    : activeQuote.flashId
      ? [activeQuote.flashId]
      : [];
  const selectedFlashes = flashItems.filter((item) => selectedFlashIds.includes(item.id));

  return (
    <>
      <header className={styles.devisDetailHeader}>
        <img src={getQuoteImage(activeQuote)} alt="" />
        <div>
          <h3>{getQuoteClientName(activeQuote)}</h3>
          <p>Demande reçue le {formatDateTime(activeQuote.sentAt)}</p>
        </div>
        <span>{activeQuoteStatus}</span>
        <div>
          <button type="button" onClick={() => startQuoteReply(activeQuote)}>
            <MessageSquareText strokeWidth={1.7} aria-hidden="true" />Répondre
          </button>
          <button type="button" onClick={() => convertQuoteToAppointment(activeQuote)}>
            <CalendarDays strokeWidth={1.7} aria-hidden="true" />Proposer RDV
          </button>
          <button type="button"><MoreHorizontal strokeWidth={1.7} aria-hidden="true" /></button>
        </div>
      </header>

      <nav className={styles.devisDetailTabs} aria-label="Détail du devis">
        <span>Détails</span>
        <span>Photos ({(activeQuote.references?.length ?? 0) + selectedFlashes.length})</span>
        <span>Historique</span>
        <span>Notes</span>
      </nav>

      <div className={styles.devisDetailBody}>
        <div className={styles.devisPhotoStack}>
          <img src={getQuoteImage(activeQuote)} alt="" />
          <div>
            {selectedFlashes.map((flash) => (
              <img src={flash.image.src} alt={flash.image.alt} key={flash.id} />
            ))}
            {(activeQuote.references ?? []).slice(0, 2).map((reference) => (
              reference.url
                ? <img src={reference.url} alt={reference.name} key={reference.id} />
                : <span key={reference.id}><Images strokeWidth={1.7} aria-hidden="true" />{reference.name}</span>
            ))}
          </div>
        </div>

        <div className={styles.devisFacts}>
          <p><MapPin strokeWidth={1.7} aria-hidden="true" /><span>Emplacement</span><strong>{getQuotePlacement(activeQuote)}</strong></p>
          <p><Ruler strokeWidth={1.7} aria-hidden="true" /><span>Taille</span><strong>{getQuoteSize(activeQuote)}</strong></p>
          <p><Palette strokeWidth={1.7} aria-hidden="true" /><span>Style</span><strong>{getQuoteStyle(activeQuote)}</strong></p>
          <p><Euro strokeWidth={1.7} aria-hidden="true" /><span>Budget</span><strong>{getQuoteBudget(activeQuote)}</strong></p>
          <p><FileText strokeWidth={1.7} aria-hidden="true" /><span>Description</span><strong>{getQuoteDescription(activeQuote)}</strong></p>
          <p><Phone strokeWidth={1.7} aria-hidden="true" /><span>Téléphone</span><strong>{getQuotePhone(activeQuote)}</strong></p>
          <p><Mail strokeWidth={1.7} aria-hidden="true" /><span>Email</span><strong>{getQuoteEmail(activeQuote)}</strong></p>
        </div>

        <aside className={styles.devisActivity}>
          <h4>Activité récente</h4>
          <p><span />Demande reçue<br /><small>{formatDateTime(activeQuote.sentAt)}</small></p>
          <p><span />Photo ajoutée<br /><small>{formatDateTime(activeQuote.sentAt)}</small></p>
          <p><span />Message automatique envoyé<br /><small>{formatDateTime(activeQuote.sentAt)}</small></p>
        </aside>
      </div>

      <button className={styles.devisArchiveButton} type="button" onClick={() => archiveQuote(activeQuote)}>
        <Trash2 strokeWidth={1.7} aria-hidden="true" />
        Archiver le devis
      </button>
    </>
  );
}

function MessagesSection({
  addImagesToThread,
  archiveThread,
  archiveQuote,
  convertQuoteToAppointment,
  markThreadAsRead,
  messages,
  reply,
  replyAttachments,
  replyToThread,
  selectedThread,
  selectedThreadQuote,
  selectedThreadQuoteStatus,
  setReply,
  setReplyAttachments,
  setSelectedThreadId,
  startQuoteReply,
  threads,
}: {
  addImagesToThread: (files: FileList | null) => Promise<void>;
  archiveThread: (thread: MessagerieThread) => void;
  archiveQuote: (quote: ClientQuote) => void;
  convertQuoteToAppointment: (quote: ClientQuote) => void;
  markThreadAsRead: (thread: MessagerieThread) => void;
  messages: MessagerieMessage[];
  reply: string;
  replyAttachments: MessagerieAttachment[];
  replyToThread: (event: FormEvent<HTMLFormElement>) => void;
  selectedThread?: MessagerieThread;
  selectedThreadQuote?: ClientQuote;
  selectedThreadQuoteStatus: AdminQuoteStatus;
  setReply: (value: string) => void;
  setReplyAttachments: (attachments: MessagerieAttachment[]) => void;
  setSelectedThreadId: (id: string) => void;
  startQuoteReply: (quote: ClientQuote) => void;
  threads: MessagerieThread[];
}) {
  const visibleMessages = selectedThreadQuote
    ? messages.filter((message) => !isQuoteThreadSummaryMessage(message))
    : messages;
  const imageInputRef = useRef<HTMLInputElement>(null);

  return (
    <section className={styles.messagingLayout}>
      <aside className={styles.conversationList}>
        <PanelTitle icon={Inbox} kicker="Conversations" title="Messages clients" />
        <div className={styles.cardList}>
          {threads.length ? (
            threads.map((thread) => (
              <button
                className={`${styles.listCard} ${selectedThread?.id === thread.id ? styles.listCardActive : ""}`}
                key={thread.id}
                type="button"
                onClick={() => {
                  setReplyAttachments([]);
                  setSelectedThreadId(thread.id);
                }}
              >
                <span className={styles.statusPill}>{thread.unread ? `${thread.unread} non lu` : thread.status}</span>
                <strong>{thread.name}</strong>
                <small>{thread.project}</small>
                <p>{thread.lastMessage}</p>
              </button>
            ))
          ) : (
            <EmptyState text="Aucune conversation reçue." />
          )}
        </div>
      </aside>

      <article className={styles.conversationPane}>
        {selectedThread ? (
          <>
            <div className={styles.conversationHeader}>
              <div>
                <p className={styles.kicker}>Conversation</p>
                <h2>{selectedThread.name}</h2>
                <span>{selectedThread.project}</span>
              </div>
              <div className={styles.actionRowCompact}>
                <button type="button" onClick={() => markThreadAsRead(selectedThread)}>
                  <Check strokeWidth={1.7} aria-hidden="true" />
                  Lu
                </button>
                <button type="button" onClick={() => archiveThread(selectedThread)}>
                  <Archive strokeWidth={1.7} aria-hidden="true" />
                  Archiver
                </button>
              </div>
            </div>

            <div className={styles.messageStream}>
              {selectedThreadQuote ? (
                <article className={styles.conversationQuoteCard}>
                  <QuoteDetailContent
                    activeQuote={selectedThreadQuote}
                    activeQuoteStatus={selectedThreadQuoteStatus}
                    archiveQuote={archiveQuote}
                    convertQuoteToAppointment={convertQuoteToAppointment}
                    startQuoteReply={startQuoteReply}
                  />
                </article>
              ) : null}

              {visibleMessages.map((message) => (
                <div
                  className={`${styles.messageBubble} ${message.author === "studio" ? styles.messageBubbleStudio : ""}`}
                  key={message.id}
                >
                  <span>{message.author === "studio" ? "Studio" : "Client"}</span>
                  {message.attachments?.length ? (
                    <div className={styles.messageAttachments}>
                      {message.attachments.map((attachment) => (
                        <img src={attachment.url} alt={attachment.name} key={attachment.id} />
                      ))}
                    </div>
                  ) : null}
                  {message.text ? <p>{message.text}</p> : null}
                  <time>
                    {message.time}
                    {message.author === "studio" ? (
                      <CheckCheck
                        className={`${styles.readReceipt} ${message.state === "read" ? styles.readReceiptRead : ""}`}
                        strokeWidth={1.75}
                        aria-label={message.state === "read" ? "Lu par la cliente" : "Envoyé"}
                      />
                    ) : null}
                  </time>
                </div>
              ))}
            </div>

            <form className={styles.replyBox} onSubmit={replyToThread}>
              {replyAttachments.length ? (
                <div className={styles.pendingAttachments}>
                  {replyAttachments.map((attachment) => (
                    <span key={attachment.id}>
                      <img src={attachment.url} alt={attachment.name} />
                      <button
                        type="button"
                        aria-label={`Retirer ${attachment.name}`}
                        onClick={() => setReplyAttachments(replyAttachments.filter((item) => item.id !== attachment.id))}
                      >
                        <X strokeWidth={1.6} aria-hidden="true" />
                      </button>
                    </span>
                  ))}
                </div>
              ) : null}
              <textarea
                value={reply}
                onChange={(event) => setReply(event.target.value)}
                placeholder="Répondre au client"
              />
              <div>
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  hidden
                  onChange={(event) => {
                    void addImagesToThread(event.target.files);
                    event.target.value = "";
                  }}
                />
                <button type="button" onClick={() => imageInputRef.current?.click()}>
                  <ImagePlus strokeWidth={1.7} aria-hidden="true" />
                  Image
                </button>
                <button type="submit">
                  <Send strokeWidth={1.7} aria-hidden="true" />
                  Envoyer
                </button>
              </div>
            </form>
          </>
        ) : (
          <EmptyState text="Sélectionne une conversation." />
        )}
      </article>
    </section>
  );
}

function AppointmentsSection({
  appointmentStatusesById,
  reservations,
  setAppointmentStatus,
}: {
  appointmentStatusesById: Record<string, AdminAppointmentStatus>;
  reservations: ClientReservation[];
  setAppointmentStatus: (reservation: ClientReservation, status: AdminAppointmentStatus) => void;
}) {
  const monthDays = Array.from({ length: 30 }, (_, index) => index + 1);

  return (
    <div className={styles.sectionStack}>
      <section className={styles.kpiGrid}>
        <MetricCard icon={CalendarCheck} label="Rendez-vous" value={reservations.length} />
        <MetricCard icon={Clock} label="À confirmer" value={reservations.filter((item) => !appointmentStatusesById[item.id]).length} />
        <MetricCard icon={Heart} label="Acomptes suivis" value={reservations.filter((item) => item.flashId).length} />
        <MetricCard icon={Check} label="Confirmés" value={Object.values(appointmentStatusesById).filter((status) => status === "Confirmé").length} />
      </section>

      <section className={styles.appointmentGrid}>
        <article className={styles.panel}>
          <PanelTitle icon={CalendarDays} kicker="Liste" title="Rendez-vous créés" />
          <div className={styles.tableList}>
            {reservations.length ? (
              reservations.map((reservation) => (
                <div className={styles.tableRow} key={reservation.id}>
                  <div>
                    <strong>{reservation.title}</strong>
                    <span>{formatDateTime(reservation.date)} · durée à préciser · acompte à vérifier</span>
                  </div>
                  <select
                    value={appointmentStatusesById[reservation.id] || "À confirmer"}
                    onChange={(event) => setAppointmentStatus(reservation, event.target.value as AdminAppointmentStatus)}
                  >
                    {appointmentStatuses.map((status) => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                  <div className={styles.rowActions}>
                    <button type="button"><Pencil strokeWidth={1.7} aria-hidden="true" />Modifier</button>
                    <button type="button"><Clock strokeWidth={1.7} aria-hidden="true" />Déplacer</button>
                    <button type="button"><Trash2 strokeWidth={1.7} aria-hidden="true" />Annuler</button>
                  </div>
                </div>
              ))
            ) : (
              <EmptyState text="Aucun rendez-vous créé depuis un devis ou une réservation." />
            )}
          </div>
        </article>

        <article className={styles.panel}>
          <PanelTitle icon={CalendarDays} kicker="Calendrier" title="Vue mensuelle" />
          <div className={styles.calendarGrid}>
            {monthDays.map((day) => (
              <span className={day % 7 === 0 ? styles.calendarBusy : ""} key={day}>{day}</span>
            ))}
          </div>
          <PanelTitle icon={Clock} kicker="Semaine" title="Planning rapide" />
          <div className={styles.weekList}>
            {["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"].map((day, index) => (
              <div key={day}>
                <strong>{day}</strong>
                <span>{index % 2 === 0 ? "Créneau disponible" : "Session / suivi"}</span>
              </div>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
}

function ClientsSection({
  clientNotes,
  saveClientNote,
  selectedClient,
  setSelectedClientEmail,
  visibleClients,
}: {
  clientNotes: Record<string, string>;
  saveClientNote: (email: string, note: string) => void;
  selectedClient?: AdminClientRecord;
  setSelectedClientEmail: (email: string) => void;
  visibleClients: AdminClientRecord[];
}) {
  const [openedClientKey, setOpenedClientKey] = useState("");
  const openedClient = openedClientKey
    ? visibleClients.find((client) => client.key === openedClientKey) ?? selectedClient
    : undefined;
  const noteKey = openedClient?.email || openedClient?.key || "";
  const historyItems = openedClient
    ? [
        ...openedClient.quotes.map((quote) => ({
          date: quote.sentAt,
          label: "Devis",
          text: `${quote.title} · ${getQuoteBudget(quote)} · ${getQuoteStatus(quote, {})}`,
        })),
        ...openedClient.reservations.map((reservation) => ({
          date: reservation.date || "",
          label: "Rendez-vous",
          text: `${reservation.title} · ${formatDateTime(reservation.date)}`,
        })),
        ...openedClient.threads.map((thread) => ({
          date: "",
          label: "Conversation",
          text: `${thread.project} · ${thread.status}`,
        })),
        ...openedClient.messages.slice(-6).map((message) => ({
          date: "",
          label: message.author === "studio" ? "Message studio" : "Message client",
          text: `${message.time} · ${message.text.slice(0, 120)}`,
        })),
      ]
    : [];

  return (
    <section className={styles.sectionStack}>
      <div className={styles.panel}>
        <PanelTitle icon={UsersRound} kicker="Clients" title="Liste complète" />
        <div className={styles.clientNameList}>
          {visibleClients.length ? (
            visibleClients.map((client) => (
              <button
                className={styles.clientNameRow}
                key={client.key}
                type="button"
                onClick={() => {
                  setSelectedClientEmail(client.key);
                  setOpenedClientKey(client.key);
                }}
              >
                <strong>{client.name}</strong>
                <span>{client.email || "Email non renseigné"}</span>
                <small>{client.quotes.length} devis · {client.reservations.length} RDV · {client.threads.length} conversation{client.threads.length > 1 ? "s" : ""}</small>
                <ChevronRight strokeWidth={1.7} aria-hidden="true" />
              </button>
            ))
          ) : (
            <EmptyState text="Aucun client ne correspond à la recherche." />
          )}
        </div>
      </div>

      {openedClient ? (
        <div
          className={styles.devisModalBackdrop}
          role="dialog"
          aria-modal="true"
          aria-label={`Fiche client de ${openedClient.name}`}
          onClick={() => setOpenedClientKey("")}
        >
          <article className={styles.devisModal} onClick={(event) => event.stopPropagation()}>
            <button
              className={styles.devisModalClose}
              type="button"
              aria-label="Fermer la fiche client"
              onClick={() => setOpenedClientKey("")}
            >
              <X strokeWidth={1.8} aria-hidden="true" />
            </button>
            <div className={styles.detailHeader}>
              <div>
                <p className={styles.kicker}>Fiche client</p>
                <h2>{openedClient.name}</h2>
                <span>{openedClient.sources.join(" · ") || "Client"} · dernière activité {formatDate(openedClient.lastActivityAt)}</span>
              </div>
            </div>

            <div className={styles.infoGrid}>
              <InfoTile icon={Phone} label="Téléphone" value={openedClient.phone || "Non renseigné"} />
              <InfoTile icon={Mail} label="Email" value={openedClient.email || "Non renseigné"} />
              <InfoTile icon={FileText} label="Devis" value={String(openedClient.quotes.length)} />
              <InfoTile icon={CalendarDays} label="Rendez-vous" value={String(openedClient.reservations.length)} />
            </div>

            <section className={styles.historyGrid}>
              <HistoryPanel
                title="Devis liés"
                items={openedClient.quotes.map((quote) => `${quote.title} · ${formatDateTime(quote.sentAt)} · ${getQuoteBudget(quote)}`)}
              />
              <HistoryPanel
                title="Rendez-vous liés"
                items={openedClient.reservations.map((reservation) => `${reservation.title} · ${formatDateTime(reservation.date)}`)}
              />
              <HistoryPanel
                title="Conversations liées"
                items={openedClient.threads.map((thread) => `${thread.project} · ${thread.lastMessage}`)}
              />
            </section>

            <section className={styles.clientTimeline}>
              <PanelTitle icon={Clock} kicker="Historique" title="Activité complète" />
              {historyItems.length ? (
                historyItems.map((item, index) => (
                  <div key={`${item.label}-${index}`}>
                    <span>{item.label}</span>
                    <strong>{item.text}</strong>
                    {item.date ? <time>{formatDateTime(item.date)}</time> : null}
                  </div>
                ))
              ) : (
                <EmptyState text="Aucun historique lié pour ce client." />
              )}
            </section>

            <label className={styles.noteBox}>
              <span>Notes privées</span>
              <textarea
                value={clientNotes[noteKey] || ""}
                onChange={(event) => saveClientNote(noteKey, event.target.value)}
                placeholder="Ajouter une note privée sur ce client"
              />
            </label>
          </article>
        </div>
      ) : null}
    </section>
  );
}

function PortfolioSection({
  addPortfolioItem,
  newPortfolioTitle,
  portfolio,
  removePortfolioItem,
  setNewPortfolioTitle,
  updatePortfolioItem,
}: {
  addPortfolioItem: (draft: PortfolioEditDraft) => void;
  newPortfolioTitle: string;
  portfolio: ManagedPortfolioItem[];
  removePortfolioItem: (item: ManagedPortfolioItem) => void;
  setNewPortfolioTitle: (value: string) => void;
  updatePortfolioItem: (item: ManagedPortfolioItem, draft: PortfolioEditDraft) => void;
}) {
  const [openedPortfolioId, setOpenedPortfolioId] = useState("");
  const openedPortfolio = portfolio.find((item) => item.id === openedPortfolioId);
  const [draft, setDraft] = useState<PortfolioEditDraft | null>(null);
  const [isCreatingPortfolio, setIsCreatingPortfolio] = useState(false);
  const portfolioPhotoInputRef = useRef<HTMLInputElement>(null);

  const openPortfolioEditor = (item: ManagedPortfolioItem) => {
    setIsCreatingPortfolio(false);
    setOpenedPortfolioId(item.id);
    setDraft(makePortfolioEditDraft(item));
  };
  const openNewPortfolioEditor = () => {
    setOpenedPortfolioId("");
    setIsCreatingPortfolio(true);
    setDraft({
      ...makePortfolioEditDraft({
        id: "new-portfolio",
        title: newPortfolioTitle,
        category: "",
        placement: "",
        year: new Date().getFullYear().toString(),
        description: "",
        image: {
          src: "",
          alt: newPortfolioTitle,
        },
        availability: "Publié",
        featured: false,
        price: 0,
        size: "",
        style: "",
      }),
      title: newPortfolioTitle,
    });
    setNewPortfolioTitle("");
  };
  const closePortfolioEditor = () => {
    setOpenedPortfolioId("");
    setIsCreatingPortfolio(false);
    setDraft(null);
  };
  const updateDraft = (field: keyof PortfolioEditDraft, value: string) => {
    setDraft((current) => (current ? { ...current, [field]: value } : current));
  };
  const uploadPortfolioImage = async (file: File) => {
    setDraft((current) =>
      current
        ? {
            ...current,
            style: current.style.trim() || styleFromImageFile(file),
            title: current.title.trim() || titleFromImageFile(file),
          }
        : current,
    );

    const formData = new FormData();
    formData.set("file", file);

    const response = await fetch("/api/admin/uploads", {
      method: "POST",
      body: formData,
    });
    const payload = response.ok ? (await response.json() as { url?: string }) : {};

    if (payload.url) {
      updateDraft("imageSrc", payload.url);
    }
  };
  const submitPortfolioEdit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!draft) return;

    if (isCreatingPortfolio) {
      addPortfolioItem(draft);
      closePortfolioEditor();
      return;
    }

    if (openedPortfolio) {
      updatePortfolioItem(openedPortfolio, draft);
      closePortfolioEditor();
    }
  };
  const updatePortfolioAvailability = (item: ManagedPortfolioItem, availability: PortfolioAvailability) => {
    updatePortfolioItem(item, {
      ...makePortfolioEditDraft(item),
      availability,
    });
  };

  return (
    <div className={styles.sectionStack}>
      <div className={styles.creationBar}>
        <ImagePlus strokeWidth={1.7} aria-hidden="true" />
        <input
          value={newPortfolioTitle}
          readOnly
          onFocus={openNewPortfolioEditor}
          onClick={openNewPortfolioEditor}
          placeholder="Titre de la nouvelle réalisation"
        />
        <button type="button" onClick={openNewPortfolioEditor}>
          <Plus strokeWidth={1.7} aria-hidden="true" />
          Ajouter
        </button>
      </div>

      <section className={styles.flashGrid}>
        {portfolio.map((item) => (
          <article className={styles.flashCard} key={item.id}>
            <button
              className={styles.flashPreviewButton}
              type="button"
              aria-label={`Modifier ${item.title}`}
              onClick={() => openPortfolioEditor(item)}
            >
              <img src={item.image.src} alt={item.image.alt} />
            </button>
            <div>
              <span>{item.year} · {item.availability || "Publié"}</span>
              <strong>{item.title}</strong>
              <p>{item.size || "À renseigner"} · {item.placement} · {item.price ?? 0} €</p>
              <select
                value={item.availability || "Publié"}
                onChange={(event) => updatePortfolioAvailability(item, event.target.value as PortfolioAvailability)}
              >
                <option value="Publié">Publié</option>
                <option value="Brouillon">Brouillon</option>
                <option value="Archivé">Archivé</option>
              </select>
              <div className={styles.rowActions}>
                <button type="button" onClick={() => openPortfolioEditor(item)}>
                  <Pencil strokeWidth={1.7} aria-hidden="true" />
                  Modifier
                </button>
                <button type="button" onClick={() => removePortfolioItem(item)}>
                  <Trash2 strokeWidth={1.7} aria-hidden="true" />
                  Supprimer
                </button>
              </div>
            </div>
          </article>
        ))}
      </section>

      {(openedPortfolio || isCreatingPortfolio) && draft ? (
        <div
          className={styles.flashModalBackdrop}
          role="dialog"
          aria-modal="true"
          aria-label={isCreatingPortfolio ? "Ajouter une réalisation" : `Modifier ${openedPortfolio?.title}`}
          onClick={closePortfolioEditor}
        >
          <form className={styles.flashModal} onSubmit={submitPortfolioEdit} onClick={(event) => event.stopPropagation()}>
            <button
              className={styles.flashModalClose}
              type="button"
              aria-label="Fermer"
              onClick={closePortfolioEditor}
            >
              <X strokeWidth={1.8} aria-hidden="true" />
            </button>
            <div className={styles.flashModalPreview}>
              {draft.imageSrc ? (
                <img src={draft.imageSrc} alt="" />
              ) : (
                <button
                  className={styles.flashModalImagePlaceholder}
                  type="button"
                  onClick={() => portfolioPhotoInputRef.current?.click()}
                >
                  <ImagePlus strokeWidth={1.7} aria-hidden="true" />
                  <span>Photo de la réalisation</span>
                </button>
              )}
              <div>
                <p className={styles.kicker}>{isCreatingPortfolio ? "Nouvelle réalisation" : openedPortfolio?.year}</p>
                <h2>{isCreatingPortfolio ? "Ajouter au portfolio" : "Modifier la réalisation"}</h2>
                <strong>{draft.title}</strong>
                <span>{draft.price} € · {draft.size} · {draft.availability}</span>
              </div>
            </div>
            <div className={styles.flashModalForm}>
              <label>
                <span>Titre</span>
                <input required value={draft.title} onChange={(event) => updateDraft("title", event.target.value)} />
              </label>
              <label>
                <span>Photo obligatoire</span>
                <input
                  required={isCreatingPortfolio}
                  value={draft.imageSrc}
                  onChange={(event) => updateDraft("imageSrc", event.target.value)}
                  placeholder="Ajoutez une photo ou collez une URL"
                />
              </label>
              <label>
                <span>Photo</span>
                <input
                  accept="image/*"
                  ref={portfolioPhotoInputRef}
                  type="file"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) void uploadPortfolioImage(file);
                  }}
                />
              </label>
              <label>
                <span>Prix</span>
                <input required inputMode="numeric" value={draft.price} onChange={(event) => updateDraft("price", event.target.value)} />
              </label>
              <label>
                <span>Taille</span>
                <input required value={draft.size} onChange={(event) => updateDraft("size", event.target.value)} />
              </label>
              <label>
                <span>Emplacement</span>
                <input value={draft.placement} onChange={(event) => updateDraft("placement", event.target.value)} />
              </label>
              <label>
                <span>Style</span>
                <input value={draft.style} onChange={(event) => updateDraft("style", event.target.value)} />
              </label>
              <label>
                <span>Statut</span>
                <select value={draft.availability} onChange={(event) => updateDraft("availability", event.target.value)}>
                  <option value="Publié">Publié</option>
                  <option value="Brouillon">Brouillon</option>
                  <option value="Archivé">Archivé</option>
                </select>
              </label>
              <label className={styles.flashModalWideField}>
                <span>Description</span>
                <textarea value={draft.description} onChange={(event) => updateDraft("description", event.target.value)} />
              </label>
            </div>
            <div className={styles.flashModalActions}>
              <button type="submit">
                <Check strokeWidth={1.7} aria-hidden="true" />
                {isCreatingPortfolio ? "Créer la réalisation" : "Enregistrer les modifications"}
              </button>
              {!isCreatingPortfolio && openedPortfolio ? (
                <button type="button" onClick={() => removePortfolioItem(openedPortfolio)}>
                  <Trash2 strokeWidth={1.7} aria-hidden="true" />
                  Supprimer
                </button>
              ) : null}
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}

function FlashsSection({
  addFlashItem,
  flashs,
  newFlashTitle,
  removeFlashItem,
  setNewFlashTitle,
  updateFlashAvailability,
  updateFlashItem,
}: {
  addFlashItem: (draft: FlashEditDraft) => void;
  flashs: ManagedFlashItem[];
  newFlashTitle: string;
  removeFlashItem: (item: ManagedFlashItem) => void;
  setNewFlashTitle: (value: string) => void;
  updateFlashAvailability: (item: ManagedFlashItem, availability: ManagedFlashItem["availability"]) => void;
  updateFlashItem: (item: ManagedFlashItem, draft: FlashEditDraft) => void;
}) {
  const [openedFlashId, setOpenedFlashId] = useState("");
  const openedFlash = flashs.find((item) => item.id === openedFlashId);
  const [draft, setDraft] = useState<FlashEditDraft | null>(null);
  const [isCreatingFlash, setIsCreatingFlash] = useState(false);
  const [previewedFlash, setPreviewedFlash] = useState<ManagedFlashItem | null>(null);
  const flashPhotoInputRef = useRef<HTMLInputElement>(null);
  const openFlashEditor = (item: ManagedFlashItem) => {
    setPreviewedFlash(null);
    setIsCreatingFlash(false);
    setOpenedFlashId(item.id);
    setDraft(makeFlashEditDraft(item));
  };
  const openNewFlashEditor = () => {
    setPreviewedFlash(null);
    setOpenedFlashId("");
    setIsCreatingFlash(true);
    setDraft(makeNewFlashDraft());
    setNewFlashTitle("");
  };
  const closeFlashEditor = () => {
    setOpenedFlashId("");
    setIsCreatingFlash(false);
    setDraft(null);
  };
  const updateDraft = (field: keyof FlashEditDraft, value: string) => {
    setDraft((current) => (current ? { ...current, [field]: value } : current));
  };
  const uploadFlashImage = async (file: File) => {
    setDraft((current) => (current ? inferFlashDraftFromImage(current, file) : current));

    const formData = new FormData();
    formData.set("file", file);

    const response = await fetch("/api/admin/uploads", {
      method: "POST",
      body: formData,
    });
    const payload = response.ok ? (await response.json() as { url?: string }) : {};

    if (payload.url) {
      updateDraft("imageSrc", payload.url);
    }
  };
  const submitFlashEdit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!draft) return;

    if (isCreatingFlash) {
      addFlashItem(draft);
      closeFlashEditor();
      return;
    }

    if (openedFlash) {
      updateFlashItem(openedFlash, draft);
      closeFlashEditor();
    }
  };

  useEffect(() => {
    if (!previewedFlash) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setPreviewedFlash(null);
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [previewedFlash]);

  return (
    <div className={styles.sectionStack}>
      <div className={styles.creationBar}>
        <Zap strokeWidth={1.7} aria-hidden="true" />
        <input
          value={newFlashTitle}
          readOnly
          onFocus={openNewFlashEditor}
          onClick={openNewFlashEditor}
          placeholder="Titre du nouveau flash"
        />
        <button type="button" onClick={() => openNewFlashEditor()}>
          <Plus strokeWidth={1.7} aria-hidden="true" />
          Ajouter
        </button>
      </div>

      <section className={styles.flashGrid}>
        {flashs.map((item) => (
          <article className={styles.flashCard} key={item.id}>
            <button
              className={styles.flashPreviewButton}
              type="button"
              aria-label={`Voir ${item.title} en grand`}
              onClick={() => setPreviewedFlash(item)}
            >
              <img src={item.image.src} alt={item.image.alt} />
            </button>
            <div>
              <span>{item.reference}</span>
              <strong>{item.title}</strong>
              <p>{item.size} · {item.placement} · {item.price} €</p>
              <select
                value={item.availability || "Disponible"}
                onChange={(event) => updateFlashAvailability(item, event.target.value as ManagedFlashItem["availability"])}
              >
                <option value="Disponible">Disponible</option>
                <option value="Réservé">Réservé</option>
                <option value="Vendu">Vendu</option>
              </select>
              <div className={styles.rowActions}>
                <button type="button" onClick={() => setPreviewedFlash(item)}>
                  <Eye strokeWidth={1.7} aria-hidden="true" />
                  Voir
                </button>
                <button type="button" onClick={() => openFlashEditor(item)}>
                  <Pencil strokeWidth={1.7} aria-hidden="true" />
                  Modifier
                </button>
                <button type="button" onClick={() => removeFlashItem(item)}>
                  <Trash2 strokeWidth={1.7} aria-hidden="true" />
                  Supprimer
                </button>
              </div>
            </div>
          </article>
        ))}
      </section>

      {previewedFlash ? (
        <div
          className={styles.flashPreviewBackdrop}
          role="presentation"
          onClick={() => setPreviewedFlash(null)}
        >
          <section
            className={styles.flashPreviewModal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-flash-preview-title"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              className={styles.flashPreviewClose}
              type="button"
              aria-label="Fermer l'aperçu"
              onClick={() => setPreviewedFlash(null)}
            >
              <X strokeWidth={1.8} aria-hidden="true" />
            </button>
            <div className={styles.flashPreviewImageWrap}>
              <AdminFlashPreviewImage src={previewedFlash.image.src} alt={previewedFlash.image.alt} />
            </div>
            <div className={styles.flashPreviewDetails}>
              <p className={styles.kicker}>{previewedFlash.reference}</p>
              <h2 id="admin-flash-preview-title">{previewedFlash.title}</h2>
              <p>{previewedFlash.description}</p>
              <dl>
                <div>
                  <dt>Prix</dt>
                  <dd>{previewedFlash.price} €</dd>
                </div>
                <div>
                  <dt>Taille</dt>
                  <dd>{previewedFlash.size}</dd>
                </div>
                <div>
                  <dt>Placement</dt>
                  <dd>{previewedFlash.placement}</dd>
                </div>
                <div>
                  <dt>Statut</dt>
                  <dd>{previewedFlash.availability || "Disponible"}</dd>
                </div>
              </dl>
              <button type="button" onClick={() => openFlashEditor(previewedFlash)}>
                <Pencil strokeWidth={1.7} aria-hidden="true" />
                Modifier ce flash
              </button>
            </div>
          </section>
        </div>
      ) : null}

      {(openedFlash || isCreatingFlash) && draft ? (
        <div
          className={styles.flashModalBackdrop}
          role="dialog"
          aria-modal="true"
          aria-label={isCreatingFlash ? "Ajouter un flash" : `Modifier ${openedFlash?.title}`}
          onClick={closeFlashEditor}
        >
          <form className={styles.flashModal} onSubmit={submitFlashEdit} onClick={(event) => event.stopPropagation()}>
            <button
              className={styles.flashModalClose}
              type="button"
              aria-label="Fermer"
              onClick={closeFlashEditor}
            >
              <X strokeWidth={1.8} aria-hidden="true" />
            </button>
            <div className={styles.flashModalPreview}>
              {draft.imageSrc ? (
                <img src={draft.imageSrc} alt="" />
              ) : (
                <button
                  className={styles.flashModalImagePlaceholder}
                  type="button"
                  onClick={() => flashPhotoInputRef.current?.click()}
                >
                  <ImagePlus strokeWidth={1.7} aria-hidden="true" />
                  <span>Photo du flash</span>
                </button>
              )}
              <div>
                <p className={styles.kicker}>{isCreatingFlash ? "Nouveau flash" : openedFlash?.reference}</p>
                <h2>{isCreatingFlash ? "Ajouter un flash" : "Modifier le flash"}</h2>
                <strong>{draft.title}</strong>
                <span>{draft.price} € · {draft.size} · {draft.availability}</span>
              </div>
            </div>
            <div className={styles.flashModalForm}>
              <label>
                <span>Titre</span>
                <input required value={draft.title} onChange={(event) => updateDraft("title", event.target.value)} />
              </label>
              <label>
                <span>Photo obligatoire</span>
                <input
                  required={isCreatingFlash}
                  value={draft.imageSrc}
                  onChange={(event) => updateDraft("imageSrc", event.target.value)}
                  placeholder="Ajoutez une photo ou collez une URL"
                />
              </label>
              <label>
                <span>Photo</span>
                <input
                  accept="image/*"
                  ref={flashPhotoInputRef}
                  type="file"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) void uploadFlashImage(file);
                  }}
                />
              </label>
              <label>
                <span>Prix</span>
                <input required inputMode="numeric" value={draft.price} onChange={(event) => updateDraft("price", event.target.value)} />
              </label>
              <label>
                <span>Taille</span>
                <input required value={draft.size} onChange={(event) => updateDraft("size", event.target.value)} />
              </label>
              <label>
                <span>Emplacement conseillé</span>
                <input value={draft.placement} onChange={(event) => updateDraft("placement", event.target.value)} />
              </label>
              <label>
                <span>Style</span>
                <input value={draft.style} onChange={(event) => updateDraft("style", event.target.value)} />
              </label>
              <label>
                <span>Disponibilité</span>
                <select value={draft.availability} onChange={(event) => updateDraft("availability", event.target.value)}>
                  <option value="Disponible">Disponible</option>
                  <option value="Réservé">Réservé</option>
                  <option value="Vendu">Vendu</option>
                </select>
              </label>
              <label className={styles.flashModalWideField}>
                <span>Description</span>
                <textarea value={draft.description} onChange={(event) => updateDraft("description", event.target.value)} />
              </label>
            </div>
            <div className={styles.flashModalActions}>
              <button type="submit">
                <Check strokeWidth={1.7} aria-hidden="true" />
                {isCreatingFlash ? "Créer le flash" : "Enregistrer les modifications"}
              </button>
              {!isCreatingFlash && openedFlash ? (
                <button type="button" onClick={() => removeFlashItem(openedFlash)}>
                  <Trash2 strokeWidth={1.7} aria-hidden="true" />
                  Supprimer
                </button>
              ) : null}
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}

type ContentBox = {
  height: number;
  naturalHeight: number;
  naturalWidth: number;
  width: number;
  x: number;
  y: number;
};

type ImageFit = {
  height: number;
  left: number;
  top: number;
  width: number;
};

function AdminFlashPreviewImage({ alt, src }: { alt: string; src: string }) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [contentBox, setContentBox] = useState<ContentBox | null>(null);
  const [fit, setFit] = useState<ImageFit | null>(null);
  const [useFallbackFit, setUseFallbackFit] = useState(false);

  useEffect(() => {
    if (!contentBox || useFallbackFit) {
      return;
    }

    const updateFit = () => {
      const wrapper = wrapperRef.current;

      if (!wrapper) return;

      const bounds = wrapper.getBoundingClientRect();

      if (bounds.width === 0 || bounds.height === 0) return;

      const scale = Math.min(bounds.width / contentBox.width, bounds.height / contentBox.height);
      const width = contentBox.naturalWidth * scale;
      const height = contentBox.naturalHeight * scale;

      setFit({
        height,
        left: (bounds.width - contentBox.width * scale) / 2 - contentBox.x * scale,
        top: (bounds.height - contentBox.height * scale) / 2 - contentBox.y * scale,
        width,
      });
    };

    updateFit();

    const resizeObserver = new ResizeObserver(updateFit);
    const wrapper = wrapperRef.current;

    if (wrapper) {
      resizeObserver.observe(wrapper);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, [contentBox, useFallbackFit]);

  const scanImageContent = (image: HTMLImageElement) => {
    const naturalWidth = image.naturalWidth;
    const naturalHeight = image.naturalHeight;

    if (naturalWidth === 0 || naturalHeight === 0) {
      setUseFallbackFit(true);
      return;
    }

    try {
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d", { willReadFrequently: true });

      if (!context) {
        setUseFallbackFit(true);
        return;
      }

      canvas.width = naturalWidth;
      canvas.height = naturalHeight;
      context.drawImage(image, 0, 0);

      const { data } = context.getImageData(0, 0, naturalWidth, naturalHeight);
      let minX = naturalWidth;
      let minY = naturalHeight;
      let maxX = -1;
      let maxY = -1;

      for (let y = 0; y < naturalHeight; y += 1) {
        for (let x = 0; x < naturalWidth; x += 1) {
          const index = (y * naturalWidth + x) * 4;
          const red = data[index];
          const green = data[index + 1];
          const blue = data[index + 2];
          const alpha = data[index + 3];
          const isVisibleInk = alpha > 12 && (alpha < 248 || red < 244 || green < 244 || blue < 244);

          if (isVisibleInk) {
            minX = Math.min(minX, x);
            minY = Math.min(minY, y);
            maxX = Math.max(maxX, x);
            maxY = Math.max(maxY, y);
          }
        }
      }

      if (maxX < minX || maxY < minY) {
        setUseFallbackFit(true);
        return;
      }

      const padding = Math.round(Math.min(naturalWidth, naturalHeight) * 0.035);

      setUseFallbackFit(false);
      setContentBox({
        height: Math.min(naturalHeight, maxY - minY + 1 + padding * 2),
        naturalHeight,
        naturalWidth,
        width: Math.min(naturalWidth, maxX - minX + 1 + padding * 2),
        x: Math.max(0, minX - padding),
        y: Math.max(0, minY - padding),
      });
    } catch {
      setUseFallbackFit(true);
    }
  };

  const imageStyle: CSSProperties | undefined =
    fit && !useFallbackFit
      ? {
          height: `${fit.height}px`,
          left: `${fit.left}px`,
          top: `${fit.top}px`,
          width: `${fit.width}px`,
        }
      : undefined;

  return (
    <div className={styles.flashPreviewImageStage} ref={wrapperRef}>
      <img
        className={useFallbackFit || !fit ? styles.flashPreviewImageFallback : styles.flashPreviewImage}
        src={src}
        alt={alt}
        style={imageStyle}
        onLoad={(event) => {
          setContentBox(null);
          setFit(null);
          setUseFallbackFit(false);
          scanImageContent(event.currentTarget);
        }}
      />
    </div>
  );
}

function SettingsSection({
  accounts,
  analytics,
  flashs,
  messages,
  portfolio,
  quotes,
  reservations,
  threads,
}: {
  accounts: ClientAccount[];
  analytics: StoredAdminAnalytics;
  flashs: ManagedFlashItem[];
  messages: MessagerieMessage[];
  portfolio: ManagedPortfolioItem[];
  quotes: ClientQuote[];
  reservations: ClientReservation[];
  threads: MessagerieThread[];
}) {
  return (
    <section className={styles.settingsGrid}>
      <article className={styles.panel}>
        <PanelTitle icon={Leaf} kicker="Studio" title="Informations du studio" />
        <SettingsRow label="Nom" value="B.Grumpy Tattoo" />
        <SettingsRow label="Adresse" value="À compléter" />
        <SettingsRow label="Téléphone" value="À compléter" />
        <SettingsRow label="Email" value="b.grumpytattoo@gmail.com" />
        <SettingsRow label="Réseaux sociaux" value="Instagram / TikTok à compléter" />
      </article>

      <article className={styles.panel}>
        <PanelTitle icon={Settings} kicker="Application" title="Configuration générale" />
        <SettingsRow label="Horaires" value="Sur rendez-vous" />
        <SettingsRow label="Notifications" value="Centralisées dans l'admin" />
        <SettingsRow label="Devis enregistrés" value={String(quotes.length)} />
        <SettingsRow label="Messages enregistrés" value={String(messages.length)} />
        <SettingsRow label="Rendez-vous" value={String(reservations.length)} />
      </article>

      <article className={styles.panel}>
        <PanelTitle icon={UserRound} kicker="Compte" title="Profil administrateur" />
        <SettingsRow label="Compte" value="Tatoueuse propriétaire" />
        <SettingsRow label="Sécurité" value="Session protégée par cookie signé" />
        <SettingsRow label="Mot de passe" value="Configurable dans .env.local" />
        <SettingsRow label="Sessions client" value={String(accounts.length)} />
      </article>

      <article className={styles.panel}>
        <PanelTitle icon={Eye} kicker="Données" title="État du miroir client" />
        <SettingsRow label="Visites" value={String(analytics.totalVisits)} />
        <SettingsRow label="Conversations" value={String(threads.length)} />
        <SettingsRow label="Portfolio" value={String(portfolio.length)} />
        <SettingsRow label="Flashs" value={String(flashs.length)} />
      </article>
    </section>
  );
}

function MetricCard({
  helper,
  icon: Icon,
  label,
  suffix = "",
  value,
}: {
  helper?: string;
  icon: typeof FileText;
  label: string;
  suffix?: string;
  value: number;
}) {
  return (
    <article className={styles.metricCard}>
      <span><Icon strokeWidth={1.7} aria-hidden="true" /></span>
      <div>
        <p>{label}</p>
        <strong>{value.toLocaleString("fr-FR")}{suffix}</strong>
        {helper && <small>{helper}</small>}
      </div>
    </article>
  );
}

function LineChart({
  secondaryValues,
  values,
}: {
  secondaryValues: number[];
  values: number[];
}) {
  const max = Math.max(...values, ...secondaryValues, 1);

  return (
    <div className={styles.lineChart}>
      <div className={styles.chartGrid} aria-hidden="true">
        {[40, 30, 20, 10, 0].map((value) => (
          <span key={value}>{value}</span>
        ))}
      </div>
      <svg viewBox="0 0 560 210" role="img" aria-label="Évolution des devis">
        <polyline
          className={styles.lineSecondary}
          points={secondaryValues
            .map((value, index) => `${(index / (secondaryValues.length - 1)) * 540 + 10},${200 - (value / max) * 170}`)
            .join(" ")}
        />
        <polyline
          className={styles.linePrimary}
          points={values
            .map((value, index) => `${(index / (values.length - 1)) * 540 + 10},${200 - (value / max) * 170}`)
            .join(" ")}
        />
      </svg>
      <div className={styles.chartLabels}>
        <span>12 avr.</span>
        <span>19 avr.</span>
        <span>26 avr.</span>
        <span>3 mai</span>
        <span>10 mai</span>
        <span>17 mai</span>
      </div>
    </div>
  );
}

function BarChart() {
  const bars = [44, 31, 42, 55, 72, 49, 78, 54, 34, 43, 51, 67, 82, 91, 39, 66, 48, 52, 72, 88];

  return (
    <div className={styles.barChart} aria-label="Revenus des trente derniers jours">
      {bars.map((height, index) => (
        <span key={`${height}-${index}`} style={{ height: `${height}%` }} />
      ))}
    </div>
  );
}

function PanelTitle({ icon: Icon, kicker, title }: { icon: typeof FileText; kicker: string; title: string }) {
  return (
    <div className={styles.panelTitle}>
      <div>
        <p className={styles.kicker}>{kicker}</p>
        <h2>{title}</h2>
      </div>
      <Icon strokeWidth={1.7} aria-hidden="true" />
    </div>
  );
}

function Timeline({ events }: { events: AnalyticsEvent[] }) {
  if (!events.length) {
    return <EmptyState text="L'activité récente apparaîtra dès que le site client est utilisé." />;
  }

  return (
    <div className={styles.timeline}>
      {events.map((event) => (
        <div key={event.id}>
          <span>{getEventLabel(event)}</span>
          <strong>{event.label}</strong>
          <time>{formatDateTime(event.createdAt)}</time>
        </div>
      ))}
    </div>
  );
}

function QuoteMiniList({ quotes }: { quotes: ClientQuote[] }) {
  if (!quotes.length) return <EmptyState text="Aucun devis reçu." />;

  return (
    <div className={styles.miniList}>
      {quotes.map((quote) => (
        <div key={quote.id}>
          <strong>{getQuoteClientName(quote)}</strong>
          <span>{getQuotePlacement(quote)} · {getQuoteBudget(quote)}</span>
          <ChevronRight strokeWidth={1.7} aria-hidden="true" />
        </div>
      ))}
    </div>
  );
}

function ThreadMiniList({ threads }: { threads: MessagerieThread[] }) {
  if (!threads.length) return <EmptyState text="Aucun message reçu." />;

  return (
    <div className={styles.miniList}>
      {threads.map((thread) => (
        <div key={thread.id}>
          <strong>{thread.name}</strong>
          <span>{thread.lastMessage}</span>
          <ChevronRight strokeWidth={1.7} aria-hidden="true" />
        </div>
      ))}
    </div>
  );
}

function ReservationMiniList({ reservations }: { reservations: ClientReservation[] }) {
  if (!reservations.length) return <EmptyState text="Aucun rendez-vous à venir." />;

  return (
    <div className={styles.miniList}>
      {reservations.map((reservation) => (
        <div key={reservation.id}>
          <strong>{reservation.title}</strong>
          <span>{formatDateTime(reservation.date)}</span>
          <ChevronRight strokeWidth={1.7} aria-hidden="true" />
        </div>
      ))}
    </div>
  );
}

function VisitDateChart({ series }: { series: VisitDayStat[] }) {
  const maxVisits = Math.max(1, ...series.map((item) => item.visits));
  const totalVisits = series.reduce((total, item) => total + item.visits, 0);

  return (
    <div className={styles.visitDateChart}>
      <div className={styles.visitDateChartHeader}>
        <span>Visites / date</span>
        <strong>{totalVisits.toLocaleString("fr-FR")} sur 14 jours</strong>
      </div>
      <div className={styles.visitDateBars} role="img" aria-label="Nombre de visites par date">
        {series.map((item) => (
          <span key={item.date}>
            <i style={{ height: `${Math.max(8, (item.visits / maxVisits) * 100)}%` }} />
            <small>{item.visits}</small>
            <em>{item.label}</em>
          </span>
        ))}
      </div>
    </div>
  );
}

function PathList({ maxPathVisits, topPaths }: { maxPathVisits: number; topPaths: [string, number][] }) {
  if (!topPaths.length) return <EmptyState text="Aucune visite enregistrée." />;

  return (
    <div className={styles.pathList}>
      {topPaths.map(([path, count]) => (
        <div key={path}>
          <span>{path}</span>
          <strong>{count}</strong>
          <i style={{ width: `${Math.max(10, (count / maxPathVisits) * 100)}%` }} />
        </div>
      ))}
    </div>
  );
}

function InfoTile({ icon: Icon, label, value }: { icon: typeof FileText; label: string; value: string }) {
  return (
    <div className={styles.infoTile}>
      <Icon strokeWidth={1.7} aria-hidden="true" />
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function HistoryPanel({ items, title }: { items: string[]; title: string }) {
  return (
    <article className={styles.historyPanel}>
      <strong>{title}</strong>
      {items.length ? items.map((item) => <span key={item}>{item}</span>) : <span>Aucun historique.</span>}
    </article>
  );
}

function SettingsRow({ label, value }: { label: string; value: string }) {
  return (
    <div className={styles.settingsRow}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return <p className={styles.emptyState}>{text}</p>;
}
