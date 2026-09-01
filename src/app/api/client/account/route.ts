import { cookies } from "next/headers";
import { ensureDatabase, hasDatabase, query } from "@/src/lib/database";
import { emptyClientProfile, type ClientProfile } from "@/src/lib/clientProfileStorage";
import { isPrimaryAdminEmail, normalizeLoginIdentifier } from "@/src/lib/adminIdentity";
import { clientSessionCookieName, createClientSession, verifyClientSession } from "@/src/lib/clientAuth";
import { hashPassword, verifyPassword } from "@/src/lib/passwordHash";

export const runtime = "nodejs";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const normalizeEmail = normalizeLoginIdentifier;
const generatedClientLastName = "b.grumpy";

type AccountRequest = {
  mode?: "login" | "register";
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
  profile.prenom.trim().length >= 2 &&
  profile.nom.trim().length >= 2 &&
  profile.nom.trim().toLowerCase() !== generatedClientLastName;

const accountResponse = (email: string, profile: ClientProfile) => {
  const session = createClientSession(email);
  const response = Response.json({ account: { email, profile } });

  response.headers.append(
    "Set-Cookie",
    `${clientSessionCookieName}=${session.value}; Path=/; Max-Age=${session.maxAge}; HttpOnly; SameSite=Lax${
      process.env.NODE_ENV === "production" ? "; Secure" : ""
    }`,
  );

  return response;
};

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

  const existingAccount = existing[0];

  if (existingAccount) {
    if (body?.mode === "register") {
      return Response.json({ error: "Cette adresse mail est déjà utilisée." }, { status: 409 });
    }

    const passwordCheck = await verifyPassword(password, existingAccount.password);

    if (!passwordCheck.valid) {
      return Response.json({ error: "Mot de passe client incorrect." }, { status: 401 });
    }

    if (passwordCheck.needsRehash) {
      await query`
        UPDATE client_accounts
        SET password = ${await hashPassword(password)},
            updated_at = NOW()
        WHERE email = ${email}
      `;
    }
  }

  const requestedProfile = normalizeProfile(email, body?.profile);
  const existingProfile = existingAccount?.profile;
  const shouldUpdateIncompleteProfile =
    Boolean(existingAccount) &&
    existingProfile &&
    !hasRequiredIdentity(existingProfile) &&
    hasRequiredIdentity(requestedProfile);
  const profile = shouldUpdateIncompleteProfile ? requestedProfile : existingProfile ?? requestedProfile;

  if (!existingAccount && !hasRequiredIdentity(profile)) {
    return Response.json(
      { error: "Le prénom et le nom sont obligatoires.", requiresProfile: true },
      { status: 422 },
    );
  }

  if (!existingAccount) {
    await query`
      INSERT INTO client_accounts (email, password, profile)
      VALUES (${email}, ${await hashPassword(password)}, ${JSON.stringify(profile)}::jsonb)
    `;
  }

  if (shouldUpdateIncompleteProfile) {
    await query`
      UPDATE client_accounts
      SET profile = ${JSON.stringify(profile)}::jsonb,
          updated_at = NOW()
      WHERE email = ${email}
    `;
  }

  return accountResponse(email, profile);
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

  const cookieStore = await cookies();
  const clientSession = await verifyClientSession(
    cookieStore.get(clientSessionCookieName)?.value,
  );
  const authenticatedBySession = clientSession?.email === previousEmail;

  if (!authenticatedBySession) {
    if (!password) {
      return Response.json({ error: "Session client requise." }, { status: 401 });
    }

    const passwordCheck = await verifyPassword(password, current[0].password);

    if (!passwordCheck.valid) {
      return Response.json({ error: "Mot de passe client incorrect." }, { status: 401 });
    }

    if (passwordCheck.needsRehash) {
      await query`
        UPDATE client_accounts
        SET password = ${await hashPassword(password)},
            updated_at = NOW()
        WHERE email = ${previousEmail}
      `;
    }
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

  return accountResponse(email, profile);
}
