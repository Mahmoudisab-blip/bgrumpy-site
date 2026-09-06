import {
  confirmFlashSeptemberPaymentFromWebhook,
  PayPalSetupError,
} from "@/src/lib/serverFlashSeptemberPayments";
import {
  getFlashSeptemberOrderIdFromWebhook,
  verifyFlashSeptemberPayPalWebhook,
} from "@/src/lib/serverPayPalFlashSeptember";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const rawEvent = await request.text();
    const event = JSON.parse(rawEvent) as Record<string, unknown>;
    const verified = await verifyFlashSeptemberPayPalWebhook({ headers: request.headers, rawEvent });

    if (!verified) {
      return Response.json({ received: false }, { status: 400 });
    }

    const paypalOrderId = getFlashSeptemberOrderIdFromWebhook(event);

    if (!paypalOrderId) {
      return Response.json({ received: true, ignored: true });
    }

    const result = await confirmFlashSeptemberPaymentFromWebhook(paypalOrderId);
    return Response.json({ received: true, ...result });
  } catch (error) {
    if (error instanceof PayPalSetupError) {
      return Response.json({ received: false, error: error.message }, { status: 503 });
    }

    return Response.json({ received: false }, { status: 500 });
  }
}
