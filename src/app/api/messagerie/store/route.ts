import { cookies } from "next/headers";
import { adminSessionCookieName, verifyAdminSession } from "@/src/lib/adminAuth";
import { clientSessionCookieName, verifyClientSession } from "@/src/lib/clientAuth";
import { ensureDatabase, hasDatabase, query } from "@/src/lib/database";
import type { MessagerieMessage, MessagerieThread, StoredMessagerie } from "@/src/lib/messagerieStorage";

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

const normalizeEmail = (email: string) => email.trim().toLowerCase();

const getThreadEmail = (thread: MessagerieThread, messages: MessagerieMessage[]) => {
  if (thread.clientEmail) {
    return normalizeEmail(thread.clientEmail);
  }

  const threadMessages = messages.filter((message) => message.threadId === thread.id);
  const text = threadMessages.map((message) => message.text).join("\n");
  const match = text.match(/Adresse mail:\s*([^\s]+)/i);

  return normalizeEmail(match?.[1] ?? "");
};

const filterMessagerieForEmail = (messagerie: StoredMessagerie, email: string): StoredMessagerie => {
  const normalizedEmail = normalizeEmail(email);

  if (!normalizedEmail) {
    return emptyMessagerie;
  }

  const threads = messagerie.threads.filter((thread) => getThreadEmail(thread, messagerie.messages) === normalizedEmail);
  const threadIds = new Set(threads.map((thread) => thread.id));
  const messages = messagerie.messages.filter((message) => threadIds.has(message.threadId));
  const activeThreadId = messagerie.activeThreadId && threadIds.has(messagerie.activeThreadId)
    ? messagerie.activeThreadId
    : threads[0]?.id;

  return { activeThreadId, messages, threads };
};

const readGlobalMessagerie = async () => {
  if (!hasDatabase()) {
    return emptyMessagerie;
  }

  await ensureDatabase();
  const rows = await query<{ value: StoredMessagerie }>`
    SELECT value FROM app_kv WHERE key = ${storageKey} LIMIT 1
  `;

  return normalizeMessagerie(rows[0]?.value ?? null);
};

const writeGlobalMessagerie = async (messagerie: StoredMessagerie) => {
  await ensureDatabase();
  await query`
    INSERT INTO app_kv (key, value, updated_at)
    VALUES (${storageKey}, ${JSON.stringify(messagerie)}::jsonb, NOW())
    ON CONFLICT (key) DO UPDATE SET
      value = EXCLUDED.value,
      updated_at = NOW()
  `;
};

export async function GET() {
  const cookieStore = await cookies();
  const isAdmin = await verifyAdminSession(cookieStore.get(adminSessionCookieName)?.value);
  const clientSession = verifyClientSession(cookieStore.get(clientSessionCookieName)?.value);
  const messagerie = await readGlobalMessagerie();

  if (isAdmin) {
    return Response.json(messagerie);
  }

  if (clientSession?.email) {
    return Response.json(filterMessagerieForEmail(messagerie, clientSession.email));
  }

  return Response.json(emptyMessagerie, { status: 401 });
}

export async function PUT(request: Request) {
  if (!hasDatabase()) {
    return Response.json({ ok: false, error: "Base de données non configurée." }, { status: 503 });
  }

  const body = (await request.json().catch(() => null)) as Partial<StoredMessagerie> | null;
  const messagerie = normalizeMessagerie(body);
  const cookieStore = await cookies();
  const isAdmin = await verifyAdminSession(cookieStore.get(adminSessionCookieName)?.value);
  const clientSession = verifyClientSession(cookieStore.get(clientSessionCookieName)?.value);

  if (isAdmin) {
    await writeGlobalMessagerie(messagerie);
    return Response.json({ ok: true });
  }

  if (!clientSession?.email) {
    return Response.json({ ok: false, error: "Session client manquante." }, { status: 401 });
  }

  const globalMessagerie = await readGlobalMessagerie();
  const incomingThreadIds = new Set(messagerie.threads.map((thread) => thread.id));
  const ownedThreadIds = new Set(
    globalMessagerie.threads
      .filter((thread) => getThreadEmail(thread, globalMessagerie.messages) === clientSession.email)
      .map((thread) => thread.id),
  );
  const nextThreads = [
    ...globalMessagerie.threads.filter((thread) => !ownedThreadIds.has(thread.id) && !incomingThreadIds.has(thread.id)),
    ...messagerie.threads.map((thread) => ({
      ...thread,
      clientEmail: clientSession.email,
    })),
  ];
  const nextThreadIds = new Set(nextThreads.map((thread) => thread.id));
  const nextMessages = [
    ...globalMessagerie.messages.filter(
      (message) => nextThreadIds.has(message.threadId) && !ownedThreadIds.has(message.threadId) && !incomingThreadIds.has(message.threadId),
    ),
    ...messagerie.messages.filter((message) => incomingThreadIds.has(message.threadId)),
  ];

  await writeGlobalMessagerie({
    activeThreadId: messagerie.activeThreadId,
    messages: nextMessages,
    threads: nextThreads,
  });

  return Response.json({ ok: true });
}
