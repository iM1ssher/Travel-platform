import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromCookies } from "@/lib/session";

export async function GET() {
  const user = await getSessionFromCookies();

  if (!user) {
    return NextResponse.json({ drafts: [], publishedTrips: [] }, { status: 401 });
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

  const publishedTrips = await prisma.trip.findMany({
    where: {
      authorId: user.id,
      isPublished: true,
    },
    orderBy: {
      updatedAt: "desc",
    },
    select: {
      id: true,
      title: true,
      updatedAt: true,
      averageRating: true,
      reviewCount: true,
    },
  });

  return NextResponse.json({ drafts, publishedTrips });
}
