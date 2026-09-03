import { listPublishedPortfolio } from "@/src/lib/serverAdminStore";
import TatouagesPageClient from "./TatouagesPageClient";

export const dynamic = "force-dynamic";

export default async function TatouagesPage() {
  const tattooItems = await listPublishedPortfolio();

  return <TatouagesPageClient items={tattooItems} />;
}
