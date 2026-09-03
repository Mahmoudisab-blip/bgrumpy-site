import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { flashItems } from "@/src/data/flashItems";
import { portfolioItems } from "@/src/data/portfolioItems";
import { emptyAdminState, normalizeAdminState, type AdminState } from "./adminState";
import { ensureDatabase, hasDatabase, query } from "./database";

const storageKey = "admin-state";
const dataDirectory = path.join(process.cwd(), ".bgrumpy-data");
const stateFilePath = path.join(dataDirectory, "admin-state.json");

const readFileState = async () => {
  try {
    const raw = await readFile(stateFilePath, "utf8");
    return normalizeAdminState(JSON.parse(raw) as Partial<AdminState>);
  } catch {
    return emptyAdminState;
  }
};

export const readAdminState = async () => {
  if (!hasDatabase()) {
    return readFileState();
  }

  await ensureDatabase();
  const rows = await query<{ value: Partial<AdminState> }>`
    SELECT value FROM app_kv WHERE key = ${storageKey} LIMIT 1
  `;

  return normalizeAdminState(rows[0]?.value);
};

export const hasStoredAdminState = async () => {
  if (!hasDatabase()) {
    try {
      await readFile(stateFilePath, "utf8");
      return true;
    } catch {
      return false;
    }
  }

  await ensureDatabase();
  const rows = await query<{ key: string }>`
    SELECT key FROM app_kv WHERE key = ${storageKey} LIMIT 1
  `;

  return Boolean(rows[0]);
};

export const writeAdminState = async (value: AdminState) => {
  const state = normalizeAdminState(value);

  if (!hasDatabase()) {
    await mkdir(dataDirectory, { recursive: true });
    await writeFile(stateFilePath, JSON.stringify(state, null, 2), "utf8");
    return state;
  }

  await ensureDatabase();
  await query`
    INSERT INTO app_kv (key, value, updated_at)
    VALUES (${storageKey}, ${JSON.stringify(state)}::jsonb, NOW())
    ON CONFLICT (key) DO UPDATE SET
      value = EXCLUDED.value,
      updated_at = NOW()
  `;

  return state;
};

const staticPortfolio = portfolioItems.map((item) => ({
  ...item,
  availability: "Publié" as const,
  featured: item.id === "psykokwak-bras",
  price: 0,
  size: "À renseigner",
  style: item.category,
}));

const staticFlashs = flashItems.map((item) => ({
  ...item,
  availability: item.status === "Réservé" ? ("Réservé" as const) : ("Disponible" as const),
}));

export const listPublishedPortfolio = async () => {
  const saved = await hasStoredAdminState();
  const state = await readAdminState();
  const items = saved && state.contentInitialized ? state.portfolio : staticPortfolio;

  return items.filter((item) => (item.availability ?? "Publié") === "Publié");
};

export const listPublishedFlashs = async () => {
  const saved = await hasStoredAdminState();
  const state = await readAdminState();
  const items = saved && state.contentInitialized ? state.flashs : staticFlashs;

  return items.filter((item) => (item.availability ?? "Disponible") !== "Vendu");
};
