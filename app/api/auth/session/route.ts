import { NextResponse } from "next/server";
import { getSessionFromCookies } from "@/lib/session";

export async function GET() {
  const user = await getSessionFromCookies();

  if (!user) {
    return NextResponse.json({ user: null });
  }

  return NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name ?? user.email,
      role: user.role,
      avatarUrl: user.avatarUrl,
    },
  });
}





