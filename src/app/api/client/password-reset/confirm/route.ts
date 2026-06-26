import { createHash } from "node:crypto";
import { ensureDatabase, hasDatabase, query } from "@/src/lib/database";

export const runtime = "nodejs";

type PasswordResetConfirmRequest = {
  password?: string;
  token?: string;
};

const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");

export async function POST(request: Request) {
  if (!hasDatabase()) {
    return Response.json({ error: "Base de données non configurée." }, { status: 503 });
  }

  const body = (await request.json().catch(() => null)) as PasswordResetConfirmRequest | null;
  const token = body?.token?.trim() ?? "";
  const password = body?.password?.trim() ?? "";

  if (token.length < 20) {
    return Response.json({ error: "Lien de réinitialisation invalide." }, { status: 400 });
  }

  if (password.length < 4) {
    return Response.json({ error: "Le nouveau mot de passe doit contenir au moins 4 caractères." }, { status: 400 });
  }

  await ensureDatabase();
  const tokenHash = hashToken(token);
  const resetRows = await query<{ email: string }>`
    SELECT email
    FROM client_password_resets
    WHERE token_hash = ${tokenHash}
      AND used_at IS NULL
      AND expires_at > NOW()
    LIMIT 1
  `;
  const reset = resetRows[0];

  if (!reset) {
    return Response.json({ error: "Ce lien est expiré ou déjà utilisé." }, { status: 400 });
  }

  await query`
    UPDATE client_accounts
    SET password = ${password},
        updated_at = NOW()
    WHERE email = ${reset.email}
  `;
  await query`
    UPDATE client_password_resets
    SET used_at = NOW()
    WHERE token_hash = ${tokenHash}
  `;

  return Response.json({ ok: true });
}
