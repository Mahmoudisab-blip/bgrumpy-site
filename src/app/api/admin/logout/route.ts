import { NextResponse } from "next/server";
import { adminSessionCookieName, legacyAdminSessionCookieName } from "@/src/lib/adminAuth";
import { clientSessionCookieName } from "@/src/lib/clientAuth";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.headers.set("Cache-Control", "no-store");
  const cookieNames = [adminSessionCookieName, legacyAdminSessionCookieName, clientSessionCookieName];
  const cookiePaths = ["/", "/admin"];
  const secureAttribute = process.env.NODE_ENV === "production" ? "; Secure" : "";

  cookieNames.forEach((cookieName) => {
    cookiePaths.forEach((path) => {
      response.headers.append(
        "Set-Cookie",
        `${cookieName}=; Path=${path}; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Lax${secureAttribute}`,
      );
    });
  });

  return response;
}
