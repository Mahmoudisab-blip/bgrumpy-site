import { portfolioItems } from "@/src/data/portfolioItems";
import TatouagesPageClient from "./TatouagesPageClient";

const tattooItems = portfolioItems.filter(
  (item) => item.id === "psykokwak-bras" || item.image.src.startsWith("/Tatouages/"),
);

export default function TatouagesPage() {
  return <TatouagesPageClient items={tattooItems} />;
}
