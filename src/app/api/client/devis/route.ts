import { listServerDevis } from "@/src/lib/serverDevisStore";

export const runtime = "nodejs";

const normalizeEmail = (email: string) => email.trim().toLowerCase();

export async function GET(request: Request) {
  const email = normalizeEmail(new URL(request.url).searchParams.get("email") ?? "");

  if (!email) {
    return Response.json({ devis: [] });
  }

  const devis = (await listServerDevis()).filter(
    (item) => normalizeEmail(item.payload.email ?? "") === email,
  );

  return Response.json({ devis });
}

