import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const q = url.searchParams.get('q')?.trim() || '';
  const role = url.searchParams.get('role') || 'planner';

  const where: any = { role };
  if (q) {
    where.name = { contains: q, mode: 'insensitive' };
  }

  const users = await prisma.user.findMany({
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
    users.map((user) => ({
      id: user.id,
      name: user.name,
      avatarUrl: user.avatarUrl,
      role: user.role,
      publishedTripCount: user.trips.length,
    }))
  );
}
