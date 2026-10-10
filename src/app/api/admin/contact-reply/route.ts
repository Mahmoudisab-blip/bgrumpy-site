import { cookies } from "next/headers";
import { adminSessionCookieName, verifyAdminSession } from "@/src/lib/adminAuth";
import { listServerContacts } from "@/src/lib/serverContactStore";
import { fromEmail, resendApiKey, studioReplyToEmail } from "@/src/lib/serverEmailConfig";

export const runtime = "nodejs";

const clean = (value: unknown) => (typeof value === "string" ? value.trim() : "");
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const dataImagePattern = /^data:(image\/(?:jpeg|png|webp|gif));base64,([A-Za-z0-9+/=]+)$/;

type ReplyAttachment = {
  name?: unknown;
  type?: unknown;
  url?: unknown;
};

const safeFileName = (value: string) => {
  const cleaned = value.replace(/[^a-zA-Z0-9._-]/g, "-").replace(/-+/g, "-").slice(0, 120);
  return cleaned || "image-jointe.jpg";
};

const toResendAttachments = (value: unknown) => {
  if (!Array.isArray(value)) {
    return [];
  }

  if (value.length > 5) {
    return null;
  }

  const attachments = value.map((item) => {
    const attachment = item as ReplyAttachment;
    const url = clean(attachment.url);
    const match = dataImagePattern.exec(url);

    if (!match) {
      return null;
    }

    return {
      filename: safeFileName(clean(attachment.name)),
      content: match[2],
      content_type: match[1],
    };
  });

  return attachments.some((attachment) => !attachment) ? null : attachments;
};

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const authenticated = await verifyAdminSession(
    cookieStore.get(adminSessionCookieName)?.value,
  );

  if (!authenticated) {
    return Response.json({ error: "Non autorisé." }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as {
    contactId?: string;
    recipientEmail?: string;
    recipientName?: string;
    text?: string;
    attachments?: ReplyAttachment[];
  } | null;
  const contactId = clean(body?.contactId);
  const text = clean(body?.text);
  const recipientEmail = clean(body?.recipientEmail).toLowerCase();
  const recipientName = clean(body?.recipientName);
  const attachments = toResendAttachments(body?.attachments);

  if (attachments === null) {
    return Response.json({ error: "Les pièces jointes ne sont pas valides." }, { status: 400 });
  }

  const contact = contactId
    ? (await listServerContacts()).find((item) => item.id === contactId)
    : undefined;
  const targetEmail = contact?.payload.email || recipientEmail;
  const targetName = contact?.payload.name || recipientName || "client";

  if (!emailPattern.test(targetEmail)) {
    return Response.json({ error: "Adresse mail du client introuvable." }, { status: 400 });
  }

  if (!text && !attachments.length) {
    return Response.json({ error: "Réponse vide." }, { status: 400 });
  }

  if (!resendApiKey) {
    return Response.json(
      { mailSent: false, error: "Le service mail n'est pas configuré. La réponse n'a pas été envoyée." },
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
      to: [targetEmail],
      reply_to: studioReplyToEmail,
      subject: "Réponse de B.Grumpy Tattoo",
      text: `Bonjour ${targetName},\n\n${text || "Une image est jointe à ce message."}\n\nB.Grumpy Tattoo`,
      ...(attachments.length ? { attachments } : {}),
    }),
  });

  if (!response.ok) {
    return Response.json({ error: "La réponse n'a pas pu être envoyée par email." }, { status: 502 });
  }

  return Response.json({ mailSent: true, ok: true });
}
