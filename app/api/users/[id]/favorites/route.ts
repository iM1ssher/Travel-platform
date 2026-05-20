import { NextResponse } from "next/server";
import { getSessionFromCookies } from "@/lib/session";
import { prisma } from "@/lib/prisma";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_: Request, { params }: RouteParams) {
  const resolvedParams = await params;
  const userId = Number.parseInt(resolvedParams.id, 10);

  if (Number.isNaN(userId)) {
    return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
  }

  const sessionUser = await getSessionFromCookies();
  if (!sessionUser || sessionUser.id !== userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [tripFavorites, plannerFavorites] = await Promise.all([
    prisma.favoriteTrip.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        createdAt: true,
        trip: {
          select: {
            id: true,
            title: true,
            summary: true,
            coverImage: true,
            isPublished: true,
            updatedAt: true,
            averageRating: true,
            reviewCount: true,
            author: {
              select: {
                id: true,
                name: true,
                avatarUrl: true,
              },
            },
          },
        },
      },
    }),
    prisma.favoritePlanner.findMany({
      where: { travelerId: userId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        createdAt: true,
        planner: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
            createdAt: true,
            trips: {
              where: { isPublished: true },
              select: { id: true },
            },
          },
        },
      },
    }),
  ]);

  return NextResponse.json({
    trips: tripFavorites.map((favorite) => ({
      id: favorite.id,
      favoritedAt: favorite.createdAt.toISOString(),
      trip: {
        ...favorite.trip,
        updatedAt: favorite.trip.updatedAt.toISOString(),
      },
    })),
    planners: plannerFavorites.map((favorite) => ({
      id: favorite.id,
      favoritedAt: favorite.createdAt.toISOString(),
      planner: {
        id: favorite.planner.id,
        name: favorite.planner.name,
        avatarUrl: favorite.planner.avatarUrl,
        createdAt: favorite.planner.createdAt.toISOString(),
        publishedTripCount: favorite.planner.trips.length,
      },
    })),
  });
}
