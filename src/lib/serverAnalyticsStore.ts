import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import type { AnalyticsEvent, StoredAdminAnalytics } from "./adminAnalyticsStorage";
import { ensureDatabase, hasDatabase, query } from "./database";

type StoredVisit = {
  id: string;
  visitorId: string;
  path: string;
  createdAt: string;
};

const dataDirectory = path.join(process.cwd(), ".bgrumpy-data");
const analyticsFilePath = path.join(dataDirectory, "analytics.json");

const toPath = (value: string) => {
  const trimmed = value.trim();

  if (!trimmed || !trimmed.startsWith("/")) {
    return "/";
  }

  return trimmed.split("#", 1)[0].slice(0, 240) || "/";
};

const toIso = (value: string | Date) => {
  const date = value instanceof Date ? value : new Date(value);

  return Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
};

const emptyAnalytics = (): StoredAdminAnalytics => ({
  totalVisits: 0,
  uniqueVisitors: 0,
  visitsLast7Days: 0,
  visitsLast30Days: 0,
  uniqueVisitorsLast7Days: 0,
  uniqueVisitorsLast30Days: 0,
  visitsByPath: {},
  contentStats: {},
  events: [],
});

const readFileVisits = async (): Promise<StoredVisit[]> => {
  try {
    const raw = await readFile(analyticsFilePath, "utf8");
    const parsed = JSON.parse(raw);

    return Array.isArray(parsed)
      ? parsed.filter(
          (item): item is StoredVisit =>
              typeof item?.id === "string" &&
              typeof item?.visitorId === "string" &&
              typeof item?.path === "string" &&
              typeof item?.createdAt === "string",
        )
      : [];
  } catch {
    return [];
  }
};

const writeFileVisits = async (visits: StoredVisit[]) => {
  await mkdir(dataDirectory, { recursive: true });
  await writeFile(analyticsFilePath, JSON.stringify(visits.slice(-10000), null, 2), "utf8");
};

const buildAnalyticsFromVisits = (visits: StoredVisit[]): StoredAdminAnalytics => {
  const now = Date.now();
  const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
  const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;
  const visitsByPath: Record<string, number> = {};
  const allVisitors = new Set<string>();
  const recentVisitors = new Set<string>();
  const monthVisitors = new Set<string>();

  visits.forEach((visit) => {
    const createdAt = new Date(visit.createdAt).getTime();
    const visitPath = toPath(visit.path);

    visitsByPath[visitPath] = (visitsByPath[visitPath] ?? 0) + 1;
    allVisitors.add(visit.visitorId);

    if (createdAt >= sevenDaysAgo) {
      recentVisitors.add(visit.visitorId);
    }

    if (createdAt >= thirtyDaysAgo) {
      monthVisitors.add(visit.visitorId);
    }
  });

  const events: AnalyticsEvent[] = [...visits]
    .sort((first, second) => second.createdAt.localeCompare(first.createdAt))
    .slice(0, 120)
    .map((visit) => ({
      id: visit.id,
      type: "visit" as const,
      path: toPath(visit.path),
      label: `Visite ${toPath(visit.path)}`,
      createdAt: toIso(visit.createdAt),
    }));

  return {
    ...emptyAnalytics(),
    totalVisits: visits.length,
    uniqueVisitors: allVisitors.size,
    visitsLast7Days: visits.filter((visit) => new Date(visit.createdAt).getTime() >= sevenDaysAgo).length,
    visitsLast30Days: visits.filter((visit) => new Date(visit.createdAt).getTime() >= thirtyDaysAgo).length,
    uniqueVisitorsLast7Days: recentVisitors.size,
    uniqueVisitorsLast30Days: monthVisitors.size,
    visitsByPath,
    events,
  };
};

export const recordServerSiteVisit = async (visitorId: string, pathValue: string) => {
  const visit: StoredVisit = {
    id: `visit-${randomUUID()}`,
    visitorId: visitorId.slice(0, 100),
    path: toPath(pathValue),
    createdAt: new Date().toISOString(),
  };

  if (hasDatabase()) {
    await ensureDatabase();
    await query`
      INSERT INTO site_analytics_events (id, visitor_id, path, created_at)
      VALUES (${visit.id}, ${visit.visitorId}, ${visit.path}, ${visit.createdAt})
    `;

    return;
  }

  const visits = await readFileVisits();
  await writeFileVisits([...visits, visit]);
};

export const readServerAnalytics = async (): Promise<StoredAdminAnalytics> => {
  if (!hasDatabase()) {
    return buildAnalyticsFromVisits(await readFileVisits());
  }

  await ensureDatabase();
  const [summaryRows, pathRows, eventRows] = await Promise.all([
    query<{
      total_visits: number | string;
      unique_visitors: number | string;
      visits_last_7_days: number | string;
      visits_last_30_days: number | string;
      unique_visitors_last_7_days: number | string;
      unique_visitors_last_30_days: number | string;
    }>`
      SELECT
        COUNT(*)::int AS total_visits,
        COUNT(DISTINCT visitor_id)::int AS unique_visitors,
        COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days')::int AS visits_last_7_days,
        COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days')::int AS visits_last_30_days,
        COUNT(DISTINCT visitor_id) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days')::int AS unique_visitors_last_7_days,
        COUNT(DISTINCT visitor_id) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days')::int AS unique_visitors_last_30_days
      FROM site_analytics_events
    `,
    query<{ path: string; visits: number | string }>`
      SELECT path, COUNT(*)::int AS visits
      FROM site_analytics_events
      GROUP BY path
      ORDER BY visits DESC
    `,
    query<{ id: string; path: string; created_at: string | Date }>`
      SELECT id, path, created_at
      FROM site_analytics_events
      ORDER BY created_at DESC
      LIMIT 120
    `,
  ]);

  const summary = summaryRows[0];
  const analytics = emptyAnalytics();

  analytics.totalVisits = Number(summary?.total_visits ?? 0);
  analytics.uniqueVisitors = Number(summary?.unique_visitors ?? 0);
  analytics.visitsLast7Days = Number(summary?.visits_last_7_days ?? 0);
  analytics.visitsLast30Days = Number(summary?.visits_last_30_days ?? 0);
  analytics.uniqueVisitorsLast7Days = Number(summary?.unique_visitors_last_7_days ?? 0);
  analytics.uniqueVisitorsLast30Days = Number(summary?.unique_visitors_last_30_days ?? 0);
  analytics.visitsByPath = Object.fromEntries(
    pathRows.map((row) => [toPath(row.path), Number(row.visits ?? 0)]),
  );
  analytics.events = eventRows.map((row) => ({
    id: row.id,
    type: "visit" as const,
    path: toPath(row.path),
    label: `Visite ${toPath(row.path)}`,
    createdAt: toIso(row.created_at),
  }));

  return analytics;
};
