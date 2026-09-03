import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { ensureDatabase, hasDatabase, query } from "./database";

export type ContactPayload = {
  name: string;
  email: string;
  phone?: string;
  message: string;
  consent: boolean;
};

export type StoredContactMessage = {
  id: string;
  sentAt: string;
  payload: ContactPayload;
};

const dataDirectory = path.join(process.cwd(), ".bgrumpy-data");
const contactsFilePath = path.join(dataDirectory, "contacts.json");

const readStoredContacts = async () => {
  try {
    const raw = await readFile(contactsFilePath, "utf8");
    const parsed = JSON.parse(raw);

    return Array.isArray(parsed) ? (parsed as StoredContactMessage[]) : [];
  } catch {
    return [];
  }
};

const writeStoredContacts = async (items: StoredContactMessage[]) => {
  await mkdir(dataDirectory, { recursive: true });
  await writeFile(contactsFilePath, JSON.stringify(items, null, 2), "utf8");
};

export const addServerContact = async (payload: ContactPayload) => {
  const sentAt = new Date().toISOString();
  const item: StoredContactMessage = {
    id: `contact-${Date.now()}`,
    payload,
    sentAt,
  };

  if (hasDatabase()) {
    await ensureDatabase();
    await query`
      INSERT INTO contact_messages (id, sent_at, payload)
      VALUES (${item.id}, ${sentAt}, ${JSON.stringify(payload)}::jsonb)
      ON CONFLICT (id) DO UPDATE SET
        sent_at = EXCLUDED.sent_at,
        payload = EXCLUDED.payload
    `;

    return item;
  }

  const existing = await readStoredContacts();
  await writeStoredContacts([item, ...existing.filter((contact) => contact.id !== item.id)]);

  return item;
};

export const listServerContacts = async () => {
  if (!hasDatabase()) {
    return readStoredContacts();
  }

  await ensureDatabase();
  const rows = await query<{
    id: string;
    sent_at: string | Date;
    payload: ContactPayload;
  }>`
    SELECT id, sent_at, payload
    FROM contact_messages
    ORDER BY sent_at DESC
  `;

  return rows.map((row) => ({
    id: row.id,
    payload: row.payload,
    sentAt: row.sent_at instanceof Date ? row.sent_at.toISOString() : new Date(row.sent_at).toISOString(),
  }));
};
