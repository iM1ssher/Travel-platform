// 後端 - 註冊 API：處理新使用者註冊並建立會話

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, createSessionCookie, badRequest, conflict } from "@/lib/auth";

const ALLOWED_ROLES = ["traveler", "planner"] as const;
type AllowedRole = (typeof ALLOWED_ROLES)[number];

export async function POST(request: Request) {
  const body = await request.json();
  const { email, password, role, name } = body as { email?: string; password?: string; role?: string; name?: string };

  if (!email || !password || !role || !name) {
    return badRequest("請填寫所有必要欄位。");
  }

  if (role === "admin") {
    return badRequest("管理員註冊受限，請聯絡系統管理員。");
  }

  if (!ALLOWED_ROLES.includes(role as AllowedRole)) {
    return badRequest("角色不正確，請選擇 traveler 或 planner。");
  }

  if (name.trim().length < 2) {
    return badRequest("名稱至少需要 2 個字元。");
  }

  if (password.length < 6) {
    return badRequest("密碼長度至少需要 6 個字元。");
  }

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    return conflict("此 Email 已經被使用，請改用其他帳號登入。" );
  }

  const hashedPassword = hashPassword(password);

  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      role,
      name: name.trim(),
    },
  });

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





