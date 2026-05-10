import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionFromCookies } from '@/lib/session';

// GET /api/admin/reviews - 獲取所有評論（管理員專用）
export async function GET(request: NextRequest) {
  try {
    const session = await getSessionFromCookies();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        skip,
        take: limit,
        include: {
          reviewer: {
            select: { id: true, name: true, email: true }
          },
          trip: {
            select: { id: true, title: true, author: { select: { name: true } } }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.review.count()
    ]);

    return NextResponse.json({
      reviews,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/admin/reviews - 刪除評論（管理員專用）
export async function DELETE(request: NextRequest) {
  try {
    const session = await getSessionFromCookies();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const reviewId = searchParams.get('reviewId');

    if (!reviewId) {
      return NextResponse.json({ error: 'Review ID is required' }, { status: 400 });
    }

    // 檢查評論是否存在
    const review = await prisma.review.findUnique({
      where: { id: parseInt(reviewId) }
    });

    if (!review) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }

    const tripId = review.tripId;

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