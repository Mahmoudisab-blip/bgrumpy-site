import { cookies } from "next/headers";
import { adminSessionCookieName, verifyAdminSession } from "@/src/lib/adminAuth";
import { listServerContacts } from "@/src/lib/serverContactStore";

export const runtime = "nodejs";

const studioEmail = "info@bgrumpytattoo.fr";
const clean = (value: unknown) => (typeof value === "string" ? value.trim() : "");

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
    text?: string;
  } | null;
  const contactId = clean(body?.contactId);
  const text = clean(body?.text);

  if (!contactId || text.length < 1) {
    return Response.json({ error: "Réponse vide." }, { status: 400 });
  }

  const contact = (await listServerContacts()).find((item) => item.id === contactId);
  if (!contact) {
    return Response.json({ error: "Message de contact introuvable." }, { status: 404 });
  }

  const resendApiKey = process.env.RESEND_API_KEY;
  if (!resendApiKey) {
    return Response.json({ mailSent: false, ok: true });
  }

  const fromEmail = process.env.DEVIS_MAIL_FROM ?? "B.Grumpy Tattoo <onboarding@resend.dev>";
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: fromEmail,
      to: [contact.payload.email],
      reply_to: studioEmail,
      subject: "Réponse de B.Grumpy Tattoo",
      text: `Bonjour ${contact.payload.name},\n\n${text}\n\nB.Grumpy Tattoo`,
    }),
  });

  if (!response.ok) {
    return Response.json({ error: "La réponse n'a pas pu être envoyée par email." }, { status: 502 });
  }

  return Response.json({ mailSent: true, ok: true });
}
