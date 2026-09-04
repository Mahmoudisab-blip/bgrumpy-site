import { readFile } from "fs/promises";
import path from "path";
import { cookies } from "next/headers";
import { adminSessionCookieName, verifyAdminSession } from "@/src/lib/adminAuth";
import { clientSessionCookieName, verifyClientSession } from "@/src/lib/clientAuth";
import { ensureDatabase, hasDatabase, query } from "@/src/lib/database";

export const runtime = "nodejs";

const uploadDirectory = path.join(process.cwd(), ".bgrumpy-data", "uploads");
const privateFlashDirectory = path.join(process.cwd(), "private-assets", "flashs", "normalized");
const contentTypes: Record<string, string> = {
  gif: "image/gif",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
};

export async function GET(
  _request: Request,
  context: { params: Promise<{ file: string }> },
) {
  const cookieStore = await cookies();
  const authenticated = await verifyAdminSession(
    cookieStore.get(adminSessionCookieName)?.value,
  );
  const clientSession = verifyClientSession(cookieStore.get(clientSessionCookieName)?.value);

  const { file } = await context.params;
  if (!/^[a-z0-9-]+\.(jpg|jpeg|png|webp|gif)$/i.test(file)) {
    return new Response("Image introuvable.", { status: 404 });
  }

  const isPortfolioImage = file.startsWith("portfolio-");
  const isPublicFlashImage = file.startsWith("flash-");
  const extension = file.split(".").at(-1)?.toLowerCase() ?? "png";
  if (!authenticated && !isPortfolioImage && !isPublicFlashImage && !clientSession) {
    return new Response("Non autorisé.", { status: 401 });
  }

  const privateFlashBytes = !isPortfolioImage && file.startsWith("flash-")
    ? await readFile(path.join(privateFlashDirectory, file)).catch(() => null)
    : null;

  const respondWithImage = (bytes: Buffer, contentType: string) => {
    const body = Uint8Array.from(bytes);

    return new Response(body.buffer as ArrayBuffer, {
      headers: {
        "Cache-Control": isPortfolioImage
          ? "public, max-age=31536000, immutable"
          : "private, max-age=31536000, immutable",
        "Content-Type": contentType,
      },
    });
  };

  if (hasDatabase()) {
    await ensureDatabase();
    const rows = await query<{ content_type: string; data_base64: string }>`
      SELECT content_type, data_base64
      FROM admin_uploads
      WHERE id = ${file}
      LIMIT 1
    `;
    const stored = rows[0];

    if (!stored) {
      return privateFlashBytes
        ? respondWithImage(privateFlashBytes, contentTypes[extension] ?? "application/octet-stream")
        : new Response("Image introuvable.", { status: 404 });
    }

    return respondWithImage(Buffer.from(stored.data_base64, "base64"), stored.content_type);
  }

  const bytes = await readFile(path.join(uploadDirectory, file)).catch(() => null) ?? privateFlashBytes;
  if (!bytes) {
    return new Response("Image introuvable.", { status: 404 });
  }

  return respondWithImage(bytes, contentTypes[extension] ?? "application/octet-stream");
}
