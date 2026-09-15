import { flashSeptemberPublishedFlashs } from "@/src/data/flashSeptemberPublished";
import type { SeptemberFlash } from "./flashSeptember";

export async function listSeptemberFlashs(): Promise<SeptemberFlash[]> {
  return flashSeptemberPublishedFlashs;
}
