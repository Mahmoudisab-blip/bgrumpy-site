import { readFile } from "fs/promises";
import path from "path";
import { cookies } from "next/headers";
import { adminSessionCookieName, verifyAdminSession } from "@/src/lib/adminAuth";

export const runtime = "nodejs";

const uploadDirectory = path.join(process.cwd(), ".bgrumpy-data", "uploads", "devis");
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

  if (!authenticated) {
    return new Response("Non autorisé.", { status: 401 });
  }

  const { file } = await context.params;
  if (!/^[a-z0-9-]+\.(jpg|jpeg|png|webp|gif)$/i.test(file)) {
    return new Response("Image introuvable.", { status: 404 });
  }

  const bytes = await readFile(path.join(uploadDirectory, file)).catch(() => null);
  if (!bytes) {
    return new Response("Image introuvable.", { status: 404 });
  }

  const extension = file.split(".").at(-1)?.toLowerCase() ?? "png";

  return new Response(bytes, {
    headers: {
      "Cache-Control": "private, max-age=31536000, immutable",
      "Content-Type": contentTypes[extension] ?? "application/octet-stream",
    },
  });
}
