import { clearClientProfile } from "@/src/lib/clientProfileStorage";

export const logoutEverywhere = async (redirectTo = "/?login=1") => {
  clearClientProfile();

  await fetch("/api/admin/logout", {
    method: "POST",
    cache: "no-store",
    credentials: "same-origin",
  }).catch(() => null);

  window.location.replace(redirectTo);
};
