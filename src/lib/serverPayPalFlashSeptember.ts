type PayPalConfiguration = {
  clientId: string;
  clientSecret: string;
  webhookId: string | null;
  apiBase: string;
};

export type PayPalOrder = {
  id: string;
  status: string;
  links?: Array<{ href: string; rel: string; method?: string }>;
  purchase_units?: Array<{
    payments?: {
      captures?: Array<{
        id: string;
        status: string;
        amount?: { currency_code?: string; value?: string };
        create_time?: string;
      }>;
    };
  }>;
};

export class PayPalSetupError extends Error {}

export class PayPalRequestError extends Error {
  constructor(
    message: string,
    readonly code: string | null = null,
  ) {
    super(message);
  }
}

const getConfiguration = (): PayPalConfiguration => {
  const clientId = process.env.PAYPAL_CLIENT_ID?.trim();
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET?.trim();

  if (!clientId || !clientSecret) {
    throw new PayPalSetupError("Le paiement PayPal n'est pas encore relié au compte du studio.");
  }

  const mode = process.env.PAYPAL_MODE?.trim().toLowerCase() || "live";

  if (mode !== "live" && mode !== "sandbox") {
    throw new PayPalSetupError("Le mode PayPal doit être défini sur live ou sandbox.");
  }

  if (process.env.VERCEL_ENV === "production" && mode !== "live") {
    throw new PayPalSetupError("Le paiement de production doit obligatoirement utiliser PayPal en mode live.");
  }

  return {
    clientId,
    clientSecret,
    webhookId: process.env.PAYPAL_WEBHOOK_ID?.trim() || null,
    apiBase: mode === "live" ? "https://api-m.paypal.com" : "https://api-m.sandbox.paypal.com",
  };
};

export const assertFlashSeptemberPayPalConfiguration = () => getConfiguration();

const readJson = async (response: Response) => {
  try {
    return (await response.json()) as Record<string, unknown>;
  } catch {
    return {};
  }
};

const requestAccessToken = async (configuration: PayPalConfiguration) => {
  const credentials = Buffer.from(`${configuration.clientId}:${configuration.clientSecret}`).toString("base64");
  const response = await fetch(`${configuration.apiBase}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
    cache: "no-store",
  });
  const payload = await readJson(response);

  if (!response.ok || typeof payload.access_token !== "string") {
    throw new PayPalRequestError("PayPal n'a pas validé la connexion du studio.");
  }

  return payload.access_token;
};

const callPayPal = async (
  configuration: PayPalConfiguration,
  path: string,
  init: RequestInit,
  requestId: string,
) => {
  const accessToken = await requestAccessToken(configuration);
  const requestHeaders = new Headers(init.headers);
  requestHeaders.set("Authorization", `Bearer ${accessToken}`);
  requestHeaders.set("Content-Type", "application/json");
  requestHeaders.set("PayPal-Request-Id", requestId);
  const response = await fetch(`${configuration.apiBase}${path}`, {
    ...init,
    headers: requestHeaders,
    cache: "no-store",
  });
  const payload = await readJson(response);

  if (!response.ok) {
    const code = typeof payload.name === "string" ? payload.name : null;
    throw new PayPalRequestError("PayPal n'a pas pu confirmer ce paiement. Réessaie dans un instant.", code);
  }

  return payload;
};

const money = (cents: number) => (cents / 100).toFixed(2);

export const createFlashSeptemberPayPalOrder = async ({
  bookingId,
  depositCents,
  returnUrl,
  cancelUrl,
  paymentMethod,
}: {
  bookingId: string;
  depositCents: number;
  returnUrl: string;
  cancelUrl: string;
  paymentMethod: "paypal" | "card";
}) => {
  const configuration = getConfiguration();
  const payload = await callPayPal(
    configuration,
    "/v2/checkout/orders",
    {
      method: "POST",
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [
          {
            reference_id: bookingId,
            custom_id: bookingId,
            invoice_id: `FS26-${bookingId.slice(-24)}`,
            description: "Acompte Flash Septembre 2026 — B.Grumpy Tattoo",
            amount: {
              currency_code: "EUR",
              value: money(depositCents),
            },
          },
        ],
        payment_source: {
          paypal: {
            experience_context: {
              brand_name: "B.Grumpy Tattoo",
              locale: "fr-FR",
              landing_page: paymentMethod === "card" ? "BILLING" : "LOGIN",
              user_action: "PAY_NOW",
              return_url: returnUrl,
              cancel_url: cancelUrl,
            },
          },
        },
      }),
    },
    `${bookingId}:create`,
  ) as PayPalOrder;
  const approvalUrl = payload.links?.find((link) => link.rel === "payer-action" || link.rel === "approve")?.href;

  if (!payload.id || !approvalUrl) {
    throw new PayPalRequestError("PayPal n'a pas fourni le lien de paiement attendu.");
  }

  return { orderId: payload.id, approvalUrl };
};

export const captureFlashSeptemberPayPalOrder = async (orderId: string, bookingId: string) => {
  const configuration = getConfiguration();
  return callPayPal(
    configuration,
    `/v2/checkout/orders/${encodeURIComponent(orderId)}/capture`,
    { method: "POST", body: "{}" },
    `${bookingId}:capture`,
  ) as Promise<PayPalOrder>;
};

export const getFlashSeptemberPayPalOrder = async (orderId: string, bookingId: string) => {
  const configuration = getConfiguration();
  return callPayPal(
    configuration,
    `/v2/checkout/orders/${encodeURIComponent(orderId)}`,
    { method: "GET" },
    `${bookingId}:read`,
  ) as Promise<PayPalOrder>;
};

export const getFlashSeptemberPayPalCapture = (order: PayPalOrder) =>
  order.purchase_units
    ?.flatMap((unit) => unit.payments?.captures ?? [])
    .find((capture) => capture.status === "COMPLETED") ?? null;

export const verifyFlashSeptemberPayPalWebhook = async ({
  headers,
  rawEvent,
}: {
  headers: Headers;
  rawEvent: string;
}) => {
  const configuration = getConfiguration();

  if (!configuration.webhookId) {
    throw new PayPalSetupError("L'identifiant du webhook PayPal doit être configuré.");
  }

  const transmissionId = headers.get("paypal-transmission-id");
  const transmissionTime = headers.get("paypal-transmission-time");
  const transmissionSignature = headers.get("paypal-transmission-sig");
  const certificateUrl = headers.get("paypal-cert-url");
  const authAlgorithm = headers.get("paypal-auth-algo");

  if (!transmissionId || !transmissionTime || !transmissionSignature || !certificateUrl || !authAlgorithm) {
    return false;
  }

  // PayPal asks for the webhook event to be sent back exactly as it was received
  // when it verifies a notification signature. Keep the original bytes rather
  // than serializing the parsed object a second time.
  const verificationBody = [
    `{"auth_algo":${JSON.stringify(authAlgorithm)}`,
    `,"cert_url":${JSON.stringify(certificateUrl)}`,
    `,"transmission_id":${JSON.stringify(transmissionId)}`,
    `,"transmission_sig":${JSON.stringify(transmissionSignature)}`,
    `,"transmission_time":${JSON.stringify(transmissionTime)}`,
    `,"webhook_id":${JSON.stringify(configuration.webhookId)}`,
    `,"webhook_event":${rawEvent}}`,
  ].join("");

  const payload = await callPayPal(
    configuration,
    "/v1/notifications/verify-webhook-signature",
    {
      method: "POST",
      body: verificationBody,
    },
    `webhook-${transmissionId}`,
  );

  return payload.verification_status === "SUCCESS";
};

export const getFlashSeptemberOrderIdFromWebhook = (event: Record<string, unknown>) => {
  const resource = event.resource;

  if (!resource || typeof resource !== "object") {
    return null;
  }

  const values = resource as Record<string, unknown>;
  const relatedIds = values.supplementary_data;
  const orderId = relatedIds && typeof relatedIds === "object"
    ? (relatedIds as { related_ids?: { order_id?: unknown } }).related_ids?.order_id
    : undefined;

  if (typeof orderId === "string") {
    return orderId;
  }

  const eventType = typeof event.event_type === "string" ? event.event_type : "";
  return eventType.startsWith("CHECKOUT.ORDER") && typeof values.id === "string" ? values.id : null;
};
