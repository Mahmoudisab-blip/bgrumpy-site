import type { Metadata } from "next";
import { listSeptemberFilterOptions, listSeptemberFlashs } from "@/src/lib/serverFlashSeptemberCatalog";
import FlashSeptemberClient from "./FlashSeptemberClient";

export const metadata: Metadata = {
  title: "Journées flashs septembre 2026 | B.Grumpy Tattoo",
  description: "Journées flashs en septembre 2026 : 70 € par flash pour 1 ou 2 flashs, puis 60 € par flash dès le troisième, dans la limite des créneaux disponibles.",
  robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
  referrer: "same-origin",
};
export const dynamic = "force-dynamic";

export default async function FlashSeptemberPage() {
  const [items, filterOptions] = await Promise.all([listSeptemberFlashs(), listSeptemberFilterOptions()]);
  return <FlashSeptemberClient items={items} filterOptions={filterOptions} />;
}
