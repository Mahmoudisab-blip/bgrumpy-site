import { flashItems } from "@/src/data/flashItems";

export const runtime = "nodejs";

const recipientEmail = "info@bgrumpytattoo.fr";
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const phonePattern = /^(06|07)\d{8}$/;

type DevisPayload = {
  nom?: string;
  prenom?: string;
  portable?: string;
  email?: string;
  majeur?: string;
  age?: string;
  devis?: string;
  flashId?: string;
  budget?: number;
  projet?: string;
  zone?: string;
  taille?: number;
  disponibilites?: string[];
  reglement?: string;
  commentaires?: string;
  spams?: boolean;
  demenagement?: boolean;
  copie?: boolean;
  references?: string[];
};

const clean = (value: unknown) => (typeof value === "string" ? value.trim() : "");

const formatBoolean = (value: boolean | undefined) => (value ? "Oui" : "Non");

const escapeHtml = (value: string) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

const buildRows = (payload: DevisPayload) => {
  const selectedFlash = flashItems.find((item) => item.id === payload.flashId);

  return [
    ["Nom", clean(payload.nom)],
    ["Prénom", clean(payload.prenom)],
    ["Portable", clean(payload.portable)],
    ["Adresse mail", clean(payload.email)],
    ["Majeur", clean(payload.majeur)],
    ["Âge", payload.majeur === "Non" ? clean(payload.age) : ""],
    ["Type de demande", clean(payload.devis)],
    ["Flash sélectionné", selectedFlash?.title ?? ""],
    ["Budget maximum", typeof payload.budget === "number" ? `${payload.budget} €` : ""],
    ["Projet", clean(payload.projet)],
    ["Zone", clean(payload.zone)],
    ["Taille", typeof payload.taille === "number" ? `${payload.taille} cm` : ""],
    ["Disponibilités", Array.isArray(payload.disponibilites) ? payload.disponibilites.join(", ") : ""],
    ["Règlement", clean(payload.reglement)],
    ["Commentaires", clean(payload.commentaires)],
    ["Photos de référence", Array.isArray(payload.references) ? payload.references.join(", ") : ""],
    ["Information spams lue", formatBoolean(payload.spams)],
    ["Déménagement confirmé", formatBoolean(payload.demenagement)],
    ["Copie demandée", formatBoolean(payload.copie)],
  ].filter(([, value]) => value);
};

const buildTextEmail = (payload: DevisPayload) => {
  const rows = buildRows(payload);

  return [
    "Nouvelle demande de devis B.Grumpy Tattoo",
    "",
    ...rows.map(([label, value]) => `${label}: ${value}`),
  ].join("\n");
};

const buildHtmlEmail = (payload: DevisPayload) => {
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

  return `
    <div style="font-family:Arial,Helvetica,sans-serif;background:#f7f2ea;padding:24px;color:#161310;">
      <div style="max-width:720px;margin:0 auto;background:#fffaf3;border:1px solid #e8e2d8;border-radius:18px;overflow:hidden;">
        <div style="padding:22px 24px;background:#161310;color:#fffdf8;">
          <p style="margin:0 0 6px;font-size:12px;text-transform:uppercase;letter-spacing:.08em;color:#d8cfbf;">B.Grumpy Tattoo</p>
          <h1 style="margin:0;font-size:24px;line-height:1.2;">Nouvelle demande de devis</h1>
        </div>
        <table style="width:100%;border-collapse:collapse;">${rows}</table>
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

  if (!payload.zone) {
    return "La zone est manquante.";
  }

  if (!Array.isArray(payload.disponibilites) || payload.disponibilites.length === 0) {
    return "Les disponibilités sont manquantes.";
  }

  if (!payload.reglement) {
    return "Le mode de règlement est manquant.";
  }

  return "";
};

export async function POST(request: Request) {
  let payload: DevisPayload;

  try {
    payload = (await request.json()) as DevisPayload;
  } catch {
    return Response.json({ error: "Le formulaire est illisible." }, { status: 400 });
  }

  const validationError = validatePayload(payload);

  if (validationError) {
    return Response.json({ error: validationError }, { status: 400 });
  }

  const resendApiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.DEVIS_MAIL_FROM ?? "B.Grumpy Tattoo <onboarding@resend.dev>";
  const replyTo = clean(payload.email);
  const subject = `Nouvelle demande de devis - ${clean(payload.prenom)} ${clean(payload.nom)}`;
  const recipients = payload.copie && replyTo ? [recipientEmail, replyTo] : [recipientEmail];

  if (!resendApiKey) {
    return Response.json(
      { error: "Le service mail doit encore être activé avant l'envoi des devis." },
      { status: 503 },
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
      text: buildTextEmail(payload),
      html: buildHtmlEmail(payload),
    }),
  });

  if (!response.ok) {
    return Response.json(
      { error: "Le mail n'a pas pu être envoyé. Réessaie dans un instant." },
      { status: 502 },
    );
  }

  return Response.json({ ok: true });
}
