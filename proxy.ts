import { NextResponse, type NextRequest } from "next/server";
import { adminSessionCookieName, verifyAdminSession } from "@/src/lib/adminAuth";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin/login")) {
    return NextResponse.next();
  }

  const isAuthenticated = await verifyAdminSession(
    request.cookies.get(adminSessionCookieName)?.value,
  );

  if (isAuthenticated) {
    return NextResponse.next();
  }

  const loginUrl = new URL("/admin/login", request.url);
  loginUrl.searchParams.set("next", pathname);

  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: "/admin/:path*",
};
