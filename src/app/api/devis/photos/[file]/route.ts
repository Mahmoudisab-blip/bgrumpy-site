import { timingSafeEqual, createHmac } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { ensureDatabase, hasDatabase, query } from "@/src/lib/database";

export const runtime = "nodejs";

const uploadDirectory = path.join(process.cwd(), ".bgrumpy-data", "uploads", "devis");
const contentTypes: Record<string, string> = {
  gif: "image/gif",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
};

const getPhotoAccessSecret = () =>
  process.env.ADMIN_SESSION_SECRET || process.env.RESEND_API_KEY || "";

const isValidToken = (file: string, expiresAt: string, token: string) => {
  const secret = getPhotoAccessSecret();
  const parsedExpiry = Number(expiresAt);

  if (!secret || !Number.isSafeInteger(parsedExpiry) || parsedExpiry < Math.floor(Date.now() / 1000)) {
    return false;
  }

  const expected = createHmac("sha256", secret)
    .update(`${file}.${parsedExpiry}`)
    .digest("base64url");

  const receivedBytes = Buffer.from(token);
  const expectedBytes = Buffer.from(expected);

  return receivedBytes.length === expectedBytes.length && timingSafeEqual(receivedBytes, expectedBytes);
};

export async function GET(
  request: Request,
  context: { params: Promise<{ file: string }> },
) {
  const { file } = await context.params;
  const url = new URL(request.url);
  const expiresAt = url.searchParams.get("expires") || "";
  const token = url.searchParams.get("token") || "";

  if (!/^[a-z0-9-]+\.(jpg|jpeg|png|webp|gif)$/i.test(file) || !isValidToken(file, expiresAt, token)) {
    return new Response("Lien photo invalide ou expiré.", { status: 401 });
  }

  if (hasDatabase()) {
    await ensureDatabase();
    const rows = await query<{ content_type: string; data_base64: string }>`
      SELECT content_type, data_base64
      FROM admin_uploads
      WHERE id = ${file} AND kind = 'devis'
      LIMIT 1
    `;
    const stored = rows[0];

    if (!stored) {
      return new Response("Image introuvable.", { status: 404 });
    }

    return new Response(Buffer.from(stored.data_base64, "base64"), {
      headers: {
        "Cache-Control": "private, max-age=3600",
        "Content-Type": stored.content_type,
      },
    });
  }

  const bytes = await readFile(path.join(uploadDirectory, file)).catch(() => null);

  if (!bytes) {
    return new Response("Image introuvable.", { status: 404 });
  }

  const extension = file.split(".").at(-1)?.toLowerCase() ?? "png";

  return new Response(bytes, {
    headers: {
      "Cache-Control": "private, max-age=3600",
      "Content-Type": contentTypes[extension] ?? "application/octet-stream",
    },
  });
}
