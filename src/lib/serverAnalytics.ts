import { ensureDatabase, hasDatabase, query } from "./database";
import { analyticsConsentVersion } from "./analyticsConsent";

export type ServerAnalyticsEvent = {
  id: string;
  type: "visit";
  path: string;
  label: string;
  createdAt: string;
};

export type ServerAnalytics = {
  totalVisits: number;
  uniqueVisitors: number;
  visitsByPath: Record<string, number>;
  events: ServerAnalyticsEvent[];
};

const emptyAnalytics: ServerAnalytics = {
  totalVisits: 0,
  uniqueVisitors: 0,
  visitsByPath: {},
  events: [],
};

const botPattern = /bot|crawler|spider|headless|preview|lighthouse/i;

export const isTrackablePath = (path: string) =>
  path.startsWith("/") && !path.startsWith("/admin") && !path.startsWith("/_next");

export const isLikelyBot = (userAgent: string | null) => Boolean(userAgent && botPattern.test(userAgent));

const anonymizeReferrer = (referrer?: string | null) => {
  if (!referrer) {
    return null;
  }

  try {
    const url = new URL(referrer);
    return url.protocol === "http:" || url.protocol === "https:" ? url.origin : null;
  } catch {
    return null;
  }
};

export const recordServerVisit = async ({
  path,
  referrer,
  userAgent,
  visitorId,
  consented,
  consentVersion,
  consentRecordedAt,
}: {
  path: string;
  referrer?: string | null;
  userAgent?: string | null;
  visitorId: string;
  consented: boolean;
  consentVersion: string;
  consentRecordedAt: string;
}) => {
  if (
    !consented
    || consentVersion !== analyticsConsentVersion
    || !Number.isFinite(Date.parse(consentRecordedAt))
    || !hasDatabase()
    || !isTrackablePath(path)
    || isLikelyBot(userAgent ?? null)
  ) {
    return;
  }

  await ensureDatabase();
  await query`
    INSERT INTO site_analytics_events (id, visitor_id, path, referrer, consent_version, consent_recorded_at)
    VALUES (${crypto.randomUUID()}, ${visitorId}, ${path}, ${anonymizeReferrer(referrer)}, ${consentVersion}, ${consentRecordedAt})
  `;
  await query`
    DELETE FROM site_analytics_events
    WHERE created_at < NOW() - INTERVAL '13 months'
  `;
};

export const recordServerAnalyticsConsent = async ({
  decision,
  version,
  recordedAt,
}: {
  decision: "accepted" | "refused";
  version: string;
  recordedAt: string;
}) => {
  if (
    !hasDatabase()
    || version !== analyticsConsentVersion
    || !Number.isFinite(Date.parse(recordedAt))
  ) {
    return false;
  }

  await ensureDatabase();
  await query`
    INSERT INTO site_analytics_consents (id, decision, consent_version, consent_recorded_at)
    VALUES (${crypto.randomUUID()}, ${decision}, ${version}, ${recordedAt})
  `;
  await query`
    DELETE FROM site_analytics_consents
    WHERE created_at < NOW() - INTERVAL '13 months'
  `;

  return true;
};

export const readServerAnalytics = async (): Promise<ServerAnalytics> => {
  if (!hasDatabase()) {
    return emptyAnalytics;
  }

  await ensureDatabase();
  const [summaryRows, pathRows, eventRows] = await Promise.all([
    query<{ total_visits: number; unique_visitors: number }>`
      SELECT COUNT(*)::int AS total_visits, COUNT(DISTINCT visitor_id)::int AS unique_visitors
      FROM site_analytics_events
    `,
    query<{ path: string; visits: number }>`
      SELECT path, COUNT(*)::int AS visits
      FROM site_analytics_events
      GROUP BY path
      ORDER BY visits DESC
      LIMIT 50
    `,
    query<{ id: string; path: string; created_at: string }>`
      SELECT id, path, created_at
      FROM site_analytics_events
      WHERE created_at >= NOW() - INTERVAL '8 weeks'
      ORDER BY created_at DESC
      LIMIT 2000
    `,
  ]);

  return {
    totalVisits: Number(summaryRows[0]?.total_visits ?? 0),
    uniqueVisitors: Number(summaryRows[0]?.unique_visitors ?? 0),
    visitsByPath: Object.fromEntries(pathRows.map((row) => [row.path, Number(row.visits)])),
    events: eventRows.map((row) => ({
      id: row.id,
      type: "visit" as const,
      path: row.path,
      label: `Visite ${row.path}`,
      createdAt: new Date(row.created_at).toISOString(),
    })),
  };
};
