import { ensureDatabase, hasDatabase, query } from "@/src/lib/database";
import { emptyClientProfile, type ClientProfile } from "@/src/lib/clientProfileStorage";
import { isPrimaryAdminEmail, normalizeLoginIdentifier } from "@/src/lib/adminIdentity";

export const runtime = "nodejs";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const normalizeEmail = normalizeLoginIdentifier;

type AccountRequest = {
  email?: string;
  password?: string;
  profile?: Partial<ClientProfile>;
};

const normalizeProfile = (email: string, profile?: Partial<ClientProfile>): ClientProfile => ({
  ...emptyClientProfile,
  ...profile,
  email,
  telephone: profile?.telephone?.replace(/\D/g, "").slice(0, 10) ?? "",
});

const hasRequiredIdentity = (profile: ClientProfile) =>
  profile.prenom.trim().length >= 2 && profile.nom.trim().length >= 2;

export async function POST(request: Request) {
  if (!hasDatabase()) {
    return Response.json({ error: "Base de données non configurée." }, { status: 503 });
  }

  const body = (await request.json().catch(() => null)) as AccountRequest | null;
  const email = normalizeEmail(body?.email ?? "");
  const password = body?.password?.trim() ?? "";

  if (!emailPattern.test(email)) {
    return Response.json({ error: "Adresse mail invalide." }, { status: 400 });
  }

  if (isPrimaryAdminEmail(email)) {
    return Response.json({ error: "Cette adresse est réservée à l'administration." }, { status: 403 });
  }

  if (password.length < 4) {
    return Response.json({ error: "Mot de passe invalide." }, { status: 400 });
  }

  await ensureDatabase();
  const existing = await query<{
    email: string;
    password: string;
    profile: ClientProfile;
  }>`
    SELECT email, password, profile
    FROM client_accounts
    WHERE email = ${email}
    LIMIT 1
  `;

  if (existing[0] && existing[0].password !== password) {
    return Response.json({ error: "Mot de passe client incorrect." }, { status: 401 });
  }

  const profile = existing[0]?.profile ?? normalizeProfile(email, body?.profile);

  if (!existing[0] && !hasRequiredIdentity(profile)) {
    return Response.json(
      { error: "Le prénom et le nom sont obligatoires.", requiresProfile: true },
      { status: 422 },
    );
  }

  if (!existing[0]) {
    await query`
      INSERT INTO client_accounts (email, password, profile)
      VALUES (${email}, ${password}, ${JSON.stringify(profile)}::jsonb)
    `;
  }

  return Response.json({ account: { email, profile } });
}

export async function PATCH(request: Request) {
  if (!hasDatabase()) {
    return Response.json({ error: "Base de données non configurée." }, { status: 503 });
  }

  const body = (await request.json().catch(() => null)) as AccountRequest & { previousEmail?: string } | null;
  const previousEmail = normalizeEmail(body?.previousEmail ?? body?.email ?? "");
  const email = normalizeEmail(body?.email ?? "");
  const password = body?.password?.trim() ?? "";

  if (!emailPattern.test(previousEmail) || !emailPattern.test(email)) {
    return Response.json({ error: "Adresse mail invalide." }, { status: 400 });
  }

  if (isPrimaryAdminEmail(previousEmail) || isPrimaryAdminEmail(email)) {
    return Response.json({ error: "Cette adresse est réservée à l'administration." }, { status: 403 });
  }

  await ensureDatabase();
  const current = await query<{ password: string }>`
    SELECT password FROM client_accounts WHERE email = ${previousEmail} LIMIT 1
  `;

  if (!current[0]) {
    return Response.json({ error: "Compte introuvable." }, { status: 404 });
  }

  if (password && current[0].password !== password) {
    return Response.json({ error: "Mot de passe client incorrect." }, { status: 401 });
  }

  if (email !== previousEmail) {
    const duplicate = await query<{ email: string }>`
      SELECT email FROM client_accounts WHERE email = ${email} LIMIT 1
    `;

    if (duplicate[0]) {
      return Response.json({ error: "Cette adresse mail est déjà utilisée." }, { status: 409 });
    }
  }

  const profile = normalizeProfile(email, body?.profile);

  await query`
    UPDATE client_accounts
    SET email = ${email},
        profile = ${JSON.stringify(profile)}::jsonb,
        updated_at = NOW()
    WHERE email = ${previousEmail}
  `;

  return Response.json({ account: { email, profile } });
}
