import {
  FLASH_SEPTEMBER_ASSET_VERSION,
  FLASH_SEPTEMBER_LEGACY_FLASH_COUNT,
  FLASH_SEPTEMBER_METADATA_VERSION,
  FLASH_SEPTEMBER_RETIRED_FLASH_IDS,
  flashSeptemberPublishedFlashs,
} from "@/src/data/flashSeptemberPublished";
import { hasStoredAdminState, readAdminState } from "@/src/lib/serverAdminStore";
import { listPaidFlashSeptemberIds } from "@/src/lib/serverFlashSeptemberBookings";
import { createSeptemberFilterOptions, type SeptemberFilterOptions, type SeptemberFlash } from "./flashSeptember";

const publishedFlashMetadataById = new Map(
  flashSeptemberPublishedFlashs.map((item) => [item.id, item]),
);

const newlyBundledFlashIds = new Set(
  flashSeptemberPublishedFlashs
    .filter((item) => Number(item.reference.slice(1)) > FLASH_SEPTEMBER_LEGACY_FLASH_COUNT)
    .map((item) => item.id),
);

const genericThemeCategories = new Set([
  "animaux",
  "fantaisie",
  "nature",
  "objets",
  "personnage",
  "portrait",
]);

const specificFranchiseCategories = new Set([
  "ghibli",
  "harry potter",
  "jujutsu kaisen",
  "naruto",
  "one piece",
  "pokemon",
  "sailor moon",
]);

function getPrimaryTheme(item: SeptemberFlash) {
  const categories = item.categories ?? [];
  const franchise = categories.find((category) =>
    specificFranchiseCategories.has(category.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("fr-FR")),
  );
  if (franchise) return franchise;

  const subject = categories.find((category) =>
    !genericThemeCategories.has(category.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("fr-FR")),
  );

  // Keep untagged/custom flashes in their own stable lane instead of grouping
  // them into an arbitrary theme or changing their saved metadata.
  return subject ?? `sans-theme:${item.id}`;
}

function interleaveFlashThemes(items: SeptemberFlash[]) {
  const themes = new Map<string, SeptemberFlash[]>();

  for (const item of items) {
    const theme = getPrimaryTheme(item);
    const group = themes.get(theme) ?? [];
    group.push(item);
    themes.set(theme, group);
  }

  const groups = Array.from(themes.values());
  const mixed: SeptemberFlash[] = [];
  let remaining = items.length;

  while (remaining > 0) {
    for (const group of groups) {
      const item = group.shift();
      if (!item) continue;

      mixed.push(item);
      remaining -= 1;
    }
  }

  return mixed;
}

const withCurrentBundledAssetVersion = (src: string) => {
  if (!src.includes("/flash-septembre/flashes/")) return src;

  const [pathname] = src.split("?");
  return `${pathname}?v=${FLASH_SEPTEMBER_ASSET_VERSION}`;
};

function addKnownMetadata(items: SeptemberFlash[]) {
  return items.map((item) => {
    const knownFlash = publishedFlashMetadataById.get(item.id);

    if (!knownFlash) {
      return item.image?.src
        ? {
            ...item,
            image: {
              ...item.image,
              src: withCurrentBundledAssetVersion(item.image.src),
            },
          }
        : item;
    }

    const merged = {
      ...knownFlash,
      ...item,
    };

    // The persisted admin catalogue can still contain the old static image
    // URL. Keep the admin record, but always point bundled September flashes
    // to the current cleaned asset revision so Vercel/CDN/browser caches cannot
    // resurrect an earlier crop.
    if (merged.image?.src) {
      merged.image = {
        ...merged.image,
        src: withCurrentBundledAssetVersion(merged.image.src),
      };
    }

    // The admin catalogue is persisted, so apply a newer curated metadata set
    // once without overwriting later admin changes or reservation status.
    if (item.metadataVersion !== FLASH_SEPTEMBER_METADATA_VERSION) {
      return {
        ...merged,
        title: knownFlash.title,
        description: knownFlash.description,
        categories: knownFlash.categories,
        style: knownFlash.style,
        searchTerms: knownFlash.searchTerms,
        origin: knownFlash.origin,
        metadataVersion: FLASH_SEPTEMBER_METADATA_VERSION,
      };
    }

    return merged;
  });
}

export async function listSeptemberFlashs(): Promise<SeptemberFlash[]> {
  const saved = await hasStoredAdminState();
  const state = await readAdminState();
  const deletedFlashIds = new Set([
    ...state.deletedFlashSeptemberIds,
    ...FLASH_SEPTEMBER_RETIRED_FLASH_IDS,
  ]);
  const items = (saved && state.flashSeptemberInitialized
    ? addKnownMetadata([
        ...state.flashSeptemberFlashs,
        ...flashSeptemberPublishedFlashs.filter((item) => (
          newlyBundledFlashIds.has(item.id)
          && !deletedFlashIds.has(item.id)
          && !state.flashSeptemberFlashs.some((storedItem) => storedItem.id === item.id)
        )),
      ])
    : addKnownMetadata(flashSeptemberPublishedFlashs)).filter((item) => !deletedFlashIds.has(item.id));

  const paidFlashIds = await listPaidFlashSeptemberIds();

  const withBookingStatus = items.map((item) => paidFlashIds.has(item.id)
    ? { ...item, status: "Réservé" as const }
    : item);

  return interleaveFlashThemes(withBookingStatus);
}

export async function listSeptemberFilterOptions(): Promise<SeptemberFilterOptions> {
  const saved = await hasStoredAdminState();
  const state = await readAdminState();

  return saved && state.flashSeptemberInitialized
    ? state.flashSeptemberFilters
    : createSeptemberFilterOptions();
}
