// 旅行規劃師儀表板 - 顯示使用者資訊與真實草稿
"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Compass,
  BarChart2,
  Users,
  Star,
  FileText,
  Edit3,
  ThumbsUp,
  AlertTriangle,
  ChevronRight,
  ExternalLink,
  Heart,
  Map,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/app/providers";
import { FavoriteToggle } from "@/app/components/favorite-toggle";
import { ProfilePanel } from "@/app/components/profile-panel";

type DraftTrip = {
  id: number;
  title: string;
  updatedAt: string;
};

type PlannerTrip = {
  id: number;
  title: string;
  updatedAt: string;
  averageRating: number | null;
  reviewCount: number;
};

type FavoriteTrip = {
  id: number;
  favoritedAt: string;
  trip: {
    id: number;
    title: string;
    coverImage: string | null;
    averageRating: number | null;
    reviewCount: number;
  };
};

type PlannerStats = {
  totalTrips: number;
  publishedTrips: number;
  draftTrips: number;
  averageRating: number | null;
  totalReviews: number;
};

type TripsDashboardResponse = {
  drafts?: DraftTrip[];
  publishedTrips?: PlannerTrip[];
};

type FavoritesResponse = {
  trips?: FavoriteTrip[];
};

const defaultStats: PlannerStats = {
  totalTrips: 0,
  publishedTrips: 0,
  draftTrips: 0,
  averageRating: null,
  totalReviews: 0,
};

const formatDateTime = (value: string): string => new Date(value).toLocaleString("zh-TW");

export default function PlannerDashboard() {
  const { user, loading: authLoading, setUser } = useAuth();
  const [drafts, setDrafts] = useState<DraftTrip[]>([]);
  const [publishedTrips, setPublishedTrips] = useState<PlannerTrip[]>([]);
  const [favoriteTrips, setFavoriteTrips] = useState<FavoriteTrip[]>([]);
  const [loadingTrips, setLoadingTrips] = useState(true);
  const [loadingFavoriteTrips, setLoadingFavoriteTrips] = useState(true);
  const [stats, setStats] = useState<PlannerStats>(defaultStats);
  const [loadingStats, setLoadingStats] = useState(true);
  const [dashboardError, setDashboardError] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboardData = useCallback(async (showRefreshing = false): Promise<void> => {
    if (!user) {
      setDrafts([]);
      setPublishedTrips([]);
      setFavoriteTrips([]);
      setStats(defaultStats);
      setLoadingTrips(false);
      setLoadingFavoriteTrips(false);
      setLoadingStats(false);
      return;
    }

    setDashboardError("");
    setLoadingTrips(true);
    setLoadingFavoriteTrips(true);
    setLoadingStats(true);
    setRefreshing(showRefreshing);

    try {
      const [tripsRes, statsRes, favoritesRes]: [Response, Response, Response] = await Promise.all([
        fetch("/api/trips/drafts", { cache: "no-store" }),
        fetch(`/api/users/${user.id}/stats`, { cache: "no-store" }),
        fetch(`/api/users/${user.id}/favorites`, { cache: "no-store" }),
      ]);

      if (!tripsRes.ok) {
        setDrafts([]);
        setPublishedTrips([]);
        setDashboardError("無法同步行程列表，請稍後重試。");
      } else {
        const tripsData = (await tripsRes.json()) as TripsDashboardResponse;
        setDrafts(tripsData.drafts ?? []);
        setPublishedTrips(tripsData.publishedTrips ?? []);
      }

      if (!statsRes.ok) {
        setStats(defaultStats);
        setDashboardError((current: string) => current || "無法同步統計資料，請稍後重試。");
      } else {
        const statsData = (await statsRes.json()) as PlannerStats;
        setStats(statsData);
      }

      if (!favoritesRes.ok) {
        setFavoriteTrips([]);
        setDashboardError((current: string) => current || "無法同步收藏行程，請稍後重試。");
      } else {
        const favoritesData = (await favoritesRes.json()) as FavoritesResponse;
        setFavoriteTrips(favoritesData.trips ?? []);
      }
    } catch {
      setDrafts([]);
      setPublishedTrips([]);
      setFavoriteTrips([]);
      setStats(defaultStats);
      setDashboardError("同步資料時發生錯誤，請檢查連線後再試。");
    } finally {
      setLoadingTrips(false);
      setLoadingFavoriteTrips(false);
      setLoadingStats(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    void Promise.resolve().then(() => fetchDashboardData());
  }, [fetchDashboardData]);

  useEffect(() => {
    const refreshOnReturn = (): void => {
      if (document.visibilityState === "visible") {
        void fetchDashboardData();
      }
    };

    window.addEventListener("focus", refreshOnReturn);
    document.addEventListener("visibilitychange", refreshOnReturn);

    return () => {
      window.removeEventListener("focus", refreshOnReturn);
      document.removeEventListener("visibilitychange", refreshOnReturn);
    };
  }, [fetchDashboardData]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500">載入中...</div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-600">
        <div className="max-w-md rounded-3xl bg-white p-10 shadow-lg border border-slate-200 text-center">
          <p className="text-lg font-semibold text-slate-900 mb-3">您尚未登入。</p>
          <p className="text-sm text-slate-500 mb-6">請先登入後，才能檢視規劃師儀表板與草稿。</p>
          <Link href="/signup-loggin/log-sign" className="inline-flex items-center justify-center rounded-3xl bg-blue-600 px-6 py-3 text-sm font-bold text-white hover:bg-blue-700 transition">
            回到登入頁面
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-800">
      <aside className="w-72 flex-shrink-0 bg-white border-r border-slate-200 flex flex-col justify-between">
        <div>
          <Link href="/" className="p-6 flex items-center gap-2 font-bold text-xl text-blue-600 border-b border-slate-100 hover:opacity-80 transition">
            <Compass size={28} />
            <span>AITravel</span>
          </Link>
          <nav className="p-4 space-y-2">
            <button className="flex items-center gap-3 w-full px-4 py-3 bg-teal-50 text-teal-700 rounded-xl font-medium transition">
              <BarChart2 size={20} /> 儀表板
            </button>
            <Link href="/planner/dashboard" className="flex items-center gap-3 w-full px-4 py-3 text-slate-600 hover:bg-slate-50 hover:text-teal-600 rounded-xl font-medium transition">
              <FileText size={20} /> 我的行程
            </Link>
            <Link href="/editor" className="flex items-center gap-3 w-full px-4 py-3 text-slate-600 hover:bg-slate-50 hover:text-teal-600 rounded-xl font-medium transition">
              <Edit3 size={20} /> 編輯器
            </Link>
          </nav>
        </div>
      </aside>

      <main className="flex-1 p-6 lg:p-10 overflow-y-auto">
        <header className="mb-8 flex flex-col gap-6 lg:flex-row justify-between items-start lg:items-end">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">歡迎回來，{user.name}</h1>
            <p className="text-slate-500 mt-1">管理你的規劃師行程與草稿</p>
          </div>

          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-end">
            <div className="w-full sm:w-80">
              <ProfilePanel
                user={user}
                roleLabel={user.role === "planner" ? "認證規劃師" : user.role}
                accentColor="teal"
                compact
                onUserUpdated={setUser}
              />
            </div>
          </div>
        </header>

        {dashboardError && (
          <div className="mb-6 flex items-center justify-between gap-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            <div className="flex items-center gap-2">
              <AlertTriangle size={18} />
              <span>{dashboardError}</span>
            </div>
            <button
              onClick={() => {
                void fetchDashboardData(true);
              }}
              disabled={refreshing}
              className="inline-flex items-center gap-2 rounded-full bg-amber-500 px-4 py-2 font-semibold text-white transition hover:bg-amber-600 disabled:opacity-60"
            >
              <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} /> 重新整理
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-500">
              <Star size={28} className="fill-current" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">平均評分</p>
              <p className="text-2xl font-bold">
                {loadingStats ? "..." : (stats.averageRating ? `${stats.averageRating} / 5` : "尚未評分")}
              </p>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-600">
              <FileText size={28} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">已發布行程</p>
              <p className="text-2xl font-bold">
                {loadingStats ? "..." : stats.publishedTrips}
                <span className="text-sm text-slate-400 font-normal"> 個</span>
              </p>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-teal-100 flex items-center justify-center text-teal-600">
              <ThumbsUp size={28} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">總評論數</p>
              <p className="text-2xl font-bold">
                {loadingStats ? "..." : stats.totalReviews}
                <span className="text-sm text-slate-400 font-normal"> 則</span>
              </p>
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2"><FileText size={24} className="text-teal-600" /> 草稿行程</h2>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    void fetchDashboardData(true);
                  }}
                  disabled={refreshing}
                  className="inline-flex items-center gap-1 text-sm font-medium text-slate-500 transition hover:text-teal-600 disabled:opacity-60"
                >
                  <RefreshCw size={15} className={refreshing ? "animate-spin" : ""} /> 同步
                </button>
                <Link href="/editor" className="text-sm text-teal-600 font-medium hover:underline">建立新草稿</Link>
              </div>
            </div>
            <div className="space-y-4">
              {loadingTrips ? (
                <div className="space-y-3">
                  <div className="h-24 rounded-3xl bg-slate-100 animate-pulse" />
                  <div className="h-24 rounded-3xl bg-slate-100 animate-pulse" />
                </div>
              ) : drafts.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-slate-500">
                  還沒有草稿，現在就建立第一個旅行規劃吧！
                </div>
              ) : (
                drafts.map((draft) => (
                  <article
                    key={draft.id}
                    className="rounded-3xl border border-slate-100 bg-slate-50 p-5 transition hover:border-teal-300 hover:bg-white"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900">{draft.title || "未命名草稿"}</h3>
                        <p className="mt-2 text-sm text-slate-500">更新於 {formatDateTime(draft.updatedAt)}</p>
                      </div>
                      <Link
                        href={`/editor?draftId=${draft.id}`}
                        className="inline-flex items-center justify-center gap-2 rounded-full bg-teal-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-700"
                      >
                        <Edit3 size={16} /> 繼續編輯
                      </Link>
                    </div>
                  </article>
                ))
              )}
            </div>
          </motion.div>

          <div className="space-y-8">
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35 }} className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2"><Users size={24} className="text-slate-600" /> 已發布行程</h2>
              <button
                onClick={() => {
                  void fetchDashboardData(true);
                }}
                disabled={refreshing}
                className="inline-flex items-center gap-1 text-sm font-medium text-slate-500 transition hover:text-teal-600 disabled:opacity-60"
              >
                <RefreshCw size={15} className={refreshing ? "animate-spin" : ""} /> 同步
              </button>
            </div>
            <div className="space-y-4">
              {loadingTrips ? (
                <div className="space-y-3">
                  <div className="h-24 rounded-3xl bg-slate-100 animate-pulse" />
                  <div className="h-24 rounded-3xl bg-slate-100 animate-pulse" />
                </div>
              ) : publishedTrips.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-slate-500">
                  目前還沒有已發布的行程，發布後會在這裡顯示。
                </div>
              ) : (
                publishedTrips.map((trip) => (
                  <article
                    key={trip.id}
                    className="rounded-3xl border border-slate-100 bg-slate-50 p-5 transition hover:border-teal-300 hover:bg-white"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900">{trip.title || "未命名行程"}</h3>
                        <p className="mt-2 text-sm text-slate-500">更新於 {formatDateTime(trip.updatedAt)}</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Link
                          href={`/editor?draftId=${trip.id}`}
                          className="inline-flex items-center justify-center gap-2 rounded-full bg-teal-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-700"
                        >
                          <Edit3 size={16} /> 編輯
                        </Link>
                        <Link
                          href={`/trip/${trip.id}`}
                          className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                        >
                          <ExternalLink size={16} /> 檢視
                        </Link>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center gap-3 text-sm text-slate-500">
                      <span>評分：{trip.averageRating !== null ? `${trip.averageRating.toFixed(1)} / 5` : "尚未評分"}</span>
                      <span>{trip.reviewCount} 則評論</span>
                    </div>
                  </article>
                ))
              )}
            </div>
          </motion.div>

          <motion.section initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }} className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-xl font-bold">
                <Heart size={24} className="text-rose-600" /> 收藏行程
              </h2>
              <Link href="/" className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition hover:bg-slate-200">
                +
              </Link>
            </div>

            <div className="mb-6 overflow-hidden rounded-3xl border border-slate-200 bg-slate-50">
              <div className="relative h-48">
                <div className="absolute inset-0 bg-slate-100" />
                <div className="absolute left-0 top-10 h-10 w-full -rotate-6 bg-white/80" />
                <div className="absolute left-8 top-0 h-full w-12 rotate-12 bg-white/70" />
                <div className="absolute bottom-8 left-0 h-8 w-full rotate-3 bg-teal-100" />
                <div className="absolute left-1/4 top-1/3 flex h-9 w-9 items-center justify-center rounded-full bg-rose-600 text-white shadow-sm">
                  <Map size={18} />
                </div>
                <div className="absolute right-1/4 top-1/2 h-4 w-4 rounded-full bg-teal-500 ring-4 ring-white" />
                <div className="absolute bottom-6 left-1/2 h-3 w-3 rounded-full bg-amber-500 ring-4 ring-white" />
              </div>
            </div>

            {loadingFavoriteTrips ? (
              <div className="space-y-3">
                <div className="h-16 rounded-2xl bg-slate-100 animate-pulse" />
                <div className="h-16 rounded-2xl bg-slate-100 animate-pulse" />
              </div>
            ) : favoriteTrips.length === 0 ? (
              <div className="py-8 text-center text-slate-500">
                <Map size={32} className="mx-auto mb-2 text-slate-400" />
                <p>尚未收藏行程</p>
                <p className="text-sm">在首頁收藏行程後，會顯示在這裡。</p>
              </div>
            ) : (
              <div className="space-y-4">
                {favoriteTrips.map((favoriteTrip: FavoriteTrip) => (
                  <div key={favoriteTrip.id} className="rounded-2xl p-3 transition hover:bg-slate-50">
                    <div className="flex items-center gap-4">
                      <Link href={`/trip/${favoriteTrip.trip.id}`} className="group flex flex-1 items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl bg-teal-100 font-bold text-teal-700">
                          {favoriteTrip.trip.coverImage ? (
                            <img src={favoriteTrip.trip.coverImage} alt={favoriteTrip.trip.title} className="h-full w-full object-cover" />
                          ) : (
                            favoriteTrip.trip.title.charAt(0)
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="truncate font-bold text-slate-800 transition group-hover:text-teal-700">{favoriteTrip.trip.title}</h3>
                          <div className="mt-1 flex flex-wrap gap-2 text-xs font-medium">
                            <span className="text-slate-500">收藏於 {formatDateTime(favoriteTrip.favoritedAt)}</span>
                            {favoriteTrip.trip.averageRating ? (
                              <span className="text-amber-600">
                                {favoriteTrip.trip.averageRating.toFixed(1)} / 5（{favoriteTrip.trip.reviewCount}）
                              </span>
                            ) : null}
                          </div>
                        </div>
                        <ChevronRight size={18} className="text-slate-300 transition group-hover:text-teal-700" />
                      </Link>

                      <FavoriteToggle
                        endpoint={`/api/trips/${favoriteTrip.trip.id}/favorite`}
                        initialIsFavorited
                        activeLabel="已收藏"
                        inactiveLabel="收藏"
                        allowedRoles={["traveler", "planner"]}
                        variant="ghost"
                        className="shrink-0"
                        onChange={(isFavorited: boolean) => {
                          if (!isFavorited) {
                            setFavoriteTrips((current: FavoriteTrip[]) =>
                              current.filter((item: FavoriteTrip) => item.trip.id !== favoriteTrip.trip.id)
                            );
                          }
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.section>
          </div>

        </div>
      </main>
    </div>
  );
}
