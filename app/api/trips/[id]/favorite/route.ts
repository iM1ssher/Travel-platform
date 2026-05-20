import { NextResponse } from "next/server";
import { getSessionFromCookies } from "@/lib/session";
import { prisma } from "@/lib/prisma";

interface RouteParams {
  params: Promise<{ id: string }>;
}

const canManageTripFavorites = (role: string): boolean => role === "traveler" || role === "planner";

export async function GET(_: Request, { params }: RouteParams) {
  const sessionUser = await getSessionFromCookies();
  if (!sessionUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!canManageTripFavorites(sessionUser.role)) {
    return NextResponse.json({ error: "Only travelers and planners can manage trip favorites" }, { status: 403 });
  }

  const resolvedParams = await params;
  const tripId = Number.parseInt(resolvedParams.id, 10);
  if (Number.isNaN(tripId)) {
    return NextResponse.json({ error: "Invalid trip ID" }, { status: 400 });
  }

  const favorite = await prisma.favoriteTrip.findUnique({
    where: {
      userId_tripId: {
        userId: sessionUser.id,
        tripId,
      },
    },
    select: { id: true },
  });

  return NextResponse.json({ isFavorited: Boolean(favorite) });
}

export async function POST(_: Request, { params }: RouteParams) {
  const sessionUser = await getSessionFromCookies();
  if (!sessionUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!canManageTripFavorites(sessionUser.role)) {
    return NextResponse.json({ error: "Only travelers and planners can manage trip favorites" }, { status: 403 });
  }

  const resolvedParams = await params;
  const tripId = Number.parseInt(resolvedParams.id, 10);
  if (Number.isNaN(tripId)) {
    return NextResponse.json({ error: "Invalid trip ID" }, { status: 400 });
  }

  const trip = await prisma.trip.findFirst({
    where: {
      id: tripId,
      isPublished: true,
    },
    select: { id: true },
  });

  if (!trip) {
    return NextResponse.json({ error: "Trip not found" }, { status: 404 });
  }

  await prisma.favoriteTrip.upsert({
    where: {
      userId_tripId: {
        userId: sessionUser.id,
        tripId,
      },
    },
    update: {},
    create: {
      userId: sessionUser.id,
      tripId,
    },
  });

  return NextResponse.json({ ok: true, isFavorited: true });
}

export async function DELETE(_: Request, { params }: RouteParams) {
  const sessionUser = await getSessionFromCookies();
  if (!sessionUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!canManageTripFavorites(sessionUser.role)) {
    return NextResponse.json({ error: "Only travelers and planners can manage trip favorites" }, { status: 403 });
  }

  const resolvedParams = await params;
  const tripId = Number.parseInt(resolvedParams.id, 10);
  if (Number.isNaN(tripId)) {
    return NextResponse.json({ error: "Invalid trip ID" }, { status: 400 });
  }

  await prisma.favoriteTrip.deleteMany({
    where: {
      userId: sessionUser.id,
      tripId,
    },
  });

  return NextResponse.json({ ok: true, isFavorited: false });
}
