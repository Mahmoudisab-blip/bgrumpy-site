import { Suspense } from "react";
import AdminLoginClient from "./AdminLoginClient";

export const metadata = {
  title: "Connexion admin | B.Grumpy Tattoo",
  description: "Connexion à l'administration B.Grumpy Tattoo",
};

export default function AdminLoginPage() {
  return (
    <Suspense>
      <AdminLoginClient />
    </Suspense>
  );
}
