import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { ArrowLeft, Star, User } from 'lucide-react';
import { FavoriteToggle } from '@/app/components/favorite-toggle';

type Params = {
  params: {
    id: string;
  };
};

type PlannerTripRow = {
  id: number;
  title: string;
  summary: string | null;
  coverImage: string | null;
  averageRating: number | null;
  reviewCount: number;
  updatedAt: Date;
};

export default async function PlannerProfilePage({ params }: Params) {
  const plannerId = parseInt(params.id, 10);
  if (Number.isNaN(plannerId)) {
    notFound();
  }

  const planner = await prisma.user.findUnique({
    where: { id: plannerId, role: 'planner' },
    select: {
      id: true,
      name: true,
      avatarUrl: true,
      role: true,
      createdAt: true,
      trips: {
        where: { isPublished: true },
        orderBy: { updatedAt: 'desc' },
        select: {
          id: true,
          title: true,
          summary: true,
          coverImage: true,
          averageRating: true,
          reviewCount: true,
          updatedAt: true,
        },
      },
    },
  });

  if (!planner) {
    notFound();
  }

  const publishedTrips: PlannerTripRow[] = planner.trips;
  const averageRating =
  publishedTrips.length > 0
      ? Math.round(
          (publishedTrips.reduce<number>((sum, trip: PlannerTripRow) => sum + (trip.averageRating || 0), 0) / publishedTrips.length) * 10
        ) / 10
      : null;
  const avatarUrl = planner.avatarUrl ? planner.avatarUrl : undefined;

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-6xl mx-auto px-6">
        <Link href="/" className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6">
          <ArrowLeft size={18} /> 回到首頁
        </Link>

        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden mb-8">
          <div className="p-8 lg:p-10 grid gap-8 lg:grid-cols-[1.3fr_1fr] items-center">
            <div className="flex items-center gap-6">
              <div className="w-28 h-28 rounded-3xl bg-blue-100 flex items-center justify-center text-4xl font-black text-blue-700 overflow-hidden">
                {avatarUrl ? (
                  <div
                    className="w-full h-full bg-cover bg-center"
                    style={{ backgroundImage: `url(${avatarUrl})` }}
                  />
                ) : (
                  <span>{planner.name?.charAt(0) ?? '?'}</span>
                )}
              </div>
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-slate-500">規劃師展示頁</p>
                <h1 className="mt-3 text-4xl font-bold text-slate-900">{planner.name}</h1>
                <p className="mt-3 text-sm text-slate-500">顯示此規劃師的公開行程、評分與作品展示。</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              <div className="rounded-3xl bg-slate-50 border border-slate-200 p-5 text-center">
                <p className="text-sm text-slate-500">公開作品</p>
                <p className="mt-2 text-2xl font-bold text-slate-900">{publishedTrips.length}</p>
              </div>
              <div className="rounded-3xl bg-slate-50 border border-slate-200 p-5 text-center">
                <p className="text-sm text-slate-500">平均評分</p>
                <p className="mt-2 text-2xl font-bold text-slate-900">{averageRating ?? '尚無'}</p>
              </div>
              <div className="rounded-3xl bg-slate-50 border border-slate-200 p-5 text-center">
                <p className="text-sm text-slate-500">加入日期</p>
                <p className="mt-2 text-2xl font-bold text-slate-900">{new Date(planner.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
          <div className="border-t border-slate-100 px-8 py-5 lg:px-10">
            <FavoriteToggle
              endpoint={`/api/planners/${planner.id}/favorite`}
              activeLabel="已收藏規劃師"
              inactiveLabel="收藏規劃師"
              variant="ghost"
            />
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.8fr_1fr]">
          <section className="space-y-6">
            <div className="rounded-3xl bg-white border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4 text-slate-600">
                <User size={24} />
                <div>
                  <p className="text-sm font-semibold text-slate-900">關於 {planner.name}</p>
                  <p className="text-sm text-slate-500">此規劃師僅展示公開發佈的作品，草稿內容不會公開。</p>
                </div>
              </div>
              <div className="text-sm text-slate-500 space-y-2">
                <p>身份：{planner.role === 'planner' ? '規劃師' : planner.role}</p>
                <p>公開行程：{publishedTrips.length} 個</p>
              </div>
            </div>

            <div className="rounded-3xl bg-white border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-slate-900">公開行程</h2>
                <span className="text-sm text-slate-500">共 {publishedTrips.length} 筆</span>
              </div>
              {publishedTrips.length === 0 ? (
                <div className="rounded-3xl bg-slate-50 border border-dashed border-slate-200 p-6 text-slate-500">
                  此規劃師尚無公開行程。
                </div>
              ) : (
                <div className="space-y-4">
                  {publishedTrips.map((trip: PlannerTripRow) => (
                    <Link
                      key={trip.id}
                      href={`/trip/${trip.id}`}
                      className="block rounded-3xl border border-slate-200 p-5 hover:border-blue-400 hover:bg-blue-50 transition"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <h3 className="text-lg font-semibold text-slate-900">{trip.title}</h3>
                          <p className="text-sm text-slate-500 mt-2 line-clamp-2">{trip.summary || '尚未提供行程描述。'}</p>
                        </div>
                        <div className="text-right text-xs text-slate-500">
                          <p>{trip.reviewCount} 則評論</p>
                          <p className="mt-2">{new Date(trip.updatedAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="mt-4 flex items-center gap-2 text-sm text-slate-600">
                        <Star size={16} className="text-amber-400" />
                        <span>{trip.averageRating ? `${trip.averageRating.toFixed(1)} / 5` : '尚無評分'}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </section>

          <aside className="space-y-6">
            <div className="rounded-3xl bg-white border border-slate-200 p-6 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900 mb-3">旅客提示</h2>
              <ul className="space-y-3 text-sm text-slate-500">
                <li>旅客可於行程頁面查看規劃師展示頁。</li>
                <li>展示頁僅顯示已發佈的公開行程。</li>
                <li>若規劃師尚未發佈作品，請返回其他規劃師搜尋。</li>
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
