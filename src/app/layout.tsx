import "./globals.css";
import AccountGate from "../components/AccountGate";
import AnalyticsTracker from "../components/AnalyticsTracker";
import AppChrome from "../components/AppChrome";

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
        <AnalyticsTracker />
        <AccountGate>
          {children}
          <AppChrome />
        </AccountGate>
      </body>
    </html>
  );
}
