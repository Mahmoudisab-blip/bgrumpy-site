import type { Metadata } from "next";
import MobileAppExperience from "@/src/components/MobileAppExperience";

export const metadata: Metadata = {
  title: "Application mobile",
  description:
    "Maquette mobile premium B.Grumpy Tattoo : accueil, galerie, flashs, devis, réservation, profil et contact studio.",
};

export default function ApplicationPage() {
  return <MobileAppExperience />;
}
