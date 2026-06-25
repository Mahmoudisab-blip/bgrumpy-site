import { ensureDatabase, hasDatabase, query } from "@/src/lib/database";
import type { StoredMessagerie } from "@/src/lib/messagerieStorage";

export const runtime = "nodejs";

const storageKey = "messagerie";

const emptyMessagerie: StoredMessagerie = {
  threads: [],
  messages: [],
};

const normalizeMessagerie = (value: Partial<StoredMessagerie> | null): StoredMessagerie => ({
  activeThreadId: typeof value?.activeThreadId === "string" ? value.activeThreadId : undefined,
  messages: Array.isArray(value?.messages) ? value.messages : [],
  threads: Array.isArray(value?.threads) ? value.threads : [],
});

export async function GET() {
  if (!hasDatabase()) {
    return Response.json(emptyMessagerie);
  }

  await ensureDatabase();
  const rows = await query<{ value: StoredMessagerie }>`
    SELECT value FROM app_kv WHERE key = ${storageKey} LIMIT 1
  `;

  return Response.json(normalizeMessagerie(rows[0]?.value ?? null));
}

export async function PUT(request: Request) {
  if (!hasDatabase()) {
    return Response.json({ ok: false, error: "Base de données non configurée." }, { status: 503 });
  }

  const body = (await request.json().catch(() => null)) as Partial<StoredMessagerie> | null;
  const messagerie = normalizeMessagerie(body);

  await ensureDatabase();
  await query`
    INSERT INTO app_kv (key, value, updated_at)
    VALUES (${storageKey}, ${JSON.stringify(messagerie)}::jsonb, NOW())
    ON CONFLICT (key) DO UPDATE SET
      value = EXCLUDED.value,
      updated_at = NOW()
  `;

  return Response.json({ ok: true });
}

