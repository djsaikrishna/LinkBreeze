import "server-only";
import * as bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import {
  createToken,
  verifyToken,
  SESSION_MAX_AGE,
  type SessionPayload,
} from "@/lib/session-token";

const SESSION_COOKIE = "lb_session";

export type { SessionPayload };

/**
 * Read and verify the session cookie. Returns the session payload or null.
 */
export async function getSession(): Promise<SessionPayload | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifyToken(token);
}

/**
 * Set a signed, httpOnly session cookie.
 */
export async function createSession(userId: number, username: string): Promise<void> {
  const store = await cookies();
  const payload: SessionPayload = {
    userId,
    username,
    exp: Date.now() + SESSION_MAX_AGE * 1000,
  };
  const token = createToken(payload);
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

/**
 * Clear the session cookie.
 */
export async function destroySession(): Promise<void> {
  const store = await cookies();
  store.set(SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}

/**
 * Hash a password with bcrypt (12 rounds).
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

/**
 * Verify a plaintext password against a bcrypt hash.
 */
export async function verifyPassword(
  password: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
