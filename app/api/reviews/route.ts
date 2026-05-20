import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionFromCookies } from '@/lib/session';

type ReviewMutationBody = {
  tripId?: number | string;
  reviewId?: number | string;
  rating?: number;
  comment?: string | null;
};

type ReviewRatingRow = {
  rating: number;
};

function parseId(value: number | string | undefined): number | null {
  if (typeof value === 'number' && Number.isInteger(value)) {
    return value;
  }

  if (typeof value === 'string' && value.trim().length > 0) {
    const parsed = Number.parseInt(value, 10);
    return Number.isNaN(parsed) ? null : parsed;
  }

  return null;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tripId = parseId(searchParams.get('tripId') ?? undefined);

    if (tripId === null) {
      return NextResponse.json({ error: 'Trip ID is required' }, { status: 400 });
    }

    const reviews = await prisma.review.findMany({
      where: { tripId },
      include: {
        reviewer: {
          select: { id: true, name: true, avatarUrl: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(reviews);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionFromCookies();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { tripId: rawTripId, rating, comment }: ReviewMutationBody = await request.json();
    const tripId = parseId(rawTripId);

    if (tripId === null || typeof rating !== 'number' || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Invalid input data' }, { status: 400 });
    }

    const participation = await prisma.tripParticipation.findUnique({
      where: {
        userId_tripId: {
          userId: session.id,
          tripId,
        },
      },
    });

    if (!participation) {
      return NextResponse.json(
        { error: 'You must participate in this trip to leave a review' },
        { status: 403 }
      );
    }

    const existingReview = await prisma.review.findUnique({
      where: {
        reviewerId_tripId: {
          reviewerId: session.id,
          tripId,
        },
      },
    });

    if (existingReview) {
      return NextResponse.json({ error: 'You have already reviewed this trip' }, { status: 409 });
    }

    const review = await prisma.review.create({
      data: {
        tripId,
        reviewerId: session.id,
        rating,
        comment: typeof comment === 'string' ? comment : null,
      },
      include: {
        reviewer: {
          select: { id: true, name: true, avatarUrl: true },
        },
      },
    });

    await updateTripRating(tripId);

    return NextResponse.json(review, { status: 201 });
  } catch (error) {
    console.error('Error creating review:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getSessionFromCookies();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { reviewId: rawReviewId, rating, comment }: ReviewMutationBody = await request.json();
    const reviewId = parseId(rawReviewId);

    if (reviewId === null || typeof rating !== 'number' || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Invalid input data' }, { status: 400 });
    }

    const existingReview = await prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!existingReview || existingReview.reviewerId !== session.id) {
      return NextResponse.json({ error: 'Review not found or unauthorized' }, { status: 404 });
    }

    const review = await prisma.review.update({
      where: { id: reviewId },
      data: {
        rating,
        comment: typeof comment === 'string' ? comment : null,
        updatedAt: new Date(),
      },
      include: {
        reviewer: {
          select: { id: true, name: true, avatarUrl: true },
        },
      },
    });

    await updateTripRating(existingReview.tripId);

    return NextResponse.json(review);
  } catch (error) {
    console.error('Error updating review:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getSessionFromCookies();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const reviewId = parseId(searchParams.get('reviewId') ?? undefined);

    if (reviewId === null) {
      return NextResponse.json({ error: 'Review ID is required' }, { status: 400 });
    }

    const existingReview = await prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!existingReview || existingReview.reviewerId !== session.id) {
      return NextResponse.json({ error: 'Review not found or unauthorized' }, { status: 404 });
    }

    const tripId = existingReview.tripId;

    await prisma.review.delete({
      where: { id: reviewId },
    });

    await updateTripRating(tripId);

    return NextResponse.json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Error deleting review:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function updateTripRating(tripId: number) {
  const reviews: ReviewRatingRow[] = await prisma.review.findMany({
    where: { tripId },
    select: { rating: true },
  });

  if (reviews.length === 0) {
    await prisma.trip.update({
      where: { id: tripId },
      data: { averageRating: null, reviewCount: 0 },
    });
    return;
  }

  const totalRating = reviews.reduce<number>((sum, review) => sum + review.rating, 0);
  const averageRating = totalRating / reviews.length;

  await prisma.trip.update({
    where: { id: tripId },
    data: {
      averageRating: Math.round(averageRating * 10) / 10,
      reviewCount: reviews.length,
    },
  });
}
