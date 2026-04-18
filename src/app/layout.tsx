import "./globals.css";
import Navbar from "../components/Navbar";

export const metadata = {
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
        {children}
        <Navbar />
      </body>
    </html>
  );
}