import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createSession, hashPassword, makeReferralCode } from "@/lib/auth";

function back(request: Request, message: string) {
  const url = new URL("/register", request.url);
  url.searchParams.set("error", message);
  return NextResponse.redirect(url, 303);
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const name = String(formData.get("name") || "").trim();
    const email = String(formData.get("email") || "").trim().toLowerCase();
    const password = String(formData.get("password") || "");
    const nickname = String(formData.get("nickname") || "").trim();
    const freeFireUid = String(formData.get("freeFireUid") || "").trim();
    const phone = String(formData.get("phone") || "").trim();
    const referral = String(formData.get("referral") || "").trim().toUpperCase();

    if (name.length < 2 || !email.includes("@") || password.length < 8) {
      return back(request, "Confira os dados informados.");
    }

    const exists = await db.user.findUnique({ where: { email } });
    if (exists) return back(request, "Este email já está cadastrado.");

    const referrer = referral
      ? await db.user.findUnique({ where: { referralCode: referral } })
      : null;

    let referralCode = makeReferralCode(name);
    while (await db.user.findUnique({ where: { referralCode } })) {
      referralCode = makeReferralCode(name);
    }

    const user = await db.user.create({
      data: {
        name,
        email,
        passwordHash: hashPassword(password),
        nickname: nickname || null,
        freeFireUid: freeFireUid || null,
        phone: phone || null,
        referralCode,
        referredById: referrer?.id,
        credits: 100,
      },
    });

    if (referrer) {
      await db.$transaction([
        db.user.update({ where: { id: referrer.id }, data: { credits: { increment: 25 } } }),
        db.reward.create({
          data: {
            userId: referrer.id,
            title: "Bônus por indicação",
            description: `${name} entrou usando seu código.`,
            credits: 25,
            source: "REFERRAL",
          },
        }),
        db.reward.create({
          data: {
            userId: user.id,
            title: "Boas-vindas por indicação",
            description: "Você entrou por um convite AttoFlow.",
            credits: 10,
            source: "REFERRAL",
          },
        }),
        db.user.update({ where: { id: user.id }, data: { credits: { increment: 10 } } }),
      ]);
    }

    await createSession(user.id);
    return NextResponse.redirect(new URL("/dashboard", request.url), 303);
  } catch (error) {
    console.error("[AttoFlow][REGISTER]", error);
    return back(request, "Serviço de contas indisponível. Configure o banco de produção.");
  }
}
