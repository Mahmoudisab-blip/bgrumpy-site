import type { SeptemberFlash } from "@/src/lib/flashSeptember";

// This catalogue belongs only to the private September flash page. The files
// are kept separate from the shop's regular /flash catalogue.
export const FLASH_SEPTEMBER_PUBLISHED_FLASH_COUNT = 216;

export const flashSeptemberPublishedFlashs: SeptemberFlash[] = Array.from(
  { length: FLASH_SEPTEMBER_PUBLISHED_FLASH_COUNT },
  (_, index) => {
    const reference = `F${String(index + 1).padStart(3, "0")}`;
    const file = `flash-${String(index + 1).padStart(3, "0")}.png`;

    return {
      id: `flash-septembre-${String(index + 1).padStart(3, "0")}`,
      reference,
      title: `Flash ${reference}`,
      status: "Disponible",
      description: "Modèle disponible pour les Journées flashs.",
      image: {
        src: `/flash-septembre/flashes/${file}`,
        alt: `Flash ${reference}`,
      },
    };
  },
);
