import { cookies } from "next/headers";
import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "crypto";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";

const COOKIE = "attoflow_session";
const TTL = 60 * 60 * 24 * 7;
export const BOOTSTRAP_ADMIN_ID = "__attoflow_bootstrap_admin__";

function secret() {
  return process.env.AUTH_SECRET || "dev-only-change-this-secret";
}

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string) {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const derived = scryptSync(password, salt, 64);
  const expected = Buffer.from(hash, "hex");
  return expected.length === derived.length && timingSafeEqual(expected, derived);
}

function sign(payload: string) {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

export async function createSession(userId: string) {
  const exp = Math.floor(Date.now() / 1000) + TTL;
  const payload = Buffer.from(JSON.stringify({ userId, exp })).toString("base64url");
  const token = `${payload}.${sign(payload)}`;
  const jar = await cookies();
  jar.set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: TTL,
  });
}

export async function destroySession() {
  const jar = await cookies();
  jar.delete(COOKIE);
}

async function sessionUserId() {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;
  const a = Buffer.from(signature);
  const b = Buffer.from(sign(payload));
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (!data.userId || !data.exp || data.exp < Math.floor(Date.now() / 1000)) return null;
    return String(data.userId);
  } catch {
    return null;
  }
}

function bootstrapAdmin() {
  const email = process.env.ADMIN_BOOTSTRAP_EMAIL?.trim().toLowerCase();
  if (!email) return null;
  const now = new Date();
  return {
    id: BOOTSTRAP_ADMIN_ID,
    name: "Administrador AttoFlow",
    email,
    passwordHash: "",
    nickname: "ADMIN",
    freeFireUid: null,
    phone: null,
    role: "ADMIN" as const,
    status: "ACTIVE" as const,
    credits: 0,
    referralCode: "ADMIN",
    referredById: null,
    createdAt: now,
    updatedAt: now,
  };
}

export async function getCurrentUser() {
  const id = await sessionUserId();
  if (!id) return null;

  if (id === BOOTSTRAP_ADMIN_ID) return bootstrapAdmin();

  try {
    return await db.user.findUnique({ where: { id } });
  } catch (error) {
    console.error("[AttoFlow][DB] Could not load current user", error);
    return null;
  }
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user || user.status !== "ACTIVE") redirect("/login?error=Serviço%20de%20contas%20indisponível");
  return user;
}

export async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== "ADMIN") redirect("/dashboard");
  return user;
}

export function makeReferralCode(name: string) {
  const base = name.replace(/[^a-zA-Z0-9]/g, "").slice(0, 6).toUpperCase() || "ATTO";
  return `${base}${randomBytes(3).toString("hex").toUpperCase()}`;
}
