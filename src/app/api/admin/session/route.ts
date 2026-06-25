import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { adminSessionCookieName, verifyAdminSession } from "@/src/lib/adminAuth";

export async function GET() {
  const cookieStore = await cookies();
  const authenticated = await verifyAdminSession(
    cookieStore.get(adminSessionCookieName)?.value,
  );

  return NextResponse.json({ authenticated });
}
