import {
  FLASH_SEPTEMBER_LEGACY_FLASH_COUNT,
  FLASH_SEPTEMBER_METADATA_VERSION,
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

function addKnownMetadata(items: SeptemberFlash[]) {
  return items.map((item) => {
    const knownFlash = publishedFlashMetadataById.get(item.id);

    if (!knownFlash) return item;

    const merged = {
      ...knownFlash,
      ...item,
    };

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
        metadataVersion: FLASH_SEPTEMBER_METADATA_VERSION,
      };
    }

    return merged;
  });
}

export async function listSeptemberFlashs(): Promise<SeptemberFlash[]> {
  const saved = await hasStoredAdminState();
  const state = await readAdminState();
  const items = saved && state.flashSeptemberInitialized
    ? addKnownMetadata([
        ...state.flashSeptemberFlashs,
        ...flashSeptemberPublishedFlashs.filter((item) => (
          newlyBundledFlashIds.has(item.id)
          && !state.flashSeptemberFlashs.some((storedItem) => storedItem.id === item.id)
        )),
      ])
    : addKnownMetadata(flashSeptemberPublishedFlashs);

  const paidFlashIds = await listPaidFlashSeptemberIds();

  return items.map((item) => paidFlashIds.has(item.id)
    ? { ...item, status: "Réservé" as const }
    : item);
}

export async function listSeptemberFilterOptions(): Promise<SeptemberFilterOptions> {
  const saved = await hasStoredAdminState();
  const state = await readAdminState();

  return saved && state.flashSeptemberInitialized
    ? state.flashSeptemberFilters
    : createSeptemberFilterOptions();
}
