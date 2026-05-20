import { NextResponse } from 'next/server';
import { getSessionFromCookies } from '@/lib/session';
import { prisma } from '@/lib/prisma';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_: Request, { params }: RouteParams) {
  const resolvedParams = await params;
  const userId = parseInt(resolvedParams.id, 10);

  if (Number.isNaN(userId)) {
    return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
  }

  const sessionUser = await getSessionFromCookies();
  if (!sessionUser || sessionUser.id !== userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const participations = await prisma.tripParticipation.findMany({
    where: { userId },
    orderBy: { joinedAt: 'desc' },
    include: {
      trip: {
        select: {
          id: true,
          title: true,
          isPublished: true,
        },
      },
    },
  });

  return NextResponse.json(
    participations.map((participation) => ({
      id: participation.id,
      joinedAt: participation.joinedAt.toISOString(),
      status: participation.status,
      trip: {
        id: participation.trip.id,
        title: participation.trip.title,
        isPublished: participation.trip.isPublished,
      },
    }))
  );
}
