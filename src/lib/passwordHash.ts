import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(scryptCallback);
const passwordHashPrefix = "scrypt";
const keyLength = 64;

export const hashPassword = async (password: string) => {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = (await scrypt(password, salt, keyLength)) as Buffer;

  return `${passwordHashPrefix}$${salt}$${derivedKey.toString("hex")}`;
};

const isHashedPassword = (storedPassword: string) =>
  storedPassword.startsWith(`${passwordHashPrefix}$`);

export const verifyPassword = async (password: string, storedPassword: string) => {
  if (!isHashedPassword(storedPassword)) {
    return {
      valid: storedPassword === password,
      needsRehash: storedPassword === password,
    };
  }

  const [, salt, storedHash] = storedPassword.split("$");

  if (!salt || !storedHash) {
    return { valid: false, needsRehash: true };
  }

  const storedBuffer = Buffer.from(storedHash, "hex");
  const derivedKey = (await scrypt(password, salt, storedBuffer.length)) as Buffer;
  const valid =
    storedBuffer.length === derivedKey.length && timingSafeEqual(storedBuffer, derivedKey);

  return { valid, needsRehash: false };
};
