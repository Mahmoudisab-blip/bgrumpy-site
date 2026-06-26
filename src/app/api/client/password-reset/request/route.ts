import { createHash, randomBytes } from "node:crypto";
import { ensureDatabase, hasDatabase, query } from "@/src/lib/database";
import { normalizeLoginIdentifier } from "@/src/lib/adminIdentity";

export const runtime = "nodejs";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const resetTokenDurationMinutes = 45;

type PasswordResetRequest = {
  email?: string;
};

const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");

const buildResetEmailHtml = (resetUrl: string) => `
  <div style="font-family:Arial,sans-serif;line-height:1.5;color:#25251f;">
    <h1 style="font-size:22px;margin:0 0 12px;">Réinitialisation du mot de passe</h1>
    <p>Une demande de réinitialisation a été faite pour ton espace B.Grumpy Tattoo.</p>
    <p>
      <a href="${resetUrl}" style="display:inline-block;background:#4a5b3e;color:#fff;padding:12px 18px;border-radius:999px;text-decoration:none;font-weight:700;">
        Choisir un nouveau mot de passe
      </a>
    </p>
    <p style="font-size:13px;color:#666;">Ce lien est valable ${resetTokenDurationMinutes} minutes.</p>
    <p style="font-size:13px;color:#666;">Si tu n'as rien demandé, ignore simplement ce message.</p>
  </div>
`;

export async function POST(request: Request) {
  if (!hasDatabase()) {
    return Response.json({ error: "Base de données non configurée." }, { status: 503 });
  }

  const body = (await request.json().catch(() => null)) as PasswordResetRequest | null;
  const email = normalizeLoginIdentifier(body?.email ?? "");

  if (!emailPattern.test(email)) {
    return Response.json({ error: "Adresse mail invalide." }, { status: 400 });
  }

  await ensureDatabase();
  const accounts = await query<{ email: string }>`
    SELECT email FROM client_accounts WHERE email = ${email} LIMIT 1
  `;

  if (!accounts[0]) {
    return Response.json({ ok: true });
  }

  const resendApiKey = process.env.RESEND_API_KEY;

  if (!resendApiKey) {
    return Response.json(
      { error: "Le service mail de réinitialisation n'est pas encore configuré." },
      { status: 503 },
    );
  }

  const token = randomBytes(32).toString("base64url");
  const tokenHash = hashToken(token);
  const resetUrl = new URL(`/?reset=${encodeURIComponent(token)}`, request.url).toString();

  await query`
    DELETE FROM client_password_resets WHERE email = ${email} OR expires_at <= NOW() OR used_at IS NOT NULL
  `;
  await query`
    INSERT INTO client_password_resets (token_hash, email, expires_at)
    VALUES (${tokenHash}, ${email}, NOW() + (${`${resetTokenDurationMinutes} minutes`})::interval)
  `;

  const fromEmail = process.env.DEVIS_MAIL_FROM ?? "B.Grumpy Tattoo <onboarding@resend.dev>";
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: fromEmail,
      to: [email],
      subject: "Réinitialiser ton mot de passe B.Grumpy Tattoo",
      text: [
        "Réinitialisation du mot de passe B.Grumpy Tattoo",
        "",
        `Clique sur ce lien pour choisir un nouveau mot de passe : ${resetUrl}`,
        "",
        `Ce lien est valable ${resetTokenDurationMinutes} minutes.`,
        "Si tu n'as rien demandé, ignore simplement ce message.",
      ].join("\n"),
      html: buildResetEmailHtml(resetUrl),
    }),
  });

  if (!response.ok) {
    return Response.json(
      { error: "L'email de réinitialisation n'a pas pu être envoyé." },
      { status: 502 },
    );
  }

  return Response.json({ ok: true });
}
