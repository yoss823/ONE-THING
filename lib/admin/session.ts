import { SignJWT, jwtVerify } from "jose";

export const ADMIN_COOKIE_NAME = "onestep_admin";

function getJwtSecretKey(): Uint8Array {
  const s = process.env.ADMIN_JWT_SECRET?.trim();
  if (!s || s.length < 16) {
    throw new Error("ADMIN_JWT_SECRET must be set (minimum 16 characters).");
  }
  return new TextEncoder().encode(s);
}

export async function signAdminSession(adminUserId: string): Promise<string> {
  return new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(adminUserId)
    .setExpirationTime("7d")
    .setIssuedAt()
    .sign(getJwtSecretKey());
}

export async function verifyAdminSession(token: string): Promise<string | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecretKey());
    return typeof payload.sub === "string" ? payload.sub : null;
  } catch {
    return null;
  }
}
