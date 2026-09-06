export const analyticsConsentStorageKey = "bgrumpy-analytics-consent-v2";
export const analyticsConsentVersion = "analytics-consent-v2";
export const analyticsConsentChangedEventName = "bgrumpy-analytics-consent-changed";

export type AnalyticsConsent = "accepted" | "refused";

export type AnalyticsConsentRecord = {
  decision: AnalyticsConsent;
  recordedAt: string;
  version: typeof analyticsConsentVersion;
};

const isBrowser = () => typeof window !== "undefined";

const isValidDate = (value: unknown) => typeof value === "string" && Number.isFinite(Date.parse(value));

export const readAnalyticsConsentRecord = (): AnalyticsConsentRecord | null => {
  if (!isBrowser()) {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(analyticsConsentStorageKey);
    const value = raw ? JSON.parse(raw) as Partial<AnalyticsConsentRecord> : null;
    const recordedAt = typeof value?.recordedAt === "string" ? value.recordedAt : "";

    if (
      value?.version === analyticsConsentVersion
      && (value.decision === "accepted" || value.decision === "refused")
      && isValidDate(recordedAt)
    ) {
      return {
        decision: value.decision,
        recordedAt,
        version: analyticsConsentVersion,
      };
    }

    return null;
  } catch {
    return null;
  }
};

export const readAnalyticsConsent = (): AnalyticsConsent | null => readAnalyticsConsentRecord()?.decision ?? null;

const notifyConsentChange = () => {
  if (isBrowser()) {
    window.dispatchEvent(new Event(analyticsConsentChangedEventName));
  }
};

export const setAnalyticsConsent = (value: AnalyticsConsent): AnalyticsConsentRecord | null => {
  if (!isBrowser()) {
    return null;
  }

  const record: AnalyticsConsentRecord = {
    decision: value,
    recordedAt: new Date().toISOString(),
    version: analyticsConsentVersion,
  };

  try {
    window.localStorage.setItem(analyticsConsentStorageKey, JSON.stringify(record));
  } catch {
    return null;
  }
  notifyConsentChange();
  return record;
};

export const resetAnalyticsConsent = () => {
  if (!isBrowser()) {
    return;
  }

  try {
    window.localStorage.removeItem(analyticsConsentStorageKey);
  } catch {
    return;
  }
  notifyConsentChange();
};

export const hasAnalyticsConsent = () => readAnalyticsConsent() === "accepted";
