import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, FileText, Star, User } from "lucide-react";
import { FavoriteToggle } from "@/app/components/favorite-toggle";
import { prisma } from "@/lib/prisma";
import { parseIdPrefixedSlug } from "@/lib/slugs";

type PlannerProfilePageProps = {
  params: Promise<{
    id: string;
  }>;
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

const formatDate = (value: Date): string => value.toLocaleDateString("zh-TW");

export default async function PlannerProfilePage({ params }: PlannerProfilePageProps) {
  const resolvedParams = await params;
  const plannerId = parseIdPrefixedSlug(resolvedParams.id);

  if (plannerId === null) {
    notFound();
  }

  const planner = await prisma.user.findFirst({
    where: {
      id: plannerId,
      role: "planner",
    },
    select: {
      id: true,
      name: true,
      avatarUrl: true,
      role: true,
      createdAt: true,
      trips: {
        where: { isPublished: true },
        orderBy: { updatedAt: "desc" },
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
  const totalRating = publishedTrips.reduce<number>(
    (sum: number, trip: PlannerTripRow) => sum + (trip.averageRating ?? 0),
    0
  );
  const averageRating =
    publishedTrips.length > 0 ? Math.round((totalRating / publishedTrips.length) * 10) / 10 : null;
  const displayName = planner.name ?? "規劃師";

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="mx-auto max-w-6xl px-6">
        <Link href="/" className="mb-6 inline-flex items-center gap-2 text-slate-600 transition hover:text-slate-900">
          <ArrowLeft size={18} /> 回到首頁
        </Link>

        <div className="mb-8 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="grid gap-8 p-8 lg:grid-cols-[1.3fr_1fr] lg:p-10">
            <div className="flex items-center gap-6">
              <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-3xl bg-blue-100 text-4xl font-black text-blue-700">
                {planner.avatarUrl ? (
                  <img src={planner.avatarUrl} alt={displayName} className="h-full w-full object-cover" />
                ) : (
                  <span>{displayName.charAt(0)}</span>
                )}
              </div>
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-slate-500">認證規劃師</p>
                <h1 className="mt-3 text-4xl font-bold text-slate-900">{displayName}</h1>
                <p className="mt-3 text-sm text-slate-500">
                  查看規劃師公開行程、評分與最新發布內容。
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 text-center">
                <p className="text-sm text-slate-500">公開行程</p>
                <p className="mt-2 text-2xl font-bold text-slate-900">{publishedTrips.length}</p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 text-center">
                <p className="text-sm text-slate-500">平均評分</p>
                <p className="mt-2 text-2xl font-bold text-slate-900">
                  {averageRating !== null ? averageRating.toFixed(1) : "尚無"}
                </p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 text-center">
                <p className="text-sm text-slate-500">加入時間</p>
                <p className="mt-2 text-lg font-bold text-slate-900">{formatDate(planner.createdAt)}</p>
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
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-3 text-slate-600">
                <User size={24} />
                <div>
                  <p className="text-sm font-semibold text-slate-900">關於 {displayName}</p>
                  <p className="text-sm text-slate-500">公開資料會依照規劃師已發布行程即時更新。</p>
                </div>
              </div>
              <div className="space-y-2 text-sm text-slate-500">
                <p>身份：{planner.role === "planner" ? "規劃師" : planner.role}</p>
                <p>公開行程：{publishedTrips.length} 筆</p>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-xl font-bold text-slate-900">
                  <FileText size={22} className="text-blue-600" /> 公開行程
                </h2>
                <span className="text-sm text-slate-500">共 {publishedTrips.length} 筆</span>
              </div>

              {publishedTrips.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-6 text-slate-500">
                  這位規劃師目前尚未發布公開行程。
                </div>
              ) : (
                <div className="space-y-4">
                  {publishedTrips.map((trip: PlannerTripRow) => (
                    <Link
                      key={trip.id}
                      href={`/trip/${trip.id}`}
                      className="block rounded-3xl border border-slate-200 p-5 transition hover:border-blue-400 hover:bg-blue-50"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="min-w-0">
                          <h3 className="truncate text-lg font-semibold text-slate-900">{trip.title}</h3>
                          <p className="mt-2 line-clamp-2 text-sm text-slate-500">
                            {trip.summary || "尚未提供行程摘要。"}
                          </p>
                        </div>
                        <div className="shrink-0 text-right text-xs text-slate-500">
                          <p>{trip.reviewCount} 則評論</p>
                          <p className="mt-2">{formatDate(trip.updatedAt)}</p>
                        </div>
                      </div>
                      <div className="mt-4 flex items-center gap-2 text-sm text-slate-600">
                        <Star size={16} className="text-amber-400" />
                        <span>{trip.averageRating ? `${trip.averageRating.toFixed(1)} / 5` : "尚未評分"}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </section>

          <aside className="space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="mb-3 flex items-center gap-2 text-lg font-bold text-slate-900">
                <CalendarDays size={20} className="text-slate-500" /> 頁面資訊
              </h2>
              <ul className="space-y-3 text-sm text-slate-500">
                <li>網址使用 ID-prefixed slug，例如 `/planner/{planner.id}-name`。</li>
                <li>後端仍以 ID 查詢資料，slug 只作為可讀網址。</li>
                <li>舊的純 ID 網址仍可正常開啟。</li>
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
