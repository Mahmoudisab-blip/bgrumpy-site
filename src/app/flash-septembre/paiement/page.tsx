import type { Metadata } from "next";
import PaymentResultClient from "./PaymentResultClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Confirmation de l'acompte | B.Grumpy Tattoo",
  robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
};

export default async function FlashSeptemberPaymentPage({
  searchParams,
}: {
    searchParams: Promise<{ booking?: string; token?: string; pid?: string; provider?: string; cancelled?: string }>;
}) {
  const params = await searchParams;

  return (
    <PaymentResultClient
      bookingId={params.booking ?? ""}
      paymentProvider={params.provider === "paypal_card" ? "paypal_card" : "paypal"}
      paymentReference={params.token ?? params.pid ?? null}
      cancelled={params.cancelled === "1"}
    />
  );
}
