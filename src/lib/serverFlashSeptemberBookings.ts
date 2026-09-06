import { randomUUID } from "node:crypto";
import { ensureDatabase, hasDatabase, query } from "./database";
import {
  FLASH_SEPTEMBER_PAYMENT_PROVIDERS,
  type SeptemberContact,
  type SeptemberFlash,
  type SeptemberPaymentProvider,
  type SeptemberReferenceAttachment,
} from "./flashSeptember";

export const FLASH_SEPTEMBER_PENDING_STATUS = "Paiement en attente";

export type FlashSeptemberPricing = {
  lines: Array<SeptemberFlash & { price: number }>;
  count: number;
  total: number;
  deposit: number;
  remaining: number;
  discount: number;
};

export type FlashSeptemberBooking = {
  id: string;
  requestId: string;
  siteOrigin: string;
  paypalOrderId: string | null;
  paymentProvider: SeptemberPaymentProvider;
  paymentReference: string | null;
  attachments: SeptemberReferenceAttachment[];
  status: string;
  contact: SeptemberContact;
  selection: SeptemberFlash[];
  pricing: FlashSeptemberPricing;
  payment: Record<string, unknown> | null;
  createdAt: string;
  paidAt: string | null;
  emailsSentAt: string | null;
};

type BookingRow = {
  id: string;
  request_id: string;
  site_origin: string;
  paypal_order_id: string | null;
  payment_provider: string;
  payment_reference: string | null;
  attachments: SeptemberReferenceAttachment[] | string;
  status: string;
  contact: SeptemberContact | string;
  selection: SeptemberFlash[] | string;
  pricing: FlashSeptemberPricing | string;
  payment: Record<string, unknown> | string | null;
  created_at: Date | string;
  paid_at: Date | string | null;
  emails_sent_at: Date | string | null;
};

let schemaReady: Promise<void> | null = null;

const asJson = <Value,>(value: Value | string): Value =>
  typeof value === "string" ? (JSON.parse(value) as Value) : value;

const asIsoDate = (value: Date | string | null) =>
  value === null ? null : value instanceof Date ? value.toISOString() : new Date(value).toISOString();

const asPaymentProvider = (value: string | null | undefined): SeptemberPaymentProvider =>
  value && (FLASH_SEPTEMBER_PAYMENT_PROVIDERS as readonly string[]).includes(value)
    ? value as SeptemberPaymentProvider
    : "paypal";

const mapBooking = (row: BookingRow): FlashSeptemberBooking => ({
  id: row.id,
  requestId: row.request_id,
  siteOrigin: row.site_origin,
  paypalOrderId: row.paypal_order_id,
  paymentProvider: asPaymentProvider(row.payment_provider),
  paymentReference: row.payment_reference,
  attachments: asJson<SeptemberReferenceAttachment[]>(row.attachments ?? "[]"),
  status: row.status,
  contact: asJson<SeptemberContact>(row.contact),
  selection: asJson<SeptemberFlash[]>(row.selection),
  pricing: asJson<FlashSeptemberPricing>(row.pricing),
  payment: row.payment === null ? null : asJson<Record<string, unknown>>(row.payment),
  createdAt: asIsoDate(row.created_at) ?? new Date().toISOString(),
  paidAt: asIsoDate(row.paid_at),
  emailsSentAt: asIsoDate(row.emails_sent_at),
});

const ensureFlashSeptemberBookings = async () => {
  if (!hasDatabase()) {
    throw new Error("La base de données de réservation doit être activée avant le paiement.");
  }

  schemaReady ??= (async () => {
    await ensureDatabase();
    await query`
      CREATE TABLE IF NOT EXISTS flash_september_bookings (
        id TEXT PRIMARY KEY,
        request_id TEXT UNIQUE NOT NULL,
        site_origin TEXT NOT NULL,
        paypal_order_id TEXT UNIQUE,
        payment_provider TEXT NOT NULL DEFAULT 'paypal',
        payment_reference TEXT UNIQUE,
        attachments JSONB NOT NULL DEFAULT '[]'::jsonb,
        status TEXT NOT NULL,
        contact JSONB NOT NULL,
        selection JSONB NOT NULL,
        pricing JSONB NOT NULL,
        payment JSONB,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        paid_at TIMESTAMPTZ,
        emails_sent_at TIMESTAMPTZ
      )
    `;
    await query`
      ALTER TABLE flash_september_bookings
      ADD COLUMN IF NOT EXISTS site_origin TEXT
    `;
    await query`
      ALTER TABLE flash_september_bookings
      ADD COLUMN IF NOT EXISTS payment_provider TEXT NOT NULL DEFAULT 'paypal'
    `;
    await query`
      ALTER TABLE flash_september_bookings
      ADD COLUMN IF NOT EXISTS payment_reference TEXT UNIQUE
    `;
    await query`
      ALTER TABLE flash_september_bookings
      ADD COLUMN IF NOT EXISTS attachments JSONB NOT NULL DEFAULT '[]'::jsonb
    `;
    await query`
      UPDATE flash_september_bookings
      SET payment_provider = 'paypal'
      WHERE payment_provider IS NULL OR payment_provider NOT IN ('paypal', 'paypal_card', 'sumup_card')
    `;
    await query`
      UPDATE flash_september_bookings
      SET attachments = '[]'::jsonb
      WHERE attachments IS NULL
    `;
    await query`
      UPDATE flash_september_bookings
      SET site_origin = 'https://bgrumpy-site.vercel.app'
      WHERE site_origin IS NULL
    `;
    await query`
      ALTER TABLE flash_september_bookings
      ALTER COLUMN site_origin SET NOT NULL
    `;
    await query`
      CREATE INDEX IF NOT EXISTS flash_september_bookings_status_created_idx
      ON flash_september_bookings (status, created_at DESC)
    `;
  })();

  await schemaReady;
};

export const createFlashSeptemberBooking = async ({
  requestId,
  siteOrigin,
  contact,
  selection,
  pricing,
  paymentProvider,
  attachments,
}: {
  requestId: string;
  siteOrigin: string;
  contact: SeptemberContact;
  selection: SeptemberFlash[];
  pricing: FlashSeptemberPricing;
  paymentProvider: SeptemberPaymentProvider;
  attachments: SeptemberReferenceAttachment[];
}) => {
  await ensureFlashSeptemberBookings();

  const id = `flash-septembre-${randomUUID()}`;
  const rows = await query<BookingRow>`
    INSERT INTO flash_september_bookings (id, request_id, site_origin, payment_provider, attachments, status, contact, selection, pricing)
    VALUES (
      ${id},
      ${requestId},
      ${siteOrigin},
      ${paymentProvider},
      ${JSON.stringify(attachments)}::jsonb,
      ${FLASH_SEPTEMBER_PENDING_STATUS},
      ${JSON.stringify(contact)}::jsonb,
      ${JSON.stringify(selection)}::jsonb,
      ${JSON.stringify(pricing)}::jsonb
    )
    ON CONFLICT (request_id) DO UPDATE SET
      contact = EXCLUDED.contact,
      selection = EXCLUDED.selection,
      pricing = EXCLUDED.pricing,
      site_origin = EXCLUDED.site_origin,
      payment_provider = EXCLUDED.payment_provider,
      attachments = EXCLUDED.attachments
    RETURNING *
  `;

  return mapBooking(rows[0]);
};

export const getFlashSeptemberBooking = async (id: string) => {
  await ensureFlashSeptemberBookings();
  const rows = await query<BookingRow>`
    SELECT *
    FROM flash_september_bookings
    WHERE id = ${id}
    LIMIT 1
  `;

  return rows[0] ? mapBooking(rows[0]) : null;
};

export const getFlashSeptemberBookingByOrder = async (paypalOrderId: string) => {
  await ensureFlashSeptemberBookings();
  const rows = await query<BookingRow>`
    SELECT *
    FROM flash_september_bookings
    WHERE paypal_order_id = ${paypalOrderId}
    LIMIT 1
  `;

  return rows[0] ? mapBooking(rows[0]) : null;
};

export const getFlashSeptemberBookingByPaymentReference = async (paymentReference: string) => {
  await ensureFlashSeptemberBookings();
  const rows = await query<BookingRow>`
    SELECT *
    FROM flash_september_bookings
    WHERE payment_reference = ${paymentReference}
    LIMIT 1
  `;

  return rows[0] ? mapBooking(rows[0]) : null;
};

export const setFlashSeptemberPaymentReference = async ({
  bookingId,
  provider,
  reference,
}: {
  bookingId: string;
  provider: SeptemberPaymentProvider;
  reference: string;
}) => {
  await ensureFlashSeptemberBookings();
  const paypalOrderId = provider === "sumup_card" ? null : reference;
  const rows = await query<BookingRow>`
    UPDATE flash_september_bookings
    SET payment_provider = ${provider},
        payment_reference = ${reference},
        paypal_order_id = ${paypalOrderId}
    WHERE id = ${bookingId}
    RETURNING *
  `;

  if (!rows[0]) {
    throw new Error("La réservation est introuvable.");
  }

  return mapBooking(rows[0]);
};

export const setFlashSeptemberPayPalOrder = async (bookingId: string, paypalOrderId: string) => {
  return setFlashSeptemberPaymentReference({ bookingId, provider: "paypal", reference: paypalOrderId });
};

export const markFlashSeptemberBookingPaid = async (
  bookingId: string,
  status: string,
  payment: Record<string, unknown>,
) => {
  await ensureFlashSeptemberBookings();
  const rows = await query<BookingRow>`
    UPDATE flash_september_bookings
    SET status = ${status}, payment = ${JSON.stringify(payment)}::jsonb, paid_at = NOW()
    WHERE id = ${bookingId} AND paid_at IS NULL
    RETURNING *
  `;

  if (rows[0]) {
    return { booking: mapBooking(rows[0]), newlyPaid: true };
  }

  const existing = await getFlashSeptemberBooking(bookingId);

  if (!existing) {
    throw new Error("La réservation est introuvable.");
  }

  return { booking: existing, newlyPaid: false };
};

export const markFlashSeptemberEmailsSent = async (bookingId: string) => {
  await ensureFlashSeptemberBookings();
  const rows = await query<BookingRow>`
    UPDATE flash_september_bookings
    SET emails_sent_at = NOW()
    WHERE id = ${bookingId} AND emails_sent_at IS NULL
    RETURNING *
  `;

  if (rows[0]) {
    return mapBooking(rows[0]);
  }

  return getFlashSeptemberBooking(bookingId);
};
