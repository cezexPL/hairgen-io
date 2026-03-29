import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { queryOne } from "./db/index";
import crypto from "crypto";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me-in-production-min-32-chars";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";
const COOKIE_NAME = "hairgen_session";

export interface JwtPayload {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  credits_balance: number;
  subscription_tier: string;
  gdpr_consent: boolean;
}

export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function createToken(userId: string, email: string): string {
  return jwt.sign({ userId, email }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN as string,
  } as jwt.SignOptions);
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch {
    return null;
  }
}

function hashTokenValue(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export async function createSession(userId: string, email: string): Promise<string> {
  const token = createToken(userId, email);
  const tokenHash = hashTokenValue(token);
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  await queryOne(
    `INSERT INTO sessions (user_id, token_hash, expires_at) VALUES ($1, $2, $3) RETURNING id`,
    [userId, tokenHash, expiresAt.toISOString()]
  );

  return token;
}

export async function invalidateSession(token: string): Promise<void> {
  const tokenHash = hashTokenValue(token);
  await queryOne("DELETE FROM sessions WHERE token_hash = $1", [tokenHash]);
}

export async function getTokenFromRequest(request?: Request): Promise<string | null> {
  // Try Bearer header first
  if (request) {
    const authHeader = request.headers.get("authorization");
    if (authHeader?.startsWith("Bearer ")) {
      return authHeader.slice(7);
    }
  }

  // Try httpOnly cookie
  try {
    const cookieStore = await cookies();
    const cookie = cookieStore.get(COOKIE_NAME);
    if (cookie?.value) {
      return cookie.value;
    }
  } catch {
    // cookies() not available outside request context
  }

  return null;
}

export async function getAuthUser(request?: Request): Promise<AuthUser | null> {
  const token = await getTokenFromRequest(request);
  if (!token) return null;

  const payload = verifyToken(token);
  if (!payload) return null;

  // Verify session exists and not expired
  const tokenHash = hashTokenValue(token);
  const session = await queryOne<{ id: string }>(
    "SELECT id FROM sessions WHERE token_hash = $1 AND expires_at > NOW()",
    [tokenHash]
  );
  if (!session) return null;

  const user = await queryOne<AuthUser>(
    "SELECT id, email, name, credits_balance, subscription_tier, gdpr_consent FROM users WHERE id = $1",
    [payload.userId]
  );

  return user;
}

export function setAuthCookie(token: string): { name: string; value: string; options: Record<string, unknown> } {
  return {
    name: COOKIE_NAME,
    value: token,
    options: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax" as const,
      path: "/",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    },
  };
}

export function clearAuthCookie(): { name: string; value: string; options: Record<string, unknown> } {
  return {
    name: COOKIE_NAME,
    value: "",
    options: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax" as const,
      path: "/",
      maxAge: 0,
    },
  };
}
