import "./globals.css";
import type { Viewport } from "next";
import AccountGate from "../components/AccountGate";
import AnalyticsTracker from "../components/AnalyticsTracker";
import AppChrome from "../components/AppChrome";
import MaintenanceGate from "../components/MaintenanceGate";

export const metadata = {
  title: "B.Grumpy Tattoo",
  description: "B.Grumpy Tattoo",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#f3f7ef",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body>
        <AnalyticsTracker />
        <MaintenanceGate>
          <AccountGate>{children}</AccountGate>
        </MaintenanceGate>
        <AppChrome />
      </body>
    </html>
  );
}
