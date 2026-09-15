import { listPublishedFlashs } from "./serverAdminStore";
import type { SeptemberFlash } from "./flashSeptember";

const publicFlashImage = (image: { src: string; alt: string }) => {
  const match = image.src.match(/\/api\/admin\/uploads\/(flash-\d+\.(?:png|jpe?g|webp|gif))$/i);

  return match
    ? { ...image, src: `/api/flash-septembre/images/${match[1]}` }
    : image;
};

// Catalogue propre aux Journées flashs : seuls les modèles ajoutés ici sont
// affichés sur cette page. Les flashs restent disponibles dans le catalogue
// général du shop et aucune image source n'est supprimée.
const FLASH_SEPTEMBER_PUBLISHED_FLASH_IDS: readonly string[] = [];

export async function listSeptemberFlashs(): Promise<SeptemberFlash[]> {
  const items = await listPublishedFlashs();
  return items
    .filter((item) => FLASH_SEPTEMBER_PUBLISHED_FLASH_IDS.includes(item.id))
    .filter((item) => item.status === "Disponible" && (item.availability ?? "Disponible") === "Disponible")
    .map(({ id, reference, title, image, status, description, size, style, placement }) => ({
      id,
      reference,
      title,
      status,
      description,
      size,
      style,
      placement,
      image: publicFlashImage(image),
    }));
}
