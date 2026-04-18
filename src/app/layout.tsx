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
        <div className="min-h-screen pb-[calc(5.75rem+env(safe-area-inset-bottom))]">
          {children}
        </div>
        <Navbar />
      </body>
    </html>
  );
}
