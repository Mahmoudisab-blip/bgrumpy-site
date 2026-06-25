import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { cookies } from "next/headers";
import { adminSessionCookieName, verifyAdminSession } from "@/src/lib/adminAuth";

export const runtime = "nodejs";

const uploadDirectory = path.join(process.cwd(), ".bgrumpy-data", "uploads");
const allowedTypes = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
  ["image/gif", "gif"],
]);

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const authenticated = await verifyAdminSession(
    cookieStore.get(adminSessionCookieName)?.value,
  );

  if (!authenticated) {
    return Response.json({ error: "Non autorisé." }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return Response.json({ error: "Photo manquante." }, { status: 400 });
  }

  const extension = allowedTypes.get(file.type);
  if (!extension) {
    return Response.json({ error: "Format image non supporté." }, { status: 400 });
  }

  if (file.size > 5 * 1024 * 1024) {
    return Response.json({ error: "Image trop lourde." }, { status: 400 });
  }

  await mkdir(uploadDirectory, { recursive: true });

  const filename = `flash-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${extension}`;
  const bytes = Buffer.from(await file.arrayBuffer());

  await writeFile(path.join(uploadDirectory, filename), bytes);

  return Response.json({ url: `/api/admin/uploads/${filename}` });
}
