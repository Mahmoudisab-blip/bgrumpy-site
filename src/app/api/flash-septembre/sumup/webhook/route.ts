import {
  confirmFlashSeptemberPaymentFromSumUpWebhook,
  SumUpSetupError,
} from "@/src/lib/serverFlashSeptemberPayments";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const payload = await request.json() as { event_type?: unknown; id?: unknown };
    const checkoutId = typeof payload.id === "string" ? payload.id.trim() : "";

    if (!checkoutId || (payload.event_type !== undefined && payload.event_type !== "CHECKOUT_STATUS_CHANGED")) {
      return Response.json({ received: true });
    }

    await confirmFlashSeptemberPaymentFromSumUpWebhook(checkoutId);
    return Response.json({ received: true });
  } catch (error) {
    if (error instanceof SumUpSetupError) {
      return Response.json({ error: error.message }, { status: 503 });
    }

    return Response.json({ error: "Le paiement SumUp n'a pas pu être confirmé." }, { status: 502 });
  }
}
