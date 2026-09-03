import { addServerContact, type ContactPayload } from "@/src/lib/serverContactStore";

export const runtime = "nodejs";

const recipientEmail = "info@bgrumpytattoo.fr";
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const clean = (value: unknown) => (typeof value === "string" ? value.trim() : "");

const escapeHtml = (value: string) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

const normalizePayload = (body: Partial<ContactPayload> | null): ContactPayload => ({
  name: clean(body?.name).slice(0, 120),
  email: clean(body?.email).toLowerCase().slice(0, 160),
  phone: clean(body?.phone).slice(0, 30),
  message: clean(body?.message).slice(0, 5000),
  consent: body?.consent === true,
});

const validatePayload = (payload: ContactPayload) => {
  if (payload.name.length < 2) return "Le nom est manquant.";
  if (!emailPattern.test(payload.email)) return "L'adresse mail est invalide.";
  if (payload.message.length < 10) return "Le message est trop court.";
  if (!payload.consent) return "Le consentement est requis.";

  return "";
};

const buildTextEmail = (payload: ContactPayload) => [
  "Nouveau message de contact B.Grumpy Tattoo",
  "",
  `Nom: ${payload.name}`,
  `Adresse mail: ${payload.email}`,
  `Téléphone: ${payload.phone || "Non renseigné"}`,
  "",
  payload.message,
].join("\n");

const buildHtmlEmail = (payload: ContactPayload) => `
  <div style="font-family:Arial,Helvetica,sans-serif;background:#f7f2ea;padding:24px;color:#161310;">
    <div style="max-width:680px;margin:0 auto;background:#fffaf3;border:1px solid #e8e2d8;border-radius:18px;overflow:hidden;">
      <div style="padding:22px 24px;background:#161310;color:#fffdf8;">
        <p style="margin:0 0 6px;font-size:12px;text-transform:uppercase;letter-spacing:.08em;color:#d8cfbf;">B.Grumpy Tattoo</p>
        <h1 style="margin:0;font-size:24px;line-height:1.2;">Nouveau message de contact</h1>
      </div>
      <div style="padding:22px 24px;">
        <p><strong>Nom :</strong> ${escapeHtml(payload.name)}</p>
        <p><strong>Adresse mail :</strong> ${escapeHtml(payload.email)}</p>
        <p><strong>Téléphone :</strong> ${escapeHtml(payload.phone || "Non renseigné")}</p>
        <p style="white-space:pre-wrap;"><strong>Message :</strong><br />${escapeHtml(payload.message)}</p>
      </div>
    </div>
  </div>
`;

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as Partial<ContactPayload> | null;
  const payload = normalizePayload(body);
  const validationError = validatePayload(payload);

  if (validationError) {
    return Response.json({ error: validationError }, { status: 400 });
  }

  const storedContact = await addServerContact(payload);
  const resendApiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.DEVIS_MAIL_FROM ?? "B.Grumpy Tattoo <onboarding@resend.dev>";

  if (!resendApiKey) {
    return Response.json({
      mailSent: false,
      ok: true,
      storedContact,
      warning: "Le service mail doit encore être activé, mais le message est bien enregistré.",
    });
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: fromEmail,
      to: [recipientEmail],
      reply_to: payload.email,
      subject: `Message de contact - ${payload.name}`,
      text: buildTextEmail(payload),
      html: buildHtmlEmail(payload),
    }),
  });

  if (!response.ok) {
    return Response.json({ error: "Le mail n'a pas pu être envoyé. Réessaie dans un instant." }, { status: 502 });
  }

  return Response.json({ mailSent: true, ok: true, storedContact });
}
