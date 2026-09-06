import { cookies } from "next/headers";
import { clientSessionCookieName, verifyClientSession } from "@/src/lib/clientAuth";

export const runtime = "nodejs";

const testClientEmail = "mahmoudi.sab@gmail.com";

export async function GET() {
  const cookieStore = await cookies();
  const session = verifyClientSession(cookieStore.get(clientSessionCookieName)?.value);
  const previewAccess = session?.email === testClientEmail;

  return Response.json(
    { authenticated: Boolean(session), email: session?.email ?? null, previewAccess },
    { headers: { "Cache-Control": "no-store" } },
  );
}
