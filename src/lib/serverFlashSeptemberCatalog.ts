import { flashItems } from "@/src/data/flashItems";
import { flashSeptemberPublishedFlashs } from "@/src/data/flashSeptemberPublished";
import { hasStoredAdminState, readAdminState } from "@/src/lib/serverAdminStore";
import { listPaidFlashSeptemberIds } from "@/src/lib/serverFlashSeptemberBookings";
import { createSeptemberFilterOptions, type SeptemberFilterOptions, type SeptemberFlash } from "./flashSeptember";

const knownFlashMetadataBySlot = new Map(
  flashItems.map((item, index) => [index + 1, item]),
);

function addKnownMetadata(items: SeptemberFlash[]) {
  return items.map((item) => {
    if (Object.prototype.hasOwnProperty.call(item, "categories")) return item;

    const slot = Number(item.id.match(/(\d+)$/)?.[1]);
    const knownFlash = knownFlashMetadataBySlot.get(slot);

    if (!knownFlash) return item;

    return {
      ...item,
      categories: [...knownFlash.themes],
      size: item.size ?? knownFlash.size,
      style: item.style ?? knownFlash.style,
      placement: item.placement ?? knownFlash.placement,
    };
  });
}

export async function listSeptemberFlashs(): Promise<SeptemberFlash[]> {
  const saved = await hasStoredAdminState();
  const state = await readAdminState();
  const items = saved && state.flashSeptemberInitialized
    ? addKnownMetadata(state.flashSeptemberFlashs)
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
