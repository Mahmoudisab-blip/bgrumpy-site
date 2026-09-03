import { flashItems } from "@/src/data/flashItems";
import { addServerDevis } from "@/src/lib/serverDevisStore";
import { ensureDatabase, hasDatabase, query } from "@/src/lib/database";
import { createHmac } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

export const runtime = "nodejs";

const recipientEmail = "info@bgrumpytattoo.fr";
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const phonePattern = /^(06|07)\d{8}$/;
const allowedImageTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const minimumReferencePhotos = 2;
const photoLinkLifetimeSeconds = 60 * 60 * 24 * 30;

type DevisPayload = {
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
  zone?: string | string[];
  taille?: number;
  disponibilites?: string[];
  reglement?: string | string[];
  commentaires?: string;
  spams?: boolean;
  demenagement?: boolean;
  copie?: boolean;
  referencePhotos?: Array<{
    id: string;
    name: string;
    url: string;
  }>;
  references?: string[];
  selectedFlashes?: Array<{
    id: string;
    reference: string;
    title: string;
    image: {
      src: string;
      alt: string;
    };
  }>;
};

type EmailAttachment = {
  filename: string;
  content: string;
};

const clean = (value: unknown) => (typeof value === "string" ? value.trim() : "");

const formatSelection = (value: string | string[] | undefined) =>
  Array.isArray(value)
    ? value.map((item) => clean(item)).filter(Boolean).join(", ")
    : clean(value);

const formatBoolean = (value: boolean | undefined) => (value ? "Oui" : "Non");

const escapeHtml = (value: string) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

const absoluteUrl = (url: string, requestUrl: string) => {
  try {
    return new URL(url, requestUrl).toString();
  } catch {
    return url;
  }
};

const getPhotoAccessSecret = () =>
  process.env.ADMIN_SESSION_SECRET || process.env.RESEND_API_KEY || "";

const getPhotoFileName = (url: string) => url.split("/").pop() || "";

const createPhotoAccessToken = (file: string, expiresAt: number) => {
  const secret = getPhotoAccessSecret();

  if (!secret) {
    return "";
  }

  return createHmac("sha256", secret)
    .update(`${file}.${expiresAt}`)
    .digest("base64url");
};

const getPublicPhotoUrl = (photo: { url: string }, requestUrl: string) => {
  const file = getPhotoFileName(photo.url);
  const expiresAt = Math.floor(Date.now() / 1000) + photoLinkLifetimeSeconds;
  const token = createPhotoAccessToken(file, expiresAt);

  return token
    ? absoluteUrl(`/api/devis/photos/${encodeURIComponent(file)}?expires=${expiresAt}&token=${encodeURIComponent(token)}`, requestUrl)
    : absoluteUrl(photo.url, requestUrl);
};

const parseBoolean = (value: FormDataEntryValue | null) => value === "true";
const parseNumber = (value: FormDataEntryValue | null) => {
  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed : undefined;
};
const parseStringArray = (formData: FormData, key: string) =>
  formData
    .getAll(key)
    .map((value) => clean(value))
    .filter(Boolean);

const getSelectedFlashIds = (payload: DevisPayload) =>
  Array.isArray(payload.flashIds) && payload.flashIds.length > 0
    ? payload.flashIds
    : payload.flashId
      ? [payload.flashId]
      : [];

const getSelectedFlashes = (payload: DevisPayload) => {
  const selectedFlashIds = getSelectedFlashIds(payload);

  return flashItems
    .filter((item) => selectedFlashIds.includes(item.id))
    .map((item) => ({
      id: item.id,
      reference: item.reference,
      title: item.title,
      image: item.image,
    }));
};

const getReferencePhotoCount = (payload: DevisPayload) => {
  if (Array.isArray(payload.referencePhotos)) {
    return payload.referencePhotos.length;
  }

  if (Array.isArray(payload.references)) {
    return payload.references.filter((reference) => clean(reference)).length;
  }

  return 0;
};

const saveReferenceFiles = async (files: File[]) => {
  const uploadDirectory = path.join(process.cwd(), ".bgrumpy-data", "uploads", "devis");

  const savedFiles = await Promise.all(
    files.map(async (file, index) => {
      if (!allowedImageTypes.has(file.type)) {
        throw new Error("Format image non supporté.");
      }

      if (file.size > 8 * 1024 * 1024) {
        throw new Error("Une photo est trop lourde.");
      }

      const extension = path.extname(file.name).replace(/[^.\w-]/g, "") || ".jpg";
      const safeName = `devis-${Date.now()}-${index}-${Math.random().toString(36).slice(2, 8)}${extension}`;
      const filePath = path.join(uploadDirectory, safeName);
      const bytes = Buffer.from(await file.arrayBuffer());

      if (hasDatabase()) {
        await ensureDatabase();
        await query`
          INSERT INTO admin_uploads (id, kind, content_type, data_base64)
          VALUES (${safeName}, 'devis', ${file.type}, ${bytes.toString("base64")})
        `;
      } else {
        await mkdir(uploadDirectory, { recursive: true });
        await writeFile(filePath, bytes);
      }

      return {
        photo: {
          id: `reference-${Date.now()}-${index}`,
          name: file.name,
          url: `/api/admin/uploads/devis/${safeName}`,
        },
        attachment: {
          filename: file.name,
          content: bytes.toString("base64"),
        },
      };
    }),
  );

  return {
    photos: savedFiles.map(({ photo }) => photo),
    attachments: savedFiles.map(({ attachment }) => attachment),
  };
};

const parseMultipartPayload = async (
  request: Request,
): Promise<{ payload: DevisPayload; attachments: EmailAttachment[] }> => {
  const formData = await request.formData();
  const files = formData
    .getAll("references")
    .filter((value): value is File => value instanceof File && value.size > 0);
  const { photos: referencePhotos, attachments } = await saveReferenceFiles(files);
  const payload: DevisPayload = {
    nom: clean(formData.get("nom")),
    prenom: clean(formData.get("prenom")),
    portable: clean(formData.get("portable")),
    email: clean(formData.get("email")),
    majeur: clean(formData.get("majeur")),
    age: clean(formData.get("age")),
    devis: clean(formData.get("devis")),
    flashId: clean(formData.get("flashId")),
    flashIds: parseStringArray(formData, "flashIds"),
    budget: parseNumber(formData.get("budget")),
    projet: clean(formData.get("projet")),
    zone: parseStringArray(formData, "zone"),
    taille: parseNumber(formData.get("taille")),
    disponibilites: parseStringArray(formData, "disponibilites"),
    reglement: parseStringArray(formData, "reglement"),
    commentaires: clean(formData.get("commentaires")),
    spams: parseBoolean(formData.get("spams")),
    demenagement: parseBoolean(formData.get("demenagement")),
    copie: parseBoolean(formData.get("copie")),
    referencePhotos,
    references: referencePhotos.map((photo) => photo.name),
  };

  return {
    payload: {
      ...payload,
      selectedFlashes: getSelectedFlashes(payload),
    },
    attachments,
  };
};

const buildRows = (payload: DevisPayload) => {
  const selectedFlashes = payload.selectedFlashes?.length
    ? payload.selectedFlashes
    : getSelectedFlashes(payload);
  const selectedFlashTitles = selectedFlashes.map((item) => item.title).join(", ");

  return [
    ["Nom", clean(payload.nom)],
    ["Prénom", clean(payload.prenom)],
    ["Portable", clean(payload.portable)],
    ["Adresse mail", clean(payload.email)],
    ["Majeur", clean(payload.majeur)],
    ["Âge", payload.majeur === "Non" ? clean(payload.age) : ""],
    ["Type de demande", clean(payload.devis)],
    ["Flashs sélectionnés", selectedFlashTitles],
    ["Budget maximum", typeof payload.budget === "number" ? `${payload.budget} €` : ""],
    ["Projet", clean(payload.projet)],
    ["Zone", formatSelection(payload.zone)],
    ["Taille", typeof payload.taille === "number" ? `${payload.taille} cm` : ""],
    ["Disponibilités", Array.isArray(payload.disponibilites) ? payload.disponibilites.join(", ") : ""],
    ["Règlement", formatSelection(payload.reglement)],
    ["Commentaires", clean(payload.commentaires)],
    ["Photos de référence", payload.referencePhotos?.length ? payload.referencePhotos.map((photo) => photo.url).join(", ") : Array.isArray(payload.references) ? payload.references.join(", ") : ""],
    ["Images flash demandées", selectedFlashes.map((flash) => flash.image.src).join(", ")],
    ["Information spams lue", formatBoolean(payload.spams)],
    ["Déménagement confirmé", formatBoolean(payload.demenagement)],
    ["Copie demandée", formatBoolean(payload.copie)],
  ].filter(([, value]) => value);
};

const buildTextEmail = (payload: DevisPayload, requestUrl: string) => {
  const rows = buildRows(payload);
  const normalizedRows = rows.map(([label, value]) => [
    label,
    label === "Photos de référence" && payload.referencePhotos?.length
      ? payload.referencePhotos.map((photo) => getPublicPhotoUrl(photo, requestUrl)).join(", ")
      : value
          .split(", ")
          .map((item) => item.startsWith("/") ? absoluteUrl(item, requestUrl) : item)
          .join(", "),
  ]);

  return [
    "Nouvelle demande de devis B.Grumpy Tattoo",
    "",
    ...normalizedRows.map(([label, value]) => `${label}: ${value}`),
  ].join("\n");
};

const buildHtmlEmail = (payload: DevisPayload, requestUrl: string) => {
  const rows = buildRows(payload)
    .map(
      ([label, value]) => `
        <tr>
          <td style="padding:10px 12px;border-bottom:1px solid #e8e2d8;color:#6f6659;font-size:13px;vertical-align:top;">${escapeHtml(label)}</td>
          <td style="padding:10px 12px;border-bottom:1px solid #e8e2d8;color:#161310;font-size:14px;font-weight:600;vertical-align:top;white-space:pre-wrap;">${escapeHtml(value)}</td>
        </tr>
      `,
    )
    .join("");
  const referenceImages = (payload.referencePhotos ?? [])
    .map(
      (photo) => `
        <a href="${escapeHtml(getPublicPhotoUrl(photo, requestUrl))}" style="display:block;margin:0 0 10px;color:#4e5c42;font-size:13px;font-weight:700;">${escapeHtml(photo.name)} - ouvrir la photo</a>
      `,
    )
    .join("");
  const flashImages = (payload.selectedFlashes ?? [])
    .map(
      (flash) => `
        <div style="margin:0 0 14px;">
          <p style="margin:0 0 6px;color:#6f6659;font-size:13px;font-weight:700;">${escapeHtml(flash.reference)} - ${escapeHtml(flash.title)}</p>
          <img src="${escapeHtml(absoluteUrl(flash.image.src, requestUrl))}" alt="${escapeHtml(flash.image.alt)}" style="max-width:220px;width:100%;height:auto;border:1px solid #e8e2d8;border-radius:12px;background:#fff;" />
        </div>
      `,
    )
    .join("");

  return `
    <div style="font-family:Arial,Helvetica,sans-serif;background:#f7f2ea;padding:24px;color:#161310;">
      <div style="max-width:720px;margin:0 auto;background:#fffaf3;border:1px solid #e8e2d8;border-radius:18px;overflow:hidden;">
        <div style="padding:22px 24px;background:#161310;color:#fffdf8;">
          <p style="margin:0 0 6px;font-size:12px;text-transform:uppercase;letter-spacing:.08em;color:#d8cfbf;">B.Grumpy Tattoo</p>
          <h1 style="margin:0;font-size:24px;line-height:1.2;">Nouvelle demande de devis</h1>
        </div>
        <table style="width:100%;border-collapse:collapse;">${rows}</table>
        ${referenceImages || flashImages ? `
          <div style="padding:18px 24px;">
            ${flashImages ? `<h2 style="margin:0 0 12px;font-size:16px;">Flash demandé</h2>${flashImages}` : ""}
            ${referenceImages ? `<h2 style="margin:18px 0 12px;font-size:16px;">Photos de référence</h2>${referenceImages}` : ""}
          </div>
        ` : ""}
      </div>
    </div>
  `;
};

const validatePayload = (payload: DevisPayload) => {
  if (clean(payload.nom).length < 2) {
    return "Le nom est manquant.";
  }

  if (clean(payload.prenom).length < 2) {
    return "Le prénom est manquant.";
  }

  if (!phonePattern.test(clean(payload.portable))) {
    return "Le numéro de portable est invalide.";
  }

  if (!emailPattern.test(clean(payload.email))) {
    return "L'adresse mail est invalide.";
  }

  if (!payload.devis) {
    return "Le type de demande est manquant.";
  }

  if (!payload.projet || clean(payload.projet).length < 10) {
    return "La description du projet est trop courte.";
  }

  if (getReferencePhotoCount(payload) < minimumReferencePhotos) {
    return "Ajoute au moins 2 photos de référence.";
  }

  if (!formatSelection(payload.zone)) {
    return "La zone est manquante.";
  }

  if (!Array.isArray(payload.disponibilites) || payload.disponibilites.length === 0) {
    return "Les disponibilités sont manquantes.";
  }

  if (!formatSelection(payload.reglement)) {
    return "Le mode de règlement est manquant.";
  }

  return "";
};

export async function POST(request: Request) {
  let payload: DevisPayload;
  let emailAttachments: EmailAttachment[] = [];

  try {
    if (request.headers.get("content-type")?.includes("multipart/form-data")) {
      const parsed = await parseMultipartPayload(request);
      payload = parsed.payload;
      emailAttachments = parsed.attachments;
    } else {
      payload = (await request.json()) as DevisPayload;
    }
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Le formulaire est illisible." },
      { status: 400 },
    );
  }

  payload = {
    ...payload,
    email: clean(payload.email),
    selectedFlashes: payload.selectedFlashes?.length ? payload.selectedFlashes : getSelectedFlashes(payload),
  };

  const validationError = validatePayload(payload);

  if (validationError) {
    return Response.json({ error: validationError }, { status: 400 });
  }

  const storedDevis = await addServerDevis(payload);
  const resendApiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.DEVIS_MAIL_FROM ?? "B.Grumpy Tattoo <onboarding@resend.dev>";
  const replyTo = clean(payload.email);
  const subject = `Nouvelle demande de devis - ${clean(payload.prenom)} ${clean(payload.nom)}`;
  const recipients = payload.copie && replyTo ? [recipientEmail, replyTo] : [recipientEmail];

  if (!resendApiKey) {
    return Response.json(
      {
        mailSent: false,
        ok: true,
        storedDevis,
        warning: "Le service mail doit encore être activé, mais la demande est bien arrivée dans l'administration.",
      },
      { status: 200 },
    );
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: fromEmail,
      to: recipients,
      reply_to: replyTo,
      subject,
      text: buildTextEmail(payload, request.url),
      html: buildHtmlEmail(payload, request.url),
      ...(emailAttachments.length > 0 ? { attachments: emailAttachments } : {}),
    }),
  });

  if (!response.ok) {
    return Response.json(
      { error: "Le mail n'a pas pu être envoyé. Réessaie dans un instant." },
      { status: 502 },
    );
  }

  return Response.json({ mailSent: true, ok: true, storedDevis });
}
