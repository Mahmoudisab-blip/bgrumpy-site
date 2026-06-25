import { flashItems } from "@/src/data/flashItems";

export type MessagerieThread = {
  id: string;
  name: string;
  project: string;
  lastMessage: string;
  time: string;
  status: string;
  unread?: number;
  source?: "demo" | "devis";
};

export type MessagerieMessage = {
  id: string;
  threadId: string;
  author: "client" | "studio";
  attachments?: MessagerieAttachment[];
  text: string;
  time: string;
  state?: "sent" | "read";
};

export type MessagerieAttachment = {
  id: string;
  name: string;
  type: "image";
  url: string;
};

export type DevisConversationForm = {
  nom: string;
  prenom: string;
  portable: string;
  email: string;
  majeur: string;
  age: string;
  devis: string;
  flashId: string;
  flashIds?: string[];
  budget: number;
  projet: string;
  zone: string;
  taille: number;
  disponibilites: string[];
  reglement: string;
  commentaires: string;
  spams: boolean;
  demenagement: boolean;
  copie: boolean;
};

export type StoredMessagerie = {
  threads: MessagerieThread[];
  messages: MessagerieMessage[];
  activeThreadId?: string;
};

export const messagerieStorageKey = "bgrumpy-messagerie-conversations";
export const messagerieStorageEventName = "bgrumpy-messagerie-updated";

export const countClientUnreadMessages = (messagerie: Partial<StoredMessagerie>) => {
  const threads = Array.isArray(messagerie.threads) ? messagerie.threads : [];
  const messages = Array.isArray(messagerie.messages) ? messagerie.messages : [];
  const storedThreadIds = new Set(threads.filter((thread) => thread.source === "devis").map((thread) => thread.id));

  return messages.filter(
    (message) =>
      storedThreadIds.has(message.threadId) &&
      message.author === "studio" &&
      message.state !== "read",
  ).length;
};

export const parseQuoteProposal = (text: string) => {
  const amountMatches = Array.from(text.matchAll(/(\d+(?:[.,]\d{1,2})?)\s*(?:€|euros?)/gi));

  if (amountMatches.length === 0) {
    return null;
  }

  const amounts = amountMatches.map((match) => Number(match[1].replace(",", "."))).filter(Number.isFinite);

  if (!amounts.length) {
    return null;
  }

  return {
    deposit: amounts.length > 1 ? amounts[1] : undefined,
    total: amounts[0],
  };
};

export const getThreadQuoteId = (threadId: string) =>
  threadId.startsWith("devis-") ? threadId.replace(/^devis-/, "") : "";

const imageMaxDimension = 960;
const imageQuality = 0.68;

const readBlobAsDataUrl = (blob: Blob) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.addEventListener("load", () => resolve(String(reader.result)));
    reader.addEventListener("error", () => reject(reader.error));
    reader.readAsDataURL(blob);
  });

const readCompressedImage = (file: File) =>
  new Promise<string>((resolve) => {
    const image = new Image();
    const objectUrl = URL.createObjectURL(file);

    image.addEventListener("load", () => {
      const scale = Math.min(1, imageMaxDimension / Math.max(image.naturalWidth, image.naturalHeight));
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");

      canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
      canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
      context?.drawImage(image, 0, 0, canvas.width, canvas.height);

      canvas.toBlob(
        async (blob) => {
          URL.revokeObjectURL(objectUrl);
          resolve(blob ? await readBlobAsDataUrl(blob) : await readBlobAsDataUrl(file));
        },
        "image/jpeg",
        imageQuality,
      );
    });

    image.addEventListener("error", async () => {
      URL.revokeObjectURL(objectUrl);
      resolve(await readBlobAsDataUrl(file));
    });

    image.src = objectUrl;
  });

export const readImageAttachments = async (files: FileList | File[]) => {
  const imageFiles = Array.from(files).filter((file) => file.type.startsWith("image/"));

  return Promise.all(
    imageFiles.map(async (file, index) => ({
      id: `image-${Date.now()}-${index}`,
      name: file.name,
      type: "image" as const,
      url: await readCompressedImage(file),
    })),
  );
};

export const writeStoredMessagerie = (messagerie: StoredMessagerie) => {
  try {
    window.localStorage.setItem(messagerieStorageKey, JSON.stringify(messagerie));
    window.dispatchEvent(new CustomEvent(messagerieStorageEventName));
    return true;
  } catch {
    const fallback: StoredMessagerie = {
      ...messagerie,
      messages: messagerie.messages.map((message) =>
        message.attachments?.length
          ? {
              ...message,
              attachments: message.attachments.map((attachment) => ({
                ...attachment,
                url: "",
              })),
            }
          : message,
      ),
    };

    try {
      window.localStorage.setItem(messagerieStorageKey, JSON.stringify(fallback));
      window.dispatchEvent(new CustomEvent(messagerieStorageEventName));
    } catch {
      return false;
    }

    return false;
  }
};

const formatMessageTime = (date: Date) =>
  new Intl.DateTimeFormat("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);

const createProjectTitle = (form: DevisConversationForm) => {
  const selectedFlashIds = form.flashIds && form.flashIds.length > 0 ? form.flashIds : form.flashId ? [form.flashId] : [];
  const selectedFlash = flashItems.find((item) => selectedFlashIds.includes(item.id));

  if (selectedFlash) {
    return `Devis - ${selectedFlash.title}`;
  }

  return `Devis - ${form.zone || "Projet tattoo"}`;
};

export const buildDevisMessageText = (form: DevisConversationForm) => {
  const selectedFlashIds = form.flashIds && form.flashIds.length > 0 ? form.flashIds : form.flashId ? [form.flashId] : [];
  const selectedFlashTitles = flashItems
    .filter((item) => selectedFlashIds.includes(item.id))
    .map((item) => item.title)
    .join(", ");
  const rows = [
    ["Nom", form.nom],
    ["Prénom", form.prenom],
    ["Portable", form.portable],
    ["Adresse mail", form.email],
    ["Majeur", form.majeur],
    ["Âge", form.majeur === "Non" ? form.age : ""],
    ["Type de demande", form.devis],
    ["Flash sélectionné", selectedFlashTitles],
    ["Budget maximum", `${form.budget} €`],
    ["Projet", form.projet],
    ["Zone", form.zone],
    ["Taille", `${form.taille} cm`],
    ["Disponibilités", form.disponibilites.join(", ")],
    ["Règlement", form.reglement],
    ["Commentaires", form.commentaires],
    ["Information spams lue", form.spams ? "Oui" : "Non"],
    ["Déménagement confirmé", form.demenagement ? "Oui" : "Non"],
    ["Copie demandée", form.copie ? "Oui" : "Non"],
  ].filter(([, value]) => value);

  return [
    "Nouvelle demande de devis",
    "",
    ...rows.map(([label, value]) => `${label}: ${value}`),
  ].join("\n");
};

export const createDevisConversation = (
  form: DevisConversationForm,
  sentAt = new Date(),
): StoredMessagerie => {
  const timestamp = sentAt.getTime();
  const threadId = `devis-${timestamp}`;
  const time = formatMessageTime(sentAt);
  const text = buildDevisMessageText(form);

  return {
    activeThreadId: threadId,
    threads: [
      {
        id: threadId,
        name: `${form.prenom} ${form.nom}`.trim() || "Client",
        project: createProjectTitle(form),
        lastMessage: "Demande de devis envoyée depuis le formulaire.",
        time,
        status: "Devis envoyé",
        source: "devis",
      },
    ],
    messages: [
      {
        id: `${threadId}-client`,
        threadId,
        author: "client",
        text,
        time,
        state: "sent",
      },
      {
        id: `${threadId}-studio`,
        threadId,
        author: "studio",
        text: "Ta demande est bien arrivée dans la messagerie. Bryan pourra te répondre ici après lecture du projet.",
        time,
      },
    ],
  };
};
