export const legacyDraftStorageKey = "bgrumpy-devis-draft";
export const draftsStorageKey = "bgrumpy-devis-drafts";

export type DevisDraftRecord<Form = Record<string, unknown>> = {
  id: string;
  form: Form;
  step: number;
  createdAt: string;
  updatedAt: string;
};

type LegacyDraft<Form> = {
  form?: Form;
  step?: number;
};

const createDraftId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `draft-${Date.now()}-${Math.round(Math.random() * 100000)}`;
};

export const readDraftRecords = <Form>() => {
  try {
    const raw = window.localStorage.getItem(draftsStorageKey);
    const parsed = raw ? (JSON.parse(raw) as unknown) : [];

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter((item): item is DevisDraftRecord<Form> => {
      const draft = item as Partial<DevisDraftRecord<Form>>;

      return Boolean(draft.id && draft.form && draft.createdAt && draft.updatedAt);
    });
  } catch {
    window.localStorage.removeItem(draftsStorageKey);
    return [];
  }
};

export const writeDraftRecords = <Form>(drafts: DevisDraftRecord<Form>[]) => {
  window.localStorage.setItem(draftsStorageKey, JSON.stringify(drafts));
};

export const migrateLegacyDraft = <Form>() => {
  try {
    const raw = window.localStorage.getItem(legacyDraftStorageKey);

    if (!raw) {
      return readDraftRecords<Form>();
    }

    const legacy = JSON.parse(raw) as LegacyDraft<Form>;

    if (!legacy.form) {
      window.localStorage.removeItem(legacyDraftStorageKey);
      return readDraftRecords<Form>();
    }

    const drafts = readDraftRecords<Form>();
    const now = new Date().toISOString();
    const migratedDraft: DevisDraftRecord<Form> = {
      id: createDraftId(),
      form: legacy.form,
      step: typeof legacy.step === "number" ? legacy.step : 0,
      createdAt: now,
      updatedAt: now,
    };

    writeDraftRecords([migratedDraft, ...drafts]);
    window.localStorage.removeItem(legacyDraftStorageKey);

    return [migratedDraft, ...drafts];
  } catch {
    window.localStorage.removeItem(legacyDraftStorageKey);
    return readDraftRecords<Form>();
  }
};

export const upsertDraftRecord = <Form>(draft: {
  id?: string;
  form: Form;
  step: number;
}) => {
  const now = new Date().toISOString();
  const drafts = migrateLegacyDraft<Form>();
  const existing = draft.id ? drafts.find((item) => item.id === draft.id) : null;
  const id = draft.id ?? createDraftId();
  const nextDraft: DevisDraftRecord<Form> = {
    id,
    form: draft.form,
    step: draft.step,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };
  const nextDrafts = [
    nextDraft,
    ...drafts.filter((item) => item.id !== id),
  ];

  writeDraftRecords(nextDrafts);

  return nextDraft;
};

export const removeDraftRecord = <Form>(id: string) => {
  writeDraftRecords(readDraftRecords<Form>().filter((draft) => draft.id !== id));
};
