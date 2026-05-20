import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

type UserSearchRow = {
  id: number;
  name: string | null;
  avatarUrl: string | null;
  role: string;
  trips: Array<{ id: number }>;
};

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const q = url.searchParams.get('q')?.trim() || '';
  const role = url.searchParams.get('role') || 'planner';

  const where: {
    role: string;
    name?: { contains: string; mode: 'insensitive' };
  } = { role };
  if (q) {
    where.name = { contains: q, mode: 'insensitive' };
  }

  const users: UserSearchRow[] = await prisma.user.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: 20,
    select: {
      id: true,
      name: true,
      avatarUrl: true,
      role: true,
      trips: {
        where: { isPublished: true },
        select: { id: true },
      },
    },
  });

  return NextResponse.json(
    users.map((user: UserSearchRow) => ({
      id: user.id,
      name: user.name,
      avatarUrl: user.avatarUrl,
      role: user.role,
      publishedTripCount: user.trips.length,
    }))
  );
}
