import { cookies } from "next/headers";
import {
  beginFlashSeptemberCheckout,
  FlashSeptemberInputError,
  PayPalSetupError,
  SumUpSetupError,
} from "@/src/lib/serverFlashSeptemberPayments";
import { clientSessionCookieName, verifyClientSession } from "@/src/lib/clientAuth";

export const runtime = "nodejs";

const parsePaymentProvider = (value: FormDataEntryValue | null) =>
  value === "paypal" || value === "paypal_card" || value === "sumup_card" ? value : "";

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const clientSession = verifyClientSession(cookieStore.get(clientSessionCookieName)?.value);

    if (!clientSession) {
      return Response.json(
        { error: "Crée un compte ou connecte-toi pour réserver un flash." },
        { status: 401 },
      );
    }

    const contentType = request.headers.get("content-type") ?? "";
    let selectionIds: unknown;
    let contact: unknown;
    let paymentProvider: unknown;
    let customReference: unknown;
    let legalAccepted: unknown;

    if (contentType.includes("multipart/form-data")) {
      const form = await request.formData();
      const selectionIdsRaw = form.get("selectionIds");
      try {
        selectionIds = JSON.parse(typeof selectionIdsRaw === "string" ? selectionIdsRaw : "[]");
      } catch {
        selectionIds = [];
      }
      contact = {
        firstName: form.get("firstName"),
        lastName: form.get("lastName"),
        email: form.get("email"),
        phone: form.get("phone"),
        customIdea: form.get("customIdea"),
        notes: form.get("notes"),
        ageStatus: form.get("ageStatus"),
        ageDeclarationAccepted: form.get("ageDeclarationAccepted"),
      };
      paymentProvider = parsePaymentProvider(form.get("paymentProvider"));
      customReference = form.get("customReference");
      legalAccepted = form.get("legalAccepted");
    } else {
      const payload = await request.json();
      selectionIds = payload?.selectionIds;
      contact = payload?.contact;
      paymentProvider = payload?.paymentProvider;
      customReference = payload?.customReference;
      legalAccepted = payload?.legalAccepted;
    }

    const checkout = await beginFlashSeptemberCheckout({
      selectionIds,
      contact,
      paymentProvider,
      customReference,
      legalAccepted,
      accountEmail: clientSession.email,
      requestUrl: request.url,
    });

    return Response.json(checkout);
  } catch (error) {
    if (error instanceof FlashSeptemberInputError) {
      return Response.json({ error: error.message }, { status: 400 });
    }

    if (error instanceof PayPalSetupError) {
      return Response.json({ error: error.message }, { status: 503 });
    }

    if (error instanceof SumUpSetupError) {
      return Response.json({ error: error.message }, { status: 503 });
    }

    return Response.json(
      { error: "Le paiement ne peut pas être préparé pour le moment. Réessaie dans un instant." },
      { status: 502 },
    );
  }
}
