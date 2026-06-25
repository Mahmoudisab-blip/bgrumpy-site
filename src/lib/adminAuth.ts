export const adminSessionCookieName = "bgrumpy-admin-session-v2";
export const legacyAdminSessionCookieName = "bgrumpy-admin-session";

const sessionDurationSeconds = 60 * 60 * 8;

const textEncoder = new TextEncoder();

const getSecret = () => process.env.ADMIN_SESSION_SECRET?.trim() ?? "";

const toBase64Url = (bytes: ArrayBuffer) =>
  btoa(String.fromCharCode(...new Uint8Array(bytes)))
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replaceAll("=", "");

const sign = async (value: string, secret: string) => {
  const key = await crypto.subtle.importKey(
    "raw",
    textEncoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, textEncoder.encode(value));

  return toBase64Url(signature);
};

export const createAdminSession = async () => {
  const secret = getSecret();

  if (!secret) {
    throw new Error("ADMIN_SESSION_SECRET is missing");
  }

  const expiresAt = Math.floor(Date.now() / 1000) + sessionDurationSeconds;
  const payload = `admin.${expiresAt}`;
  const signature = await sign(payload, secret);

  return {
    maxAge: sessionDurationSeconds,
    value: `${payload}.${signature}`,
  };
};

export const verifyAdminSession = async (sessionValue?: string) => {
  const secret = getSecret();

  if (!secret || !sessionValue) {
    return false;
  }

  const parts = sessionValue.split(".");

  if (parts.length !== 3) {
    return false;
  }

  const [username, expiresAt, signature] = parts;
  const expiresAtNumber = Number(expiresAt);

  if (!username || !Number.isFinite(expiresAtNumber)) {
    return false;
  }

  if (expiresAtNumber <= Math.floor(Date.now() / 1000)) {
    return false;
  }

  const expectedSignature = await sign(`${username}.${expiresAt}`, secret);

  return signature === expectedSignature;
};

export const hasConfiguredAdminCredentials = () =>
  Boolean(
    process.env.ADMIN_USERNAME?.trim() &&
      process.env.ADMIN_PASSWORD?.trim() &&
      process.env.ADMIN_SESSION_SECRET?.trim(),
  );

export const isValidAdminLogin = (username: string, password: string) =>
  username === process.env.ADMIN_USERNAME?.trim() &&
  password === process.env.ADMIN_PASSWORD?.trim();
