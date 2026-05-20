import { NextResponse } from "next/server";
import { getSessionFromCookies } from "@/lib/session";
import { prisma } from "@/lib/prisma";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_: Request, { params }: RouteParams) {
  const sessionUser = await getSessionFromCookies();
  if (!sessionUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (sessionUser.role !== "traveler") {
    return NextResponse.json({ error: "Only travelers can manage favorites" }, { status: 403 });
  }

  const resolvedParams = await params;
  const plannerId = Number.parseInt(resolvedParams.id, 10);
  if (Number.isNaN(plannerId)) {
    return NextResponse.json({ error: "Invalid planner ID" }, { status: 400 });
  }

  const favorite = await prisma.favoritePlanner.findUnique({
    where: {
      travelerId_plannerId: {
        travelerId: sessionUser.id,
        plannerId,
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

  if (sessionUser.role !== "traveler") {
    return NextResponse.json({ error: "Only travelers can manage favorites" }, { status: 403 });
  }

  const resolvedParams = await params;
  const plannerId = Number.parseInt(resolvedParams.id, 10);
  if (Number.isNaN(plannerId)) {
    return NextResponse.json({ error: "Invalid planner ID" }, { status: 400 });
  }

  if (plannerId === sessionUser.id) {
    return NextResponse.json({ error: "Cannot favorite yourself" }, { status: 400 });
  }

  const planner = await prisma.user.findFirst({
    where: {
      id: plannerId,
      role: "planner",
    },
    select: { id: true },
  });

  if (!planner) {
    return NextResponse.json({ error: "Planner not found" }, { status: 404 });
  }

  await prisma.favoritePlanner.upsert({
    where: {
      travelerId_plannerId: {
        travelerId: sessionUser.id,
        plannerId,
      },
    },
    update: {},
    create: {
      travelerId: sessionUser.id,
      plannerId,
    },
  });

  return NextResponse.json({ ok: true, isFavorited: true });
}

export async function DELETE(_: Request, { params }: RouteParams) {
  const sessionUser = await getSessionFromCookies();
  if (!sessionUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (sessionUser.role !== "traveler") {
    return NextResponse.json({ error: "Only travelers can manage favorites" }, { status: 403 });
  }

  const resolvedParams = await params;
  const plannerId = Number.parseInt(resolvedParams.id, 10);
  if (Number.isNaN(plannerId)) {
    return NextResponse.json({ error: "Invalid planner ID" }, { status: 400 });
  }

  await prisma.favoritePlanner.deleteMany({
    where: {
      travelerId: sessionUser.id,
      plannerId,
    },
  });

  return NextResponse.json({ ok: true, isFavorited: false });
}
