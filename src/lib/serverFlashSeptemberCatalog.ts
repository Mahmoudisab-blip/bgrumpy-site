import { flashSeptemberPublishedFlashs } from "@/src/data/flashSeptemberPublished";
import { hasStoredAdminState, readAdminState } from "@/src/lib/serverAdminStore";
import type { SeptemberFlash } from "./flashSeptember";

export async function listSeptemberFlashs(): Promise<SeptemberFlash[]> {
  const saved = await hasStoredAdminState();
  const state = await readAdminState();

  return saved && state.flashSeptemberInitialized
    ? state.flashSeptemberFlashs
    : flashSeptemberPublishedFlashs;
}
