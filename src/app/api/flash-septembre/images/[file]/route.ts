import { readFile } from "node:fs/promises";
import path from "node:path";
import { flashItems } from "@/src/data/flashItems";
import { listSeptemberFlashs } from "@/src/lib/serverFlashSeptemberCatalog";
import { listPublishedFlashs } from "@/src/lib/serverAdminStore";
import { ensureDatabase, hasDatabase, query } from "@/src/lib/database";

export const runtime = "nodejs";

const normalizedDirectory = path.join(process.cwd(), "private-assets", "flashs", "normalized");
const bundledFlashImageFiles = new Set(
  flashItems
    .map((item) => item.image.src.split("/").at(-1))
    .filter((file): file is string => Boolean(file)),
);
const contentTypes: Record<string, string> = {
  gif: "image/gif",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
};

const getImageFileName = (src?: string) => src
  ?.split("/")
  .at(-1)
  ?.split(/[?#]/, 1)[0];

const isPublishedFlashImage = async (file: string) => {
  const [flashs, septemberFlashs] = await Promise.all([
    listPublishedFlashs(),
    listSeptemberFlashs(),
  ]);

  const isRegularFlash = flashs.some((flash) => {
    const imageFile = getImageFileName(flash.image.src);
    return flash.status === "Disponible" && (flash.availability ?? "Disponible") === "Disponible" && imageFile === file;
  });

  const isSeptemberFlash = septemberFlashs.some((flash) => {
    const imageFile = getImageFileName(flash.image?.src);
    return (flash.status === "Disponible" || flash.status === "En demande" || flash.status === "Réservé") && imageFile === file;
  });

  return isRegularFlash || isSeptemberFlash;
};

export async function GET(
  _request: Request,
  context: { params: Promise<{ file: string }> },
) {
  const { file } = await context.params;

  if (!/^(?:flash-\d+|flash-septembre-[a-z0-9-]+)\.(png|jpe?g|webp|gif)$/i.test(file)) {
    return new Response("Image introuvable.", { status: 404 });
  }

  const extension = file.split(".").at(-1)?.toLowerCase() ?? "png";
  const local = await readFile(path.join(normalizedDirectory, file)).catch(() => null);

  // The standard published flash catalogue is bundled with the project. Serve
  // those files directly so a whole gallery never triggers one database query
  // per image request. The page itself still filters the catalogue by
  // availability before displaying a flash.
  if (local && bundledFlashImageFiles.has(file)) {
    return new Response(Uint8Array.from(local).buffer as ArrayBuffer, {
      headers: {
        "Cache-Control": "public, max-age=3600",
        "Content-Type": contentTypes[extension] ?? "application/octet-stream",
      },
    });
  }

  // A newly uploaded September flash can be displayed in the admin catalogue
  // before the catalogue state has finished persisting. Read its own stored
  // image first so its preview never receives a transient 404 response.
  const stored = hasDatabase()
    ? await (async () => {
      await ensureDatabase();
      const rows = await query<{ content_type: string; data_base64: string }>`
        SELECT content_type, data_base64
        FROM admin_uploads
        WHERE id = ${file} AND kind = 'flash-september'
        LIMIT 1
      `;
      return rows[0] ?? null;
    })()
    : null;

  if (!local && !stored && !(await isPublishedFlashImage(file))) {
    return new Response("Image introuvable.", { status: 404 });
  }

  if (!local && !stored) {
    return new Response("Image introuvable.", { status: 404 });
  }

  const bytes = local ?? Buffer.from(stored?.data_base64 ?? "", "base64");
  const contentType = stored?.content_type ?? contentTypes[extension] ?? "application/octet-stream";

  return new Response(Uint8Array.from(bytes).buffer as ArrayBuffer, {
    headers: {
      "Cache-Control": "public, max-age=3600",
      "Content-Type": contentType,
    },
  });
}
