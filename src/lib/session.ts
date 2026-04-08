import { cookies } from "next/headers";
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/auth-token";

export async function getSession() {
  const token = (await cookies()).get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const payload = await verifySessionToken(token);
    if (!payload) return null;
    return { userId: payload.sub, username: payload.username };
  } catch {
    return null;
  }
}

