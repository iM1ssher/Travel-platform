// 後端 - 登出 API：清除使用者會話並使 cookie 失效

import { NextResponse } from "next/server";

export async function POST() {
  const securePart = process.env.NODE_ENV === "production" ? " Secure;" : "";
  const cookieValue = `aiTravelSession=; Path=/; HttpOnly; SameSite=Lax;${securePart} Max-Age=0`;

  return NextResponse.json({ ok: true }, { headers: { "Set-Cookie": cookieValue } });
}





