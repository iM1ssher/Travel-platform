import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getSessionFromCookies } from "@/lib/session";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  const resolvedParams = await params;
  const tripId = parseInt(resolvedParams.id, 10);

  if (Number.isNaN(tripId)) {
    return NextResponse.json({ message: "無效的行程 ID。" }, { status: 400 });
  }

  const trip = await prisma.trip.findUnique({
    where: { id: tripId },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          avatarUrl: true,
        },
      },
    },
  });

  if (!trip) {
    return NextResponse.json({ message: "找不到該行程。" }, { status: 404 });
  }

  return NextResponse.json(trip);
}

export async function PATCH(
  request: Request,
  { params }: RouteParams
) {
  const user = await getSessionFromCookies();

  if (!user) {
    return NextResponse.json({ message: "未登入。" }, { status: 401 });
  }

  const resolvedParams = await params;
  const id = Number(resolvedParams.id);
  if (Number.isNaN(id)) {
    return NextResponse.json({ message: "無效的行程 ID。" }, { status: 400 });
  }

  const existingTrip = await prisma.trip.findUnique({
    where: { id },
  });

  if (!existingTrip || existingTrip.authorId !== user.id) {
    return NextResponse.json({ message: "找不到該行程，或您無權編輯。" }, { status: 404 });
  }

  const body = await request.json();
  const { title, summary, coverImage, publish } = body as {
    title?: string;
    summary?: string;
    coverImage?: string;
    publish?: boolean;
  };

  const data: Prisma.TripUpdateInput = {};

  if (typeof title === "string") {
    data.title = title.trim();
  }

  if (typeof summary === "string") {
    data.summary = summary.trim();
  }

  if (typeof coverImage === "string") {
    data.coverImage = coverImage.trim() || null;
  }

  if (publish === true) {
    data.isPublished = true;
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ message: "沒有可更新的欄位。" }, { status: 400 });
  }

  const updatedTrip = await prisma.trip.update({
    where: { id },
    data,
  });

  return NextResponse.json({ trip: updatedTrip });
}
