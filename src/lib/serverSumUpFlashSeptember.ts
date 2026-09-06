type SumUpConfiguration = {
  apiKey: string;
  merchantCode: string;
};

export type SumUpCheckout = {
  id?: string;
  status?: string;
  amount?: number | string;
  currency?: string;
  checkout_reference?: string;
  hosted_checkout_url?: string;
  transactions?: Array<Record<string, unknown>>;
};

export class SumUpSetupError extends Error {}

export class SumUpRequestError extends Error {
  constructor(
    message: string,
    readonly code: string | null = null,
  ) {
    super(message);
  }
}

const getConfiguration = (): SumUpConfiguration => {
  const apiKey = (process.env.SUMUP_API_KEY || process.env.SUMUP_ACCESS_TOKEN)?.trim();
  const merchantCode = process.env.SUMUP_MERCHANT_CODE?.trim();

  if (!apiKey || !merchantCode) {
    throw new SumUpSetupError("Le paiement par carte SumUp n'est pas encore relié au compte du studio.");
  }

  return { apiKey, merchantCode };
};

export const assertFlashSeptemberSumUpConfiguration = () => getConfiguration();

const readJson = async (response: Response) => {
  try {
    return (await response.json()) as Record<string, unknown>;
  } catch {
    return {};
  }
};

const callSumUp = async (
  configuration: SumUpConfiguration,
  path: string,
  init: RequestInit,
) => {
  const requestHeaders = new Headers(init.headers);
  requestHeaders.set("Authorization", `Bearer ${configuration.apiKey}`);
  requestHeaders.set("Content-Type", "application/json");

  const response = await fetch(`https://api.sumup.com${path}`, {
    ...init,
    headers: requestHeaders,
    cache: "no-store",
  });
  const payload = await readJson(response);

  if (!response.ok) {
    const code = typeof payload.error_code === "string"
      ? payload.error_code
      : typeof payload.error_message === "string"
        ? payload.error_message
        : null;
    throw new SumUpRequestError("SumUp n'a pas pu préparer ou confirmer ce paiement.", code);
  }

  return payload;
};

export const createFlashSeptemberSumUpCheckout = async ({
  bookingId,
  depositCents,
  redirectUrl,
  returnUrl,
}: {
  bookingId: string;
  depositCents: number;
  redirectUrl: string;
  returnUrl: string;
}) => {
  const configuration = getConfiguration();
  const payload = await callSumUp(configuration, "/v0.1/checkouts", {
    method: "POST",
    body: JSON.stringify({
      amount: depositCents / 100,
      checkout_reference: bookingId,
      currency: "EUR",
      description: "Acompte Flash Septembre 2026 — B.Grumpy Tattoo",
      merchant_code: configuration.merchantCode,
      redirect_url: redirectUrl,
      return_url: returnUrl,
      hosted_checkout: { enabled: true },
    }),
  }) as SumUpCheckout;

  const checkoutId = payload.id;
  const hostedCheckoutUrl = payload.hosted_checkout_url;

  if (!checkoutId || !hostedCheckoutUrl) {
    throw new SumUpRequestError("SumUp n'a pas fourni le lien de paiement attendu.");
  }

  const parsedUrl = new URL(hostedCheckoutUrl);
  if (parsedUrl.protocol !== "https:" || parsedUrl.hostname !== "checkout.sumup.com") {
    throw new SumUpRequestError("Le lien de paiement SumUp est invalide.");
  }

  return { checkoutId, hostedCheckoutUrl };
};

export const getFlashSeptemberSumUpCheckout = async (checkoutId: string) => {
  const configuration = getConfiguration();
  return callSumUp(
    configuration,
    `/v0.1/checkouts/${encodeURIComponent(checkoutId)}`,
    { method: "GET" },
  ) as Promise<SumUpCheckout>;
};

const asCents = (value: number | string | undefined) => {
  const amount = typeof value === "number" ? value : Number(value);
  return Number.isFinite(amount) ? Math.round(amount * 100) : null;
};

export const verifyFlashSeptemberSumUpCheckout = ({
  checkout,
  bookingId,
  depositCents,
}: {
  checkout: SumUpCheckout;
  bookingId: string;
  depositCents: number;
}) => {
  const paidAmount = asCents(checkout.amount);

  if (
    checkout.status !== "PAID" ||
    checkout.currency !== "EUR" ||
    paidAmount !== depositCents ||
    (checkout.checkout_reference && checkout.checkout_reference !== bookingId)
  ) {
    throw new SumUpRequestError("SumUp n'a pas confirmé le montant exact de l'acompte.");
  }

  return {
    provider: "sumup_card" as const,
    checkoutId: checkout.id ?? null,
    checkoutReference: checkout.checkout_reference ?? bookingId,
    amount: checkout.amount ?? null,
    currency: checkout.currency,
    status: checkout.status,
  };
};
