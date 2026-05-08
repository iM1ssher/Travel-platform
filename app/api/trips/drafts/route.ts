import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromCookies } from "@/lib/session";

export async function GET() {
  const user = await getSessionFromCookies();

  if (!user) {
    return NextResponse.json({ drafts: [] }, { status: 401 });
  }

  const drafts = await prisma.trip.findMany({
    where: {
      authorId: user.id,
      isPublished: false,
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  return NextResponse.json({ drafts });
}
