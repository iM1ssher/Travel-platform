import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromCookies } from "@/lib/session";

type ProfilePayload = {
  name?: unknown;
  avatarUrl?: unknown;
};

function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export async function PATCH(request: Request) {
  const session = await getSessionFromCookies();

  if (!session) {
    return NextResponse.json({ message: "請先登入後再更新個人資料。" }, { status: 401 });
  }

  let payload: ProfilePayload;
  try {
    payload = (await request.json()) as ProfilePayload;
  } catch {
    return NextResponse.json({ message: "請提供有效的 JSON 資料。" }, { status: 400 });
  }

  if (typeof payload.name !== "string") {
    return NextResponse.json({ message: "請提供顯示名稱。" }, { status: 400 });
  }

  const name = payload.name.trim();
  if (name.length < 2) {
    return NextResponse.json({ message: "顯示名稱至少需要 2 個字元。" }, { status: 400 });
  }

  if (payload.avatarUrl !== undefined && typeof payload.avatarUrl !== "string") {
    return NextResponse.json({ message: "頭像網址格式不正確。" }, { status: 400 });
  }

  const avatarUrl = typeof payload.avatarUrl === "string" ? payload.avatarUrl.trim() : "";
  if (avatarUrl && !isHttpUrl(avatarUrl)) {
    return NextResponse.json({ message: "頭像網址必須是 http 或 https URL。" }, { status: 400 });
  }

  const updatedUser = await prisma.user.update({
    where: { id: session.id },
    data: {
      name,
      avatarUrl: avatarUrl || null,
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      avatarUrl: true,
    },
  });

  return NextResponse.json({
    user: {
      id: updatedUser.id,
      email: updatedUser.email,
      name: updatedUser.name ?? updatedUser.email,
      role: updatedUser.role,
      avatarUrl: updatedUser.avatarUrl,
    },
  });
}
