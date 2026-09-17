import type { SeptemberFlash } from "@/src/lib/flashSeptember";
import { flashSeptemberMetadataBySlot } from "./flashSeptemberMetadata";

// This catalogue belongs only to the private September flash page. The files
// are kept separate from the shop's regular /flash catalogue.
export const FLASH_SEPTEMBER_PUBLISHED_FLASH_COUNT = 216;
export const FLASH_SEPTEMBER_METADATA_VERSION = 2;

export const flashSeptemberPublishedFlashs: SeptemberFlash[] = Array.from(
  { length: FLASH_SEPTEMBER_PUBLISHED_FLASH_COUNT },
  (_, index) => {
    const reference = `F${String(index + 1).padStart(3, "0")}`;
    const file = `flash-${String(index + 1).padStart(3, "0")}.png`;

    return {
      ...flashSeptemberMetadataBySlot[index + 1],
      metadataVersion: FLASH_SEPTEMBER_METADATA_VERSION,
      id: `flash-septembre-${String(index + 1).padStart(3, "0")}`,
      reference,
      title: flashSeptemberMetadataBySlot[index + 1]?.title ?? `Flash ${reference}`,
      status: "Disponible",
      description: flashSeptemberMetadataBySlot[index + 1]?.description ?? "Modèle disponible pour les Journées flashs.",
      image: {
        src: `/flash-septembre/flashes/${file}`,
        alt: `Flash ${reference}`,
      },
    };
  },
);
