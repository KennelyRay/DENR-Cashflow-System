import { SignJWT, jwtVerify } from "jose";

export const SESSION_COOKIE_NAME = "denr_cashflow_session";

export type SessionPayload = {
  sub: string;
  username: string;
  iat: number;
  exp: number;
};

function getSecretKey() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("Missing AUTH_SECRET");
  return new TextEncoder().encode(secret);
}

export async function signSessionToken(input: {
  userId: string;
  username: string;
}) {
  const secretKey = getSecretKey();
  return await new SignJWT({ username: input.username })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(input.userId)
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secretKey);
}

export async function verifySessionToken(token: string) {
  const secretKey = getSecretKey();
  const { payload } = await jwtVerify(token, secretKey);

  const sub = typeof payload.sub === "string" ? payload.sub : null;
  const username = typeof payload.username === "string" ? payload.username : null;
  const iat = typeof payload.iat === "number" ? payload.iat : null;
  const exp = typeof payload.exp === "number" ? payload.exp : null;

  if (!sub || !username || !iat || !exp) return null;
  return { sub, username, iat, exp } satisfies SessionPayload;
}

