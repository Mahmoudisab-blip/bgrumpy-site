import { neon } from "@neondatabase/serverless";

const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;

const sql = databaseUrl ? neon(databaseUrl) : null;

let schemaReady: Promise<void> | null = null;

export const hasDatabase = () => Boolean(sql);

export const query = async <Rows = unknown>(strings: TemplateStringsArray, ...values: unknown[]) => {
  if (!sql) {
    throw new Error("DATABASE_URL manquant.");
  }

  return sql(strings, ...values) as Promise<Rows[]>;
};

export const ensureDatabase = async () => {
  if (!sql) {
    return;
  }

  schemaReady ??= (async () => {
    await sql`
      CREATE TABLE IF NOT EXISTS app_kv (
        key TEXT PRIMARY KEY,
        value JSONB NOT NULL,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `;
    await sql`
      CREATE TABLE IF NOT EXISTS client_accounts (
        email TEXT PRIMARY KEY,
        password TEXT NOT NULL,
        profile JSONB NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `;
    await sql`
      CREATE TABLE IF NOT EXISTS client_password_resets (
        token_hash TEXT PRIMARY KEY,
        email TEXT NOT NULL,
        expires_at TIMESTAMPTZ NOT NULL,
        used_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `;
    await sql`
      CREATE TABLE IF NOT EXISTS devis_requests (
        id TEXT PRIMARY KEY,
        sent_at TIMESTAMPTZ NOT NULL,
        payload JSONB NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `;
    await sql`
      CREATE TABLE IF NOT EXISTS contact_messages (
        id TEXT PRIMARY KEY,
        sent_at TIMESTAMPTZ NOT NULL,
        payload JSONB NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `;
    await sql`
      CREATE TABLE IF NOT EXISTS admin_uploads (
        id TEXT PRIMARY KEY,
        kind TEXT NOT NULL CHECK (kind IN ('portfolio', 'flash', 'devis')),
        content_type TEXT NOT NULL,
        data_base64 TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `;
    await sql`
      ALTER TABLE admin_uploads
      DROP CONSTRAINT IF EXISTS admin_uploads_kind_check
    `;
    await sql`
      ALTER TABLE admin_uploads
      ADD CONSTRAINT admin_uploads_kind_check CHECK (kind IN ('portfolio', 'flash', 'devis'))
    `;
  })();

  await schemaReady;
};
