import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { ensureDatabase, hasDatabase, query } from "./database";

export type StoredServerDevis = {
  id: string;
  sentAt: string;
  payload: {
    nom?: string;
    prenom?: string;
    portable?: string;
    email?: string;
    majeur?: string;
    age?: string;
    devis?: string;
    flashId?: string;
    flashIds?: string[];
    budget?: number;
    projet?: string;
    zone?: string | string[];
    taille?: number;
    disponibilites?: string[];
    reglement?: string | string[];
    commentaires?: string;
    spams?: boolean;
    demenagement?: boolean;
    copie?: boolean;
    referencePhotos?: Array<{
      id: string;
      name: string;
      url: string;
    }>;
    references?: string[];
    selectedFlashes?: Array<{
      id: string;
      reference: string;
      title: string;
      image: {
        src: string;
        alt: string;
      };
    }>;
  };
};

const dataDirectory = path.join(process.cwd(), ".bgrumpy-data");
const devisFilePath = path.join(dataDirectory, "devis.json");

const readStoredDevis = async () => {
  try {
    const raw = await readFile(devisFilePath, "utf8");
    const parsed = JSON.parse(raw);

    return Array.isArray(parsed) ? (parsed as StoredServerDevis[]) : [];
  } catch {
    return [];
  }
};

const writeStoredDevis = async (items: StoredServerDevis[]) => {
  await mkdir(dataDirectory, { recursive: true });
  await writeFile(devisFilePath, JSON.stringify(items, null, 2), "utf8");
};

export const listServerDevis = async () => {
  if (!hasDatabase()) {
    return readStoredDevis();
  }

  await ensureDatabase();
  const rows = await query<{
    id: string;
    sent_at: string | Date;
    payload: StoredServerDevis["payload"];
  }>`
    SELECT id, sent_at, payload
    FROM devis_requests
    ORDER BY sent_at DESC
  `;

  return rows.map((row) => ({
    id: row.id,
    payload: row.payload,
    sentAt: row.sent_at instanceof Date ? row.sent_at.toISOString() : new Date(row.sent_at).toISOString(),
  }));
};

export const addServerDevis = async (payload: StoredServerDevis["payload"]) => {
  const sentAt = new Date().toISOString();
  const item: StoredServerDevis = {
    id: `devis-${Date.now()}`,
    payload,
    sentAt,
  };
  if (hasDatabase()) {
    await ensureDatabase();
    await query`
      INSERT INTO devis_requests (id, sent_at, payload)
      VALUES (${item.id}, ${sentAt}, ${JSON.stringify(payload)}::jsonb)
      ON CONFLICT (id) DO UPDATE SET
        sent_at = EXCLUDED.sent_at,
        payload = EXCLUDED.payload
    `;

    return item;
  }

  const existing = await readStoredDevis();

  await writeStoredDevis([item, ...existing.filter((devis) => devis.id !== item.id)]);

  return item;
};
