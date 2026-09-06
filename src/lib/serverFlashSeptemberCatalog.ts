import { listPublishedFlashs } from "./serverAdminStore";
import type { SeptemberFlash } from "./flashSeptember";

const publicFlashImage = (image: { src: string; alt: string }) => {
  const match = image.src.match(/\/api\/admin\/uploads\/(flash-\d+\.(?:png|jpe?g|webp|gif))$/i);

  return match
    ? { ...image, src: `/api/flash-septembre/images/${match[1]}` }
    : image;
};

// Reuses the shop's published catalogue. No separate copy of the flash images.
export async function listSeptemberFlashs(): Promise<SeptemberFlash[]> {
  const items = await listPublishedFlashs();
  return items
    .filter((item) => item.status === "Disponible" && (item.availability ?? "Disponible") === "Disponible")
    .map(({ id, reference, title, image }) => ({ id, reference, title, image: publicFlashImage(image) }));
}
