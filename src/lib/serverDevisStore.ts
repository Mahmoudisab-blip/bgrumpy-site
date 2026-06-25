import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

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
    zone?: string;
    taille?: number;
    disponibilites?: string[];
    reglement?: string;
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

export const listServerDevis = async () => readStoredDevis();

export const addServerDevis = async (payload: StoredServerDevis["payload"]) => {
  const sentAt = new Date().toISOString();
  const item: StoredServerDevis = {
    id: `server-devis-${Date.now()}`,
    payload,
    sentAt,
  };
  const existing = await readStoredDevis();

  await writeStoredDevis([item, ...existing.filter((devis) => devis.id !== item.id)]);

  return item;
};
