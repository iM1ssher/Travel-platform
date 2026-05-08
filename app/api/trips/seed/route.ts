import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionFromCookies } from '@/lib/session';

export async function GET() {
  try {
    // 獲取測試用戶
    const planner = await prisma.user.findUnique({
      where: { email: 'sarah@test.com' },
    });

    if (!planner) {
      return NextResponse.json({ error: '請先運行 /api/seed 創建測試用戶' }, { status: 400 });
    }

    // 創建測試行程
    const trips = await Promise.all([
      prisma.trip.upsert({
        where: { id: 1 },
        update: {},
        create: {
          id: 1,
          title: '東京美食深度遊：從築地到淺草',
          summary: '探索東京的美食文化，從築地市場的新鮮海鮮到淺草的傳統小吃，一趟充滿驚喜的味覺之旅。',
          coverImage: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=500&q=80',
          isPublished: true,
          authorId: planner.id,
        },
      }),
      prisma.trip.upsert({
        where: { id: 2 },
        update: {},
        create: {
          id: 2,
          title: '京都賞櫻與寺廟巡禮',
          summary: '在京都的櫻花季節，參訪金閣寺、清水寺等著名寺廟，體驗日本傳統文化的美麗。',
          coverImage: 'https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?auto=format&fit=crop&w=500&q=80',
          isPublished: true,
          authorId: planner.id,
        },
      }),
      prisma.trip.upsert({
        where: { id: 3 },
        update: {},
        create: {
          id: 3,
          title: '北海道雪景與溫泉之旅',
          summary: '在北海道體驗壯觀的雪景，泡在天然溫泉中放鬆身心，享受冬日寧靜的美好。',
          coverImage: 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?auto=format&fit=crop&w=500&q=80',
          isPublished: true,
          authorId: planner.id,
        },
      }),
    ]);

    return NextResponse.json({
      message: '成功創建測試行程！',
      trips: trips.map(t => ({
        id: t.id,
        title: t.title,
        summary: t.summary,
        coverImage: t.coverImage,
        updatedAt: t.updatedAt,
      }))
    });
  } catch (error) {
    console.error('創建測試行程失敗:', error);
    return NextResponse.json({ error: '創建測試行程失敗' }, { status: 500 });
  }
}