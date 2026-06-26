import { createHmac, timingSafeEqual } from "node:crypto";
import { normalizeLoginIdentifier } from "@/src/lib/adminIdentity";

export const clientSessionCookieName = "bgrumpy-client-session-v1";

const sessionDurationSeconds = 60 * 60 * 24 * 14;

const getSecret = () =>
  process.env.CLIENT_SESSION_SECRET?.trim() ||
  process.env.ADMIN_SESSION_SECRET?.trim() ||
  "";

const toBase64Url = (value: string) =>
  Buffer.from(value, "utf8").toString("base64url");

const fromBase64Url = (value: string) =>
  Buffer.from(value, "base64url").toString("utf8");

const sign = (payload: string, secret: string) =>
  createHmac("sha256", secret).update(payload).digest("base64url");

export const createClientSession = (email: string) => {
  const secret = getSecret();

  if (!secret) {
    throw new Error("CLIENT_SESSION_SECRET or ADMIN_SESSION_SECRET is missing");
  }

  const normalizedEmail = normalizeLoginIdentifier(email);
  const expiresAt = Math.floor(Date.now() / 1000) + sessionDurationSeconds;
  const payload = `${toBase64Url(normalizedEmail)}.${expiresAt}`;
  const signature = sign(payload, secret);

  return {
    email: normalizedEmail,
    maxAge: sessionDurationSeconds,
    value: `${payload}.${signature}`,
  };
};

export const verifyClientSession = (sessionValue?: string) => {
  const secret = getSecret();

  if (!secret || !sessionValue) {
    return null;
  }

  const parts = sessionValue.split(".");

  if (parts.length !== 3) {
    return null;
  }

  const [encodedEmail, expiresAt, signature] = parts;
  const expiresAtNumber = Number(expiresAt);

  if (!encodedEmail || !Number.isFinite(expiresAtNumber)) {
    return null;
  }

  if (expiresAtNumber <= Math.floor(Date.now() / 1000)) {
    return null;
  }

  const payload = `${encodedEmail}.${expiresAt}`;
  const expectedSignature = sign(payload, secret);
  const actual = Buffer.from(signature);
  const expected = Buffer.from(expectedSignature);

  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) {
    return null;
  }

  return {
    email: normalizeLoginIdentifier(fromBase64Url(encodedEmail)),
  };
};
