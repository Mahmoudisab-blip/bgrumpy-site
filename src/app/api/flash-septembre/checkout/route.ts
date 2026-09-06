import {
  beginFlashSeptemberCheckout,
  FlashSeptemberInputError,
  PayPalSetupError,
} from "@/src/lib/serverFlashSeptemberPayments";

export const runtime = "nodejs";

const parsePaymentProvider = (value: FormDataEntryValue | null) =>
  value === "paypal" || value === "paypal_card" ? value : "";

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type") ?? "";
    let selectionIds: unknown;
    let contact: unknown;
    let paymentProvider: unknown;
    let customReference: unknown;

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
      };
      paymentProvider = parsePaymentProvider(form.get("paymentProvider"));
      customReference = form.get("customReference");
    } else {
      const payload = await request.json();
      selectionIds = payload?.selectionIds;
      contact = payload?.contact;
      paymentProvider = payload?.paymentProvider;
      customReference = payload?.customReference;
    }

    const checkout = await beginFlashSeptemberCheckout({
      selectionIds,
      contact,
      paymentProvider,
      customReference,
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

    return Response.json(
      { error: "Le paiement ne peut pas être préparé pour le moment. Réessaie dans un instant." },
      { status: 502 },
    );
  }
}
