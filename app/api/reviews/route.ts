import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionFromCookies } from '@/lib/session';

// GET /api/reviews - 獲取行程的所有評論
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tripId = searchParams.get('tripId');

    if (!tripId) {
      return NextResponse.json({ error: 'Trip ID is required' }, { status: 400 });
    }

    const reviews = await prisma.review.findMany({
      where: { tripId: parseInt(tripId) },
      include: {
        reviewer: {
          select: { id: true, name: true, avatarUrl: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(reviews);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/reviews - 創建新評論
export async function POST(request: NextRequest) {
  try {
    const session = await getSessionFromCookies();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { tripId, rating, comment } = await request.json();

    if (!tripId || !rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Invalid input data' }, { status: 400 });
    }

    // 檢查用戶是否參與了這個行程
    const participation = await prisma.tripParticipation.findUnique({
      where: {
        userId_tripId: {
          userId: session.id,
          tripId: parseInt(tripId)
        }
      }
    });

    if (!participation) {
      return NextResponse.json({ error: 'You must participate in this trip to leave a review' }, { status: 403 });
    }

    // 檢查是否已經評論過
    const existingReview = await prisma.review.findUnique({
      where: {
        reviewerId_tripId: {
          reviewerId: session.id,
          tripId: parseInt(tripId)
        }
      }
    });

    if (existingReview) {
      return NextResponse.json({ error: 'You have already reviewed this trip' }, { status: 409 });
    }

    // 創建評論
    const review = await prisma.review.create({
      data: {
        tripId: parseInt(tripId),
        reviewerId: session.id,
        rating,
        comment
      },
      include: {
        reviewer: {
          select: { id: true, name: true, avatarUrl: true }
        }
      }
    });

    // 更新行程的平均評分
    await updateTripRating(parseInt(tripId));

    return NextResponse.json(review, { status: 201 });
  } catch (error) {
    console.error('Error creating review:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/reviews - 更新評論
export async function PUT(request: NextRequest) {
  try {
    const session = await getSessionFromCookies();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { reviewId, rating, comment } = await request.json();

    if (!reviewId || !rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Invalid input data' }, { status: 400 });
    }

    // 檢查評論是否存在且屬於當前用戶
    const existingReview = await prisma.review.findUnique({
      where: { id: parseInt(reviewId) }
    });

    if (!existingReview || existingReview.reviewerId !== session.id) {
      return NextResponse.json({ error: 'Review not found or unauthorized' }, { status: 404 });
    }

    // 更新評論
    const review = await prisma.review.update({
      where: { id: parseInt(reviewId) },
      data: { rating, comment, updatedAt: new Date() },
      include: {
        reviewer: {
          select: { id: true, name: true, avatarUrl: true }
        }
      }
    });

    // 更新行程的平均評分
    await updateTripRating(existingReview.tripId);

    return NextResponse.json(review);
  } catch (error) {
    console.error('Error updating review:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/reviews - 刪除評論
export async function DELETE(request: NextRequest) {
  try {
    const session = await getSessionFromCookies();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const reviewId = searchParams.get('reviewId');

    if (!reviewId) {
      return NextResponse.json({ error: 'Review ID is required' }, { status: 400 });
    }

    // 檢查評論是否存在且屬於當前用戶
    const existingReview = await prisma.review.findUnique({
      where: { id: parseInt(reviewId) }
    });

    if (!existingReview || existingReview.reviewerId !== session.id) {
      return NextResponse.json({ error: 'Review not found or unauthorized' }, { status: 404 });
    }

    const tripId = existingReview.tripId;

    // 刪除評論
    await prisma.review.delete({
      where: { id: parseInt(reviewId) }
    });

    // 更新行程的平均評分
    await updateTripRating(tripId);

    return NextResponse.json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Error deleting review:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// 輔助函數：更新行程的平均評分
async function updateTripRating(tripId: number) {
  const reviews = await prisma.review.findMany({
    where: { tripId },
    select: { rating: true }
  });

  if (reviews.length === 0) {
    await prisma.trip.update({
      where: { id: tripId },
      data: { averageRating: null, reviewCount: 0 }
    });
  } else {
    const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
    await prisma.trip.update({
      where: { id: tripId },
      data: {
        averageRating: Math.round(averageRating * 10) / 10, // 保留一位小數
        reviewCount: reviews.length
      }
    });
  }
}