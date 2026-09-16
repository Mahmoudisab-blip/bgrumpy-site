import { randomUUID } from "node:crypto";
import {
  FLASH_SEPTEMBER_PAYMENT_PROVIDERS,
  FLASH_SEPTEMBER_STATUS,
  FLASH_SEPTEMBER_TERMS_VERSION,
  FLASH_SEPTEMBER_TEST_DEPOSIT_EMAIL,
  getSeptemberCustomFlash,
  priceSeptemberSelection,
  validateSeptemberContact,
  type SeptemberFlash,
  type SeptemberPaymentProvider,
  type SeptemberReferenceAttachment,
} from "./flashSeptember";
import { sendFlashSeptemberPaidEmails } from "./serverFlashSeptemberEmails";
import {
  createFlashSeptemberBooking,
  getFlashSeptemberBooking,
  getFlashSeptemberBookingByOrder,
  getFlashSeptemberBookingByPaymentReference,
  markFlashSeptemberBookingPaid,
  markFlashSeptemberEmailsSent,
  setFlashSeptemberPaymentReference,
  type FlashSeptemberBooking,
  type FlashSeptemberPricing,
} from "./serverFlashSeptemberBookings";
import { listSeptemberFlashs } from "./serverFlashSeptemberCatalog";
import {
  assertFlashSeptemberPayPalConfiguration,
  captureFlashSeptemberPayPalOrder,
  createFlashSeptemberPayPalOrder,
  getFlashSeptemberPayPalCapture,
  getFlashSeptemberPayPalOrder,
  PayPalRequestError,
  PayPalSetupError,
  type PayPalOrder,
} from "./serverPayPalFlashSeptember";
import {
  assertFlashSeptemberSumUpConfiguration,
  createFlashSeptemberSumUpCheckout,
  getFlashSeptemberSumUpCheckout,
  SumUpSetupError,
  verifyFlashSeptemberSumUpCheckout,
} from "./serverSumUpFlashSeptember";

export class FlashSeptemberInputError extends Error {}
export class FlashSeptemberPaymentError extends Error {}
export { PayPalSetupError, SumUpSetupError };

const getTrustedOrigin = (requestUrl: string) => {
  const configuredOrigin = process.env.PAYPAL_RETURN_ORIGIN?.trim() || process.env.SITE_ORIGIN?.trim();
  const parsed = new URL(configuredOrigin || requestUrl);

  if (parsed.protocol !== "https:" && process.env.NODE_ENV === "production") {
    throw new PayPalSetupError("L'adresse de retour du paiement doit utiliser HTTPS.");
  }

  return parsed.origin;
};

const selectionFromIds = async (selectionIds: unknown): Promise<SeptemberFlash[]> => {
  if (!Array.isArray(selectionIds) || selectionIds.length === 0) {
    throw new FlashSeptemberInputError("Sélectionne au moins un flash avant de réserver.");
  }

  const ids = selectionIds.filter((id): id is string => typeof id === "string" && id.length > 0);

  if (ids.length !== selectionIds.length || new Set(ids).size !== ids.length) {
    throw new FlashSeptemberInputError("La sélection de flashs est invalide.");
  }

  const catalogue = await listSeptemberFlashs();
  const selectedById = new Map(catalogue.map((item) => [item.id, item]));
  const selection = ids.map((id) => selectedById.get(id) ?? getSeptemberCustomFlash(id));

  if (selection.some((item) => !item)) {
    throw new FlashSeptemberInputError("Un des flashs sélectionnés n'est plus disponible.");
  }

  if (selection.some((item) => !item?.custom && item?.status === "Réservé")) {
    throw new FlashSeptemberInputError("Un des flashs sélectionnés vient d'être réservé. Actualise la page puis choisis un autre modèle.");
  }

  return selection as SeptemberFlash[];
};

const parsePaymentProvider = (value: unknown): SeptemberPaymentProvider => {
  if (typeof value === "string" && (FLASH_SEPTEMBER_PAYMENT_PROVIDERS as readonly string[]).includes(value)) {
    return value as SeptemberPaymentProvider;
  }

  throw new FlashSeptemberInputError("Choisis un moyen de paiement valide.");
};

const isPayPalProvider = (provider: SeptemberPaymentProvider) => provider === "paypal" || provider === "paypal_card";

const asCents = (value: string | undefined) => {
  if (!value || !/^\d+(\.\d{1,2})?$/.test(value)) {
    return null;
  }

  const cents = Math.round(Number(value) * 100);
  return Number.isSafeInteger(cents) ? cents : null;
};

const verifyPaidOrder = (order: PayPalOrder, pricing: FlashSeptemberPricing) => {
  const capture = getFlashSeptemberPayPalCapture(order);
  const paidAmount = asCents(capture?.amount?.value);

  if (
    order.status !== "COMPLETED" ||
    !capture ||
    capture.amount?.currency_code !== "EUR" ||
    paidAmount !== pricing.deposit
  ) {
    throw new FlashSeptemberPaymentError("PayPal n'a pas confirmé le montant exact de l'acompte.");
  }

  return {
    provider: "paypal" as const,
    orderId: order.id,
    captureId: capture.id,
    amount: capture.amount.value,
    currency: capture.amount.currency_code,
    capturedAt: capture.create_time ?? new Date().toISOString(),
  };
};

const verifyPaidSumUpCheckout = (checkout: Awaited<ReturnType<typeof getFlashSeptemberSumUpCheckout>>, booking: FlashSeptemberBooking) => {
  try {
    return verifyFlashSeptemberSumUpCheckout({
      checkout,
      bookingId: booking.id,
      depositCents: booking.pricing.deposit,
    });
  } catch (error) {
    if (error instanceof Error) {
      throw new FlashSeptemberPaymentError(error.message);
    }

    throw new FlashSeptemberPaymentError("SumUp n'a pas confirmé le montant exact de l'acompte.");
  }
};

const deliverBookingEmails = async (booking: FlashSeptemberBooking) => {
  if (booking.emailsSentAt) {
    return { booking, emailSent: true };
  }

  try {
    const emailSent = await sendFlashSeptemberPaidEmails(booking);

    if (!emailSent) {
      return { booking, emailSent: false };
    }

    const updated = await markFlashSeptemberEmailsSent(booking.id);
    return { booking: updated ?? booking, emailSent: true };
  } catch {
    return { booking, emailSent: false };
  }
};

const completePaidBooking = async (booking: FlashSeptemberBooking, payment: Record<string, unknown>) => {
  const result = await markFlashSeptemberBookingPaid(booking.id, FLASH_SEPTEMBER_STATUS, payment);
  const email = await deliverBookingEmails(result.booking);

  return {
    booking: email.booking,
    emailSent: email.emailSent,
    newlyPaid: result.newlyPaid,
  };
};

const captureOrReadPayPalOrder = async (booking: FlashSeptemberBooking) => {
  if (!booking.paypalOrderId) {
    throw new FlashSeptemberPaymentError("Le paiement associé à cette réservation est introuvable.");
  }

  try {
    return await captureFlashSeptemberPayPalOrder(booking.paypalOrderId, booking.id);
  } catch (error) {
    if (error instanceof PayPalRequestError && error.code === "ORDER_ALREADY_CAPTURED") {
      return getFlashSeptemberPayPalOrder(booking.paypalOrderId, booking.id);
    }

    throw error;
  }
};

const allowedReferenceTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/heic",
  "image/heif",
]);
const maxReferenceBytes = 8 * 1024 * 1024;

const safeFilename = (filename: string) => {
  const extension = filename.match(/\.[a-z0-9]{1,8}$/i)?.[0].toLowerCase() ?? ".jpg";
  const stem = filename
    .replace(/\.[a-z0-9]{1,8}$/i, "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "reference";

  return `${stem}${extension}`;
};

const readCustomReference = async (
  value: unknown,
  customSelected: boolean,
): Promise<SeptemberReferenceAttachment[]> => {
  if (!customSelected) {
    return [];
  }

  if (!value || typeof value !== "object" || !("arrayBuffer" in value)) {
    throw new FlashSeptemberInputError("Ajoute une photo de référence pour ton flash personnalisé.");
  }

  const file = value as File;

  if (!file.size || !allowedReferenceTypes.has(file.type.toLowerCase())) {
    throw new FlashSeptemberInputError("La photo de référence doit être une image JPG, PNG, WebP, GIF ou HEIC.");
  }

  if (file.size > maxReferenceBytes) {
    throw new FlashSeptemberInputError("La photo de référence ne doit pas dépasser 8 Mo.");
  }

  return [{
    filename: safeFilename(file.name),
    contentType: file.type.toLowerCase(),
    size: file.size,
    contentBase64: Buffer.from(await file.arrayBuffer()).toString("base64"),
  }];
};

export const beginFlashSeptemberCheckout = async ({
  selectionIds,
  contact,
  paymentProvider: paymentProviderValue,
  customReference,
  legalAccepted,
  accountEmail,
  requestUrl,
}: {
  selectionIds: unknown;
  contact: unknown;
  paymentProvider: unknown;
  customReference?: unknown;
  legalAccepted?: unknown;
  accountEmail: string;
  requestUrl: string;
}) => {
  if (legalAccepted !== true && legalAccepted !== "true" && legalAccepted !== "on") {
    throw new FlashSeptemberInputError("Accepte les conditions de réservation avant de continuer.");
  }

  const paymentProvider = parsePaymentProvider(paymentProviderValue);
  const selection = await selectionFromIds(selectionIds);
  const contactForAccount = contact && typeof contact === "object"
    ? { ...(contact as Record<string, unknown>), email: accountEmail }
    : { email: accountEmail };
  const validatedContactWithAge = validateSeptemberContact(contactForAccount, selection.some((item) => item.custom));
  const { ageStatus, ageDeclarationAccepted, ...validatedContact } = validatedContactWithAge;
  const basePricing = priceSeptemberSelection(selection);
  const pricing = accountEmail.trim().toLowerCase() === FLASH_SEPTEMBER_TEST_DEPOSIT_EMAIL
    ? { ...basePricing, deposit: 100, remaining: basePricing.total - 100 }
    : basePricing;
  const attachments = await readCustomReference(customReference, selection.some((item) => item.custom));
  const siteOrigin = getTrustedOrigin(requestUrl);

  // Check the provider before creating a booking. A failed setup must not
  // leave an orphaned "Paiement en attente" record in the shop database.
  if (isPayPalProvider(paymentProvider)) {
    assertFlashSeptemberPayPalConfiguration();
  } else {
    assertFlashSeptemberSumUpConfiguration();
  }

  const acceptanceAt = new Date().toISOString();
  const booking = await createFlashSeptemberBooking({
    requestId: randomUUID(),
    siteOrigin,
    contact: validatedContact,
    selection,
    pricing,
    paymentProvider,
    attachments,
    ageStatus,
    ageDeclarationAccepted,
    ageDeclarationAt: acceptanceAt,
    legalAcceptedAt: acceptanceAt,
    legalVersion: FLASH_SEPTEMBER_TERMS_VERSION,
  });
  const paymentPage = new URL("/flash-septembre/paiement", siteOrigin);
  paymentPage.searchParams.set("booking", booking.id);
  paymentPage.searchParams.set("provider", paymentProvider);
  const cancelPage = new URL(paymentPage);
  cancelPage.searchParams.set("cancelled", "1");

  if (paymentProvider === "sumup_card") {
    const sumup = await createFlashSeptemberSumUpCheckout({
      bookingId: booking.id,
      depositCents: pricing.deposit,
      redirectUrl: paymentPage.toString(),
      returnUrl: new URL("/api/flash-septembre/sumup/webhook", siteOrigin).toString(),
    });
    await setFlashSeptemberPaymentReference({ bookingId: booking.id, provider: paymentProvider, reference: sumup.checkoutId });
    return { bookingId: booking.id, approvalUrl: sumup.hostedCheckoutUrl, paymentProvider };
  }

  const paypal = await createFlashSeptemberPayPalOrder({
    bookingId: booking.id,
    depositCents: pricing.deposit,
    returnUrl: paymentPage.toString(),
    cancelUrl: cancelPage.toString(),
    paymentMethod: paymentProvider === "paypal_card" ? "card" : "paypal",
  });
  await setFlashSeptemberPaymentReference({ bookingId: booking.id, provider: paymentProvider, reference: paypal.orderId });
  return { bookingId: booking.id, approvalUrl: paypal.approvalUrl, paymentProvider };
};

export const confirmFlashSeptemberPayment = async ({
  bookingId,
  paymentProvider,
  paymentReference,
}: {
  bookingId: string;
  paymentProvider?: string | null;
  paymentReference?: string | null;
}) => {
  if (!bookingId) {
    throw new FlashSeptemberInputError("La réservation est introuvable.");
  }

  const booking = await getFlashSeptemberBooking(bookingId);

  if (!booking) {
    throw new FlashSeptemberInputError("La réservation est introuvable.");
  }

  if (paymentProvider && paymentProvider !== booking.paymentProvider) {
    throw new FlashSeptemberInputError("Le moyen de paiement ne correspond pas à cette réservation.");
  }

  const storedReference = booking.paymentReference ?? booking.paypalOrderId;
  if (paymentReference && paymentReference !== storedReference) {
    throw new FlashSeptemberInputError("Le paiement ne correspond pas à cette réservation.");
  }

  if (booking.status === FLASH_SEPTEMBER_STATUS && booking.paidAt) {
    const email = await deliverBookingEmails(booking);
    return { booking: email.booking, emailSent: email.emailSent, newlyPaid: false };
  }

  if (booking.paymentProvider === "sumup_card") {
    if (!booking.paymentReference) {
      throw new FlashSeptemberPaymentError("Le paiement SumUp associé à cette réservation est introuvable.");
    }

    const checkout = await getFlashSeptemberSumUpCheckout(booking.paymentReference);
    return completePaidBooking(booking, verifyPaidSumUpCheckout(checkout, booking));
  }

  const order = await captureOrReadPayPalOrder(booking);
  return completePaidBooking(booking, verifyPaidOrder(order, booking.pricing));
};

export const confirmFlashSeptemberPaymentFromWebhook = async (paypalOrderId: string) => {
  const booking = await getFlashSeptemberBookingByOrder(paypalOrderId);

  if (!booking) {
    return { ignored: true as const };
  }

  if (booking.status === FLASH_SEPTEMBER_STATUS && booking.paidAt) {
    const email = await deliverBookingEmails(booking);
    return { ignored: false as const, booking: email.booking, emailSent: email.emailSent };
  }

  const order = await getFlashSeptemberPayPalOrder(paypalOrderId, booking.id);
  const completedOrder = order.status === "COMPLETED" ? order : await captureOrReadPayPalOrder(booking);
  const result = await completePaidBooking(booking, verifyPaidOrder(completedOrder, booking.pricing));

  return { ignored: false as const, ...result };
};

export const confirmFlashSeptemberPaymentFromSumUpWebhook = async (checkoutId: string) => {
  const booking = await getFlashSeptemberBookingByPaymentReference(checkoutId);

  if (!booking || booking.paymentProvider !== "sumup_card") {
    return { ignored: true as const };
  }

  if (booking.status === FLASH_SEPTEMBER_STATUS && booking.paidAt) {
    const email = await deliverBookingEmails(booking);
    return { ignored: false as const, booking: email.booking, emailSent: email.emailSent };
  }

  const checkout = await getFlashSeptemberSumUpCheckout(checkoutId);

  if (checkout.status !== "PAID") {
    return { ignored: false as const, pending: true as const };
  }

  const result = await completePaidBooking(booking, verifyPaidSumUpCheckout(checkout, booking));
  return { ignored: false as const, ...result };
};
