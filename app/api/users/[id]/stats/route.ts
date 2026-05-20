import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionFromCookies } from '@/lib/session';

interface RouteParams {
  params: Promise<{ id: string }>;
}

type BaseStats = {
  userId: number;
  role: string;
  name: string | null;
};

type PlannerTripStatsRow = {
  id: number;
  averageRating: number | null;
  reviewCount: number;
  isPublished: boolean;
};

type TravelerParticipationRow = {
  status: string;
};

type ReviewRatingRow = {
  rating: number;
};

type PlannerStats = BaseStats & {
  totalTrips: number;
  publishedTrips: number;
  draftTrips: number;
  averageRating: number | null;
  totalReviews: number;
};

type TravelerStats = BaseStats & {
  participatedTrips: number;
  activeTrips: number;
  completedTrips: number;
  favoriteTrips: number;
  favoritePlanners: number;
  averageGivenRating: number | null;
  totalReviewsGiven: number;
};

type AdminStats = BaseStats & {
  totalUsers: number;
  totalTrips: number;
  publishedTrips: number;
  draftTrips: number;
  totalReviews: number;
};

type UserStats = BaseStats | PlannerStats | TravelerStats | AdminStats;

// GET /api/users/[id]/stats - 獲取用戶統計數據
export async function GET(_: Request, { params }: RouteParams) {
  try {
    const resolvedParams = await params;
    const userId = parseInt(resolvedParams.id, 10);

    if (Number.isNaN(userId)) {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
    }

    const sessionUser = await getSessionFromCookies();
    if (!sessionUser || sessionUser.id !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 檢查用戶是否存在
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true, name: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    let stats: UserStats = {
      userId,
      role: user.role,
      name: user.name
    };

    if (user.role === 'planner') {
      // Planner 統計：行程數量、平均評分、總評論數
      const trips: PlannerTripStatsRow[] = await prisma.trip.findMany({
        where: { authorId: userId },
        select: {
          id: true,
          averageRating: true,
          reviewCount: true,
          isPublished: true
        }
      });

      const publishedTrips = trips.filter((trip: PlannerTripStatsRow) => trip.isPublished);
      const totalRating = publishedTrips.reduce<number>((sum, trip: PlannerTripStatsRow) => sum + (trip.averageRating || 0), 0);
      const totalReviews = publishedTrips.reduce<number>((sum, trip: PlannerTripStatsRow) => sum + trip.reviewCount, 0);

      stats = {
        ...stats,
        totalTrips: trips.length,
        publishedTrips: publishedTrips.length,
        draftTrips: trips.length - publishedTrips.length,
        averageRating: publishedTrips.length > 0 ? Math.round((totalRating / publishedTrips.length) * 10) / 10 : null,
        totalReviews: totalReviews
      };
    } else if (user.role === 'traveler') {
      // Traveler 統計：參與的行程數量、已完成的行程、平均給予的評分
      const participations: TravelerParticipationRow[] = await prisma.tripParticipation.findMany({
        where: { userId },
        include: {
          trip: {
            select: {
              id: true,
              title: true,
              isPublished: true
            }
          }
        }
      });

      const reviews: ReviewRatingRow[] = await prisma.review.findMany({
        where: { reviewerId: userId },
        select: { rating: true }
      });

      const [favoriteTrips, favoritePlanners] = await Promise.all([
        prisma.favoriteTrip.count({
          where: { userId }
        }),
        prisma.favoritePlanner.count({
          where: { travelerId: userId }
        })
      ]);

      const totalRating = reviews.reduce<number>((sum, review: ReviewRatingRow) => sum + review.rating, 0);

      stats = {
        ...stats,
        participatedTrips: participations.length,
        activeTrips: participations.filter((p: TravelerParticipationRow) => p.status === 'active').length,
        completedTrips: participations.filter((p: TravelerParticipationRow) => p.status === 'completed').length,
        favoriteTrips,
        favoritePlanners,
        averageGivenRating: reviews.length > 0 ? Math.round((totalRating / reviews.length) * 10) / 10 : null,
        totalReviewsGiven: reviews.length
      };
    } else if (user.role === 'admin') {
      // Admin 統計：系統總覽
      const [totalUsers, totalTrips, totalReviews] = await Promise.all([
        prisma.user.count(),
        prisma.trip.count(),
        prisma.review.count()
      ]);

      const publishedTrips = await prisma.trip.count({
        where: { isPublished: true }
      });

      stats = {
        ...stats,
        totalUsers,
        totalTrips,
        publishedTrips,
        draftTrips: totalTrips - publishedTrips,
        totalReviews
      };
    }

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching user stats:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
