import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/src/components/Navbar";
import Footer from "@/src/components/Footer";

export const metadata: Metadata = {
  title: {
    default: "B.Grumpy Tattoo | Studio privé de tatouage",
    template: "%s | B.Grumpy Tattoo",
  },
  description:
    "Studio privé de tatouage à Villiers-sur-Morin. Portfolio, flashs disponibles et demandes de devis pour projets personnalisés.",
  metadataBase: new URL("https://bgrumpy-tattoo.fr"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="h-full antialiased">
      <body className="min-h-full bg-[color:var(--bg)] text-[color:var(--ink)]">
        <div className="min-h-screen bg-grain">
          <Navbar />
          <main>{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
