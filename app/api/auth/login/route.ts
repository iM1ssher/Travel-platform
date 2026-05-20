// 後端 - 登入 API：驗證使用者憑證並建立登入會話

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword, createSessionCookie, badRequest, unauthorized } from "@/lib/auth";

export async function POST(request: Request) {
  const body = await request.json();
  const { email, password, role } = body as { email?: string; password?: string; role?: string };

  if (!email || !password || !role) {
    return badRequest("缺少必要欄位。");
  }

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user || user.role !== role) {
    return unauthorized("帳號或密碼錯誤。");
  }

  const isValid = verifyPassword(password, user.password);

  if (!isValid) {
    return unauthorized("帳號或密碼錯誤。");
  }

  const sessionData = {
    email: user.email,
    name: user.name ?? user.email,
    role: user.role,
  };

  const cookieValue = createSessionCookie(sessionData);
  return NextResponse.json(
    {
      user: {
        id: user.id,
        email: user.email,
        name: user.name ?? user.email,
        role: user.role,
        avatarUrl: user.avatarUrl,
      },
    },
    { headers: { "Set-Cookie": cookieValue } }
  );
}





