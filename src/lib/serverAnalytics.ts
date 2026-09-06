import { ensureDatabase, hasDatabase, query } from "./database";

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

export const recordServerVisit = async ({
  path,
  referrer,
  userAgent,
  visitorId,
}: {
  path: string;
  referrer?: string | null;
  userAgent?: string | null;
  visitorId: string;
}) => {
  if (!hasDatabase() || !isTrackablePath(path) || isLikelyBot(userAgent ?? null)) {
    return;
  }

  await ensureDatabase();
  await query`
    INSERT INTO site_analytics_events (id, visitor_id, path, referrer)
    VALUES (${crypto.randomUUID()}, ${visitorId}, ${path}, ${referrer?.slice(0, 500) || null})
  `;
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
