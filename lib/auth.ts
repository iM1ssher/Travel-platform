import { randomBytes, scryptSync, timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";

const SCRYPT_KEY_LEN = 64;
const SCRYPT_SALT_LEN = 16;
const SCRYPT_N = 16384;
const SCRYPT_R = 8;
const SCRYPT_P = 1;

export function hashPassword(password: string) {
  const salt = randomBytes(SCRYPT_SALT_LEN).toString("hex");
  const derivedKey = scryptSync(password, salt, SCRYPT_KEY_LEN, {
    N: SCRYPT_N,
    r: SCRYPT_R,
    p: SCRYPT_P,
  });

  return `${salt}:${derivedKey.toString("hex")}`;
}

export function verifyPassword(password: string, storedHash: string) {
  const [salt, key] = storedHash.split(":");

  if (!salt || !key) {
    return false;
  }

  const derivedKey = scryptSync(password, salt, SCRYPT_KEY_LEN, {
    N: SCRYPT_N,
    r: SCRYPT_R,
    p: SCRYPT_P,
  });

  const storedKey = Buffer.from(key, "hex");
  return timingSafeEqual(derivedKey, storedKey);
}

export function createSessionCookie(sessionData: { email: string; name: string; role: string }) {
  const encodedValue = encodeURIComponent(JSON.stringify(sessionData));
  const securePart = process.env.NODE_ENV === "production" ? " Secure;" : "";

  return `aiTravelSession=${encodedValue}; Path=/; HttpOnly; SameSite=Lax;${securePart} Max-Age=604800`;
}

export function badRequest(message: string) {
  return NextResponse.json({ message }, { status: 400 });
}

export function unauthorized(message: string) {
  return NextResponse.json({ message }, { status: 401 });
}

export function conflict(message: string) {
  return NextResponse.json({ message }, { status: 409 });
}
