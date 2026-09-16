import { flashItems } from "@/src/data/flashItems";
import { flashSeptemberPublishedFlashs } from "@/src/data/flashSeptemberPublished";
import { hasStoredAdminState, readAdminState } from "@/src/lib/serverAdminStore";
import type { SeptemberFlash } from "./flashSeptember";

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

  return saved && state.flashSeptemberInitialized
    ? addKnownMetadata(state.flashSeptemberFlashs)
    : addKnownMetadata(flashSeptemberPublishedFlashs);
}
