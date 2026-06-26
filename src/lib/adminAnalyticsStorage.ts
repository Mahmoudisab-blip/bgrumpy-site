import { readClientProfile } from "./clientProfileStorage";

export type AnalyticsContentKind = "flash" | "tattoo";

export type AnalyticsEventType =
  | "visit"
  | "content_view"
  | "content_like"
  | "content_unlike";

export type AnalyticsEvent = {
  id: string;
  type: AnalyticsEventType;
  path?: string;
  itemId?: string;
  itemKind?: AnalyticsContentKind;
  label: string;
  createdAt: string;
  visitorEmail?: string;
  visitorName?: string;
};

export type AnalyticsContentStats = {
  itemId: string;
  itemKind: AnalyticsContentKind;
  label: string;
  views: number;
  likes: number;
  updatedAt: string;
};

export type StoredAdminAnalytics = {
  totalVisits: number;
  visitsByPath: Record<string, number>;
  contentStats: Record<string, AnalyticsContentStats>;
  events: AnalyticsEvent[];
};

export const adminAnalyticsStorageKey = "bgrumpy-admin-analytics";
export const likedContentStorageKey = "bgrumpy-liked-content";

const emptyAnalytics: StoredAdminAnalytics = {
  totalVisits: 0,
  visitsByPath: {},
  contentStats: {},
  events: [],
};

const canUseStorage = () => typeof window !== "undefined" && "localStorage" in window;

const createEventId = () => `event-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const getContentKey = (kind: AnalyticsContentKind, itemId: string) => `${kind}:${itemId}`;

const addEvent = (analytics: StoredAdminAnalytics, event: Omit<AnalyticsEvent, "id" | "createdAt">) => ({
  ...analytics,
  events: [
    {
      ...event,
      id: createEventId(),
      createdAt: new Date().toISOString(),
    },
    ...analytics.events,
  ].slice(0, 120),
});

export const readAdminAnalytics = (): StoredAdminAnalytics => {
  if (!canUseStorage()) {
    return emptyAnalytics;
  }

  try {
    const raw = window.localStorage.getItem(adminAnalyticsStorageKey);
    const parsed = raw ? (JSON.parse(raw) as Partial<StoredAdminAnalytics>) : {};

    return {
      totalVisits: Number(parsed.totalVisits ?? 0),
      visitsByPath: parsed.visitsByPath ?? {},
      contentStats: parsed.contentStats ?? {},
      events: Array.isArray(parsed.events) ? parsed.events : [],
    };
  } catch {
    window.localStorage.removeItem(adminAnalyticsStorageKey);
    return emptyAnalytics;
  }
};

const writeAdminAnalytics = (analytics: StoredAdminAnalytics) => {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(adminAnalyticsStorageKey, JSON.stringify(analytics));
};

export const readLikedContent = () => {
  if (!canUseStorage()) {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(likedContentStorageKey);
    const parsed = raw ? JSON.parse(raw) : [];

    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : [];
  } catch {
    window.localStorage.removeItem(likedContentStorageKey);
    return [];
  }
};

const writeLikedContent = (likedContent: string[]) => {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(likedContentStorageKey, JSON.stringify(likedContent));
};

export const recordSiteVisit = (path: string) => {
  if (!canUseStorage() || path.startsWith("/admin")) {
    return;
  }

  const analytics = readAdminAnalytics();
  const profile = readClientProfile();
  const visitorName = [profile.prenom, profile.nom].map((value) => value.trim()).filter(Boolean).join(" ");
  const visitorEmail = profile.email.trim().toLowerCase();
  const nextAnalytics = addEvent(
    {
      ...analytics,
      totalVisits: analytics.totalVisits + 1,
      visitsByPath: {
        ...analytics.visitsByPath,
        [path]: (analytics.visitsByPath[path] ?? 0) + 1,
      },
    },
    {
      type: "visit",
      path,
      label: `Visite ${path}`,
      visitorEmail: visitorEmail || undefined,
      visitorName: visitorName || undefined,
    },
  );

  writeAdminAnalytics(nextAnalytics);
};

export const recordContentView = (
  itemKind: AnalyticsContentKind,
  itemId: string,
  label: string,
) => {
  if (!canUseStorage()) {
    return;
  }

  const analytics = readAdminAnalytics();
  const key = getContentKey(itemKind, itemId);
  const current = analytics.contentStats[key] ?? {
    itemId,
    itemKind,
    label,
    likes: 0,
    views: 0,
    updatedAt: new Date().toISOString(),
  };
  const updatedAt = new Date().toISOString();
  const nextAnalytics = addEvent(
    {
      ...analytics,
      contentStats: {
        ...analytics.contentStats,
        [key]: {
          ...current,
          label,
          views: current.views + 1,
          updatedAt,
        },
      },
    },
    {
      type: "content_view",
      itemId,
      itemKind,
      label: `Vue: ${label}`,
    },
  );

  writeAdminAnalytics(nextAnalytics);
};

export const setContentLiked = (
  itemKind: AnalyticsContentKind,
  itemId: string,
  label: string,
  liked: boolean,
) => {
  if (!canUseStorage()) {
    return [];
  }

  const contentKey = getContentKey(itemKind, itemId);
  const likedContent = readLikedContent();
  const wasLiked = likedContent.includes(contentKey);

  if (wasLiked === liked) {
    return likedContent;
  }

  const nextLikedContent = liked
    ? [...likedContent, contentKey]
    : likedContent.filter((item) => item !== contentKey);
  const analytics = readAdminAnalytics();
  const current = analytics.contentStats[contentKey] ?? {
    itemId,
    itemKind,
    label,
    likes: 0,
    views: 0,
    updatedAt: new Date().toISOString(),
  };
  const updatedAt = new Date().toISOString();
  const nextLikes = Math.max(0, current.likes + (liked ? 1 : -1));
  const nextAnalytics = addEvent(
    {
      ...analytics,
      contentStats: {
        ...analytics.contentStats,
        [contentKey]: {
          ...current,
          label,
          likes: nextLikes,
          updatedAt,
        },
      },
    },
    {
      type: liked ? "content_like" : "content_unlike",
      itemId,
      itemKind,
      label: liked ? `J'aime: ${label}` : `J'aime retiré: ${label}`,
    },
  );

  writeLikedContent(nextLikedContent);
  writeAdminAnalytics(nextAnalytics);

  return nextLikedContent;
};
