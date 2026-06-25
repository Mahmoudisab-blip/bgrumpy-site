import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { adminSessionCookieName, verifyAdminSession } from "@/src/lib/adminAuth";
import AdminClient from "./AdminClient";

export const metadata = {
  title: "Administration | B.Grumpy Tattoo",
  description: "Tableau de bord administrateur B.Grumpy Tattoo",
};

export default async function AdminPage() {
  const cookieStore = await cookies();
  const isAuthenticated = await verifyAdminSession(
    cookieStore.get(adminSessionCookieName)?.value,
  );

  if (!isAuthenticated) {
    redirect("/admin/login");
  }

  return <AdminClient />;
}
