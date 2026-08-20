import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createSession, verifyPassword } from "@/lib/auth";

function back(request: Request, message: string) {
  const url = new URL("/login", request.url);
  url.searchParams.set("error", message);
  return NextResponse.redirect(url, 303);
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const email = String(formData.get("email") || "").trim().toLowerCase();
    const password = String(formData.get("password") || "");

    if (!email || !password) return back(request, "Preencha email e senha.");

    const user = await db.user.findUnique({ where: { email } });
    if (!user || !verifyPassword(password, user.passwordHash)) {
      return back(request, "Credenciais inválidas.");
    }
    if (user.status !== "ACTIVE") return back(request, "Conta bloqueada.");

    await createSession(user.id);
    return NextResponse.redirect(new URL(user.role === "ADMIN" ? "/admin" : "/dashboard", request.url), 303);
  } catch (error) {
    console.error("[AttoFlow][LOGIN]", error);
    return back(request, "Serviço de contas indisponível. Configure o banco de produção.");
  }
}
