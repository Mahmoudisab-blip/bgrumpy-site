import type { Metadata } from "next";
import Navbar from "@/src/components/Navbar";
import "./globals.css";

export const metadata: Metadata = {
  title: "B.Grumpy Tattoo",
  description: "B.Grumpy Tattoo",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body>
        <div className="min-h-screen pt-[calc(7rem_+_env(safe-area-inset-top))] md:pt-[calc(6rem_+_env(safe-area-inset-top))]">
          {children}
        </div>
        <Navbar />
      </body>
    </html>
  );
}
