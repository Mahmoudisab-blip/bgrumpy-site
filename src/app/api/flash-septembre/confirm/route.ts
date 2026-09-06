import { cookies } from "next/headers";
import {
  confirmFlashSeptemberPayment,
  FlashSeptemberInputError,
  PayPalSetupError,
} from "@/src/lib/serverFlashSeptemberPayments";
import { clientSessionCookieName, verifyClientSession } from "@/src/lib/clientAuth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const clientSession = verifyClientSession(cookieStore.get(clientSessionCookieName)?.value);

    if (!clientSession) {
      return Response.json(
        { error: "Connecte-toi à ton compte pour confirmer cette réservation." },
        { status: 401 },
      );
    }

    const payload = await request.json();
    const result = await confirmFlashSeptemberPayment({
      bookingId: typeof payload?.bookingId === "string" ? payload.bookingId : "",
      paymentProvider: typeof payload?.paymentProvider === "string" ? payload.paymentProvider : null,
      paymentReference: typeof payload?.paymentReference === "string" ? payload.paymentReference : null,
    });

    return Response.json({
      status: result.booking.status,
      emailSent: result.emailSent,
      booking: {
        id: result.booking.id,
        selection: result.booking.selection,
        pricing: result.booking.pricing,
      },
    });
  } catch (error) {
    if (error instanceof FlashSeptemberInputError) {
      return Response.json({ error: error.message }, { status: 400 });
    }

    if (error instanceof PayPalSetupError) {
      return Response.json({ error: error.message }, { status: 503 });
    }

    return Response.json(
      { error: "Le prestataire n'a pas encore confirmé cet acompte. Réessaie dans un instant." },
      { status: 502 },
    );
  }
}
