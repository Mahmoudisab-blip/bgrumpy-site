import { NextResponse } from "next/server";
import {
  adminSessionCookieName,
  createAdminSession,
  hasConfiguredAdminCredentials,
  isValidAdminLogin,
} from "@/src/lib/adminAuth";

export async function POST(request: Request) {
  if (!hasConfiguredAdminCredentials()) {
    return NextResponse.json(
      { error: "Les identifiants admin ne sont pas configurés." },
      { status: 500 },
    );
  }

  const body = (await request.json().catch(() => null)) as
    | { username?: string; password?: string }
    | null;
  const username = body?.username?.trim() ?? "";
  const password = body?.password?.trim() ?? "";

  if (username !== process.env.ADMIN_USERNAME?.trim()) {
    return NextResponse.json(
      { error: "Ce compte n'est pas un compte administrateur.", isAdminAccount: false },
      { status: 404 },
    );
  }

  if (!isValidAdminLogin(username, password)) {
    return NextResponse.json(
      { error: "Mot de passe administrateur incorrect.", isAdminAccount: true },
      { status: 401 },
    );
  }

  const session = await createAdminSession();
  const response = NextResponse.json({ ok: true });

  response.cookies.set(adminSessionCookieName, session.value, {
    httpOnly: true,
    maxAge: session.maxAge,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  return response;
}
