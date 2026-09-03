import { cookies } from "next/headers";
import { clientSessionCookieName, verifyClientSession } from "@/src/lib/clientAuth";
import { listPublishedFlashs } from "@/src/lib/serverAdminStore";
import FlashPageClient from "./FlashPageClient";

export default async function FlashPage() {
  const cookieStore = await cookies();
  const clientSession = verifyClientSession(cookieStore.get(clientSessionCookieName)?.value);
  const items = clientSession ? await listPublishedFlashs() : [];

  return <FlashPageClient items={items} />;
}
