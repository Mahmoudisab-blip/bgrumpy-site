import { flashItems } from "@/src/data/flashItems";
import FlashPageClient from "./FlashPageClient";

export default function FlashPage() {
  return <FlashPageClient items={flashItems} />;
}
