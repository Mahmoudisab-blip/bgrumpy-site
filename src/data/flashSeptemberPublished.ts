import type { SeptemberFlash } from "@/src/lib/flashSeptember";
import { flashSeptemberAdditionalMetadataBySlot } from "./flashSeptemberAdditional";
import { flashSeptemberMetadataBySlot } from "./flashSeptemberMetadata";

// This catalogue belongs only to the private September flash page. The files
// are kept separate from the shop's regular /flash catalogue.
export const FLASH_SEPTEMBER_PUBLISHED_FLASH_COUNT = 330;
export const FLASH_SEPTEMBER_LEGACY_FLASH_COUNT = Object.keys(flashSeptemberMetadataBySlot).length;
export const FLASH_SEPTEMBER_METADATA_VERSION = 2;

export const flashSeptemberPublishedFlashs: SeptemberFlash[] = Array.from(
  { length: FLASH_SEPTEMBER_PUBLISHED_FLASH_COUNT },
  (_, index) => {
    const reference = `F${String(index + 1).padStart(3, "0")}`;
    const file = `flash-${String(index + 1).padStart(3, "0")}.png`;
    const metadata = {
      ...flashSeptemberMetadataBySlot[index + 1],
      ...flashSeptemberAdditionalMetadataBySlot[index + 1],
    };

    return {
      ...metadata,
      metadataVersion: FLASH_SEPTEMBER_METADATA_VERSION,
      id: `flash-septembre-${String(index + 1).padStart(3, "0")}`,
      reference,
      title: metadata.title ?? `Flash ${reference}`,
      status: "Disponible",
      description: metadata.description ?? "Modèle disponible pour les Journées flashs.",
      image: {
        src: `/flash-septembre/flashes/${file}`,
        alt: `Flash ${reference}`,
      },
    };
  },
);
