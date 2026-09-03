"use client";

import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import TattooChatWidget from "./TattooChatWidget";

export default function AppChrome() {
  const pathname = usePathname();

  if (pathname?.startsWith("/admin")) {
    return null;
  }

  if (pathname !== "/devis") {
    return null;
  }

  return (
    <>
      <TattooChatWidget />
      <Navbar />
    </>
  );
}
