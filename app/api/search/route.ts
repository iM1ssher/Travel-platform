import { NextRequest, NextResponse } from "next/server";
import { getSessionFromCookies } from "@/lib/session";
import { prisma } from "@/lib/prisma";

type SearchTripRow = {
  id: number;
  title: string;
  coverImage: string | null;
  summary: string | null;
  updatedAt: Date;
  averageRating: number | null;
  reviewCount: number;
  author: {
    id: number;
    name: string | null;
    avatarUrl: string | null;
  };
  favorites: Array<{ id: number }>;
};

type SearchPlannerRow = {
  id: number;
  name: string | null;
  avatarUrl: string | null;
  createdAt: Date;
  trips: Array<{ id: number }>;
  favoredByTravelers: Array<{ id: number }>;
};

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q")?.trim() ?? "";
  const sessionUser = await getSessionFromCookies();
  const favoriteTripUserId = sessionUser?.role === "traveler" || sessionUser?.role === "planner" ? sessionUser.id : null;
  const favoritePlannerTravelerId = sessionUser?.role === "traveler" ? sessionUser.id : null;

  const tripWhere = query
    ? {
        isPublished: true,
        OR: [
          { title: { contains: query, mode: "insensitive" as const } },
          { summary: { contains: query, mode: "insensitive" as const } },
        ],
      }
    : { isPublished: true };

  const plannerWhere = query
    ? {
        role: "planner",
        OR: [
          { name: { contains: query, mode: "insensitive" as const } },
          {
            trips: {
              some: {
                isPublished: true,
                OR: [
                  { title: { contains: query, mode: "insensitive" as const } },
                  { summary: { contains: query, mode: "insensitive" as const } },
                ],
              },
            },
          },
        ],
      }
    : { role: "planner" };

  const [trips, planners]: [SearchTripRow[], SearchPlannerRow[]] = await Promise.all([
    prisma.trip.findMany({
      where: tripWhere,
      orderBy: { updatedAt: "desc" },
      take: 12,
      select: {
        id: true,
        title: true,
        coverImage: true,
        summary: true,
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
        favorites: {
          where: { userId: favoriteTripUserId ?? -1 },
          select: { id: true },
        },
      },
    }),
    prisma.user.findMany({
      where: plannerWhere,
      orderBy: { createdAt: "desc" },
      take: 8,
      select: {
        id: true,
        name: true,
        avatarUrl: true,
        createdAt: true,
        trips: {
          where: { isPublished: true },
          select: { id: true },
        },
        favoredByTravelers: {
          where: { travelerId: favoritePlannerTravelerId ?? -1 },
          select: { id: true },
        },
      },
    }),
  ]);

  return NextResponse.json({
    trips: trips.map((trip: SearchTripRow) => ({
      id: trip.id,
      title: trip.title,
      coverImage: trip.coverImage,
      summary: trip.summary,
      updatedAt: trip.updatedAt.toISOString(),
      averageRating: trip.averageRating,
      reviewCount: trip.reviewCount,
      isFavorited: favoriteTripUserId ? trip.favorites.length > 0 : false,
      author: trip.author,
    })),
    planners: planners.map((planner: SearchPlannerRow) => ({
      id: planner.id,
      name: planner.name,
      avatarUrl: planner.avatarUrl,
      createdAt: planner.createdAt.toISOString(),
      publishedTripCount: planner.trips.length,
      isFavorited: favoritePlannerTravelerId ? planner.favoredByTravelers.length > 0 : false,
    })),
  });
}
