import { NextResponse } from "next/server";
import { adminSessionCookieName, legacyAdminSessionCookieName } from "@/src/lib/adminAuth";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.headers.set("Cache-Control", "no-store");
  const cookieNames = [adminSessionCookieName, legacyAdminSessionCookieName];

  cookieNames.forEach((cookieName) => {
    response.cookies.set(cookieName, "", {
      httpOnly: true,
      maxAge: 0,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });
    response.cookies.set(cookieName, "", {
      httpOnly: true,
      maxAge: 0,
      path: "/admin",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });
  });

  return response;
}
