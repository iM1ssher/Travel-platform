import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionFromCookies } from '@/lib/session';

interface RouteParams {
  params: Promise<{ id: string }>;
}

type TripRatingRow = {
  rating: number;
};

// POST /api/trips/[id]/participate - 加入行程
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSessionFromCookies();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;
    const tripId = parseInt(resolvedParams.id);

    // 檢查行程是否存在且已發布
    const trip = await prisma.trip.findUnique({
      where: { id: tripId }
    });

    if (!trip) {
      return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
    }

    if (!trip.isPublished) {
      return NextResponse.json({ error: 'Cannot participate in draft trips' }, { status: 400 });
    }

    // 檢查是否已經參與
    const existingParticipation = await prisma.tripParticipation.findUnique({
      where: {
        userId_tripId: {
          userId: session.id,
          tripId: tripId
        }
      }
    });

    if (existingParticipation) {
      return NextResponse.json({ error: 'Already participating in this trip' }, { status: 409 });
    }

    // 創建參與記錄
    const participation = await prisma.tripParticipation.create({
      data: {
        userId: session.id,
        tripId: tripId,
        status: 'active'
      }
    });

    return NextResponse.json(participation, { status: 201 });
  } catch (error) {
    console.error('Error joining trip:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/trips/[id]/participate - 離開行程
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSessionFromCookies();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;
    const tripId = parseInt(resolvedParams.id);

    // 檢查參與記錄是否存在
    const participation = await prisma.tripParticipation.findUnique({
      where: {
        userId_tripId: {
          userId: session.id,
          tripId: tripId
        }
      }
    });

    if (!participation) {
      return NextResponse.json({ error: 'Not participating in this trip' }, { status: 404 });
    }

    // 刪除參與記錄
    await prisma.tripParticipation.delete({
      where: {
        userId_tripId: {
          userId: session.id,
          tripId: tripId
        }
      }
    });

    // 同時刪除相關的評論（如果存在）
    await prisma.review.deleteMany({
      where: {
        reviewerId: session.id,
        tripId: tripId
      }
    });

    // 更新行程的平均評分
    await updateTripRating(tripId);

    return NextResponse.json({ message: 'Successfully left the trip' });
  } catch (error) {
    console.error('Error leaving trip:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET /api/trips/[id]/participate - 檢查參與狀態
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSessionFromCookies();
    if (!session) {
      return NextResponse.json({ participation: null });
    }

    const resolvedParams = await params;
    const tripId = parseInt(resolvedParams.id);

    const participation = await prisma.tripParticipation.findUnique({
      where: {
        userId_tripId: {
          userId: session.id,
          tripId: tripId
        }
      }
    });

    return NextResponse.json({ participation });
  } catch (error) {
    console.error('Error checking participation:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// 輔助函數：更新行程的平均評分
async function updateTripRating(tripId: number) {
  const reviews: TripRatingRow[] = await prisma.review.findMany({
    where: { tripId },
    select: { rating: true }
  });

  if (reviews.length === 0) {
    await prisma.trip.update({
      where: { id: tripId },
      data: { averageRating: null, reviewCount: 0 }
    });
  } else {
    const totalRating = reviews.reduce<number>((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / reviews.length;
    await prisma.trip.update({
      where: { id: tripId },
      data: {
        averageRating: Math.round(averageRating * 10) / 10, // 保留一位小數
        reviewCount: reviews.length
      }
    });
  }
}
