import type { Metadata } from "next";
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
        <div className="min-h-screen">{children}</div>
      </body>
    </html>
  );
}
