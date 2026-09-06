"use client";

import { usePathname } from "next/navigation";
import CookieConsent from "./CookieConsent";
import Footer from "./Footer";
import Navbar from "./Navbar";
import TattooChatWidget from "./TattooChatWidget";

export default function AppChrome() {
  const pathname = usePathname();

  if (pathname?.startsWith("/admin")) {
    return null;
  }

  const isFlashSeptemberPath = pathname === "/flash-septembre" || pathname?.startsWith("/flash-septembre/");
  const isLegalPath = pathname === "/mentions-legales"
    || pathname === "/politique-confidentialite"
    || pathname === "/cookies"
    || pathname === "/cgv"
    || pathname === "/cgv/flash-septembre";

  return (
    <>
      {pathname === "/devis" ? <TattooChatWidget /> : null}
      <Navbar />
      {isFlashSeptemberPath || isLegalPath ? <Footer /> : null}
      <CookieConsent />
    </>
  );
}
