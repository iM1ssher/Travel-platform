"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Calendar, ChevronRight, Compass, Heart, Map, MapPin, Star, Users } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/app/providers";
import { FavoriteToggle } from "@/app/components/favorite-toggle";

type FavoriteTrip = {
  id: number;
  favoritedAt: string;
  trip: {
    id: number;
    title: string;
    summary: string | null;
    coverImage: string | null;
    isPublished: boolean;
    updatedAt: string;
    averageRating: number | null;
    reviewCount: number;
    author: {
      id: number;
      name: string | null;
      avatarUrl: string | null;
    };
  };
};

type FavoritePlanner = {
  id: number;
  favoritedAt: string;
  planner: {
    id: number;
    name: string | null;
    avatarUrl: string | null;
    createdAt: string;
    publishedTripCount: number;
  };
};

type TravelerStats = {
  participatedTrips: number;
  activeTrips: number;
  completedTrips: number;
  favoriteTrips: number;
  favoritePlanners: number;
  averageGivenRating: number | null;
  totalReviewsGiven: number;
};

type FavoritesResponse = {
  trips: FavoriteTrip[];
  planners: FavoritePlanner[];
};

export default function TravelerDashboard() {
  const { user, loading: authLoading } = useAuth();
  const [favoriteTrips, setFavoriteTrips] = useState<FavoriteTrip[]>([]);
  const [favoritePlanners, setFavoritePlanners] = useState<FavoritePlanner[]>([]);
  const [stats, setStats] = useState<TravelerStats>({
    participatedTrips: 0,
    activeTrips: 0,
    completedTrips: 0,
    favoriteTrips: 0,
    favoritePlanners: 0,
    averageGivenRating: null,
    totalReviewsGiven: 0,
  });
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) {
        return;
      }

      setLoadingData(true);
      try {
        const [statsRes, favoritesRes] = await Promise.all([
          fetch(`/api/users/${user.id}/stats`, { cache: "no-store" }),
          fetch(`/api/users/${user.id}/favorites`, { cache: "no-store" }),
        ]);

        if (statsRes.ok) {
          const statsData = (await statsRes.json()) as TravelerStats;
          setStats(statsData);
        }

        if (favoritesRes.ok) {
          const favoritesData = (await favoritesRes.json()) as FavoritesResponse;
          setFavoriteTrips(favoritesData.trips);
          setFavoritePlanners(favoritesData.planners);
        } else {
          setFavoriteTrips([]);
          setFavoritePlanners([]);
        }
      } catch {
        setFavoriteTrips([]);
        setFavoritePlanners([]);
      } finally {
        setLoadingData(false);
      }
    };

    fetchData();
  }, [user]);

  if (authLoading) {
    return <div className="min-h-screen bg-slate-50 text-slate-500 flex items-center justify-center">載入中...</div>;
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-600 flex items-center justify-center">
        <div className="max-w-md rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-lg">
          <p className="mb-3 text-lg font-semibold text-slate-900">您尚未登入。</p>
          <p className="mb-6 text-sm text-slate-500">請先登入後，才能查看旅人儀表板、收藏行程與收藏規劃師。</p>
          <Link href="/signup-loggin/log-sign" className="inline-flex items-center justify-center rounded-3xl bg-blue-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-blue-700">
            回到登入頁面
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 flex">
      <aside className="w-64 flex-shrink-0 border-r border-slate-200 bg-white flex flex-col justify-between">
        <div>
          <Link href="/" className="p-6 flex items-center gap-2 border-b border-slate-100 text-xl font-bold text-blue-600 transition hover:opacity-80">
            <Compass size={28} />
            <span>AITravel</span>
          </Link>
          <nav className="space-y-2 p-4">
            <button className="w-full rounded-xl bg-blue-50 px-4 py-3 text-left font-medium text-blue-600 transition flex items-center gap-3">
              <Heart size={20} /> 我的收藏
            </button>
            <button className="w-full rounded-xl px-4 py-3 text-left font-medium text-slate-600 transition hover:bg-slate-50 hover:text-blue-600 flex items-center gap-3">
              <Map size={20} /> 參與旅程
            </button>
            <button className="w-full rounded-xl px-4 py-3 text-left font-medium text-slate-600 transition hover:bg-slate-50 hover:text-blue-600 flex items-center gap-3">
              <Calendar size={20} /> 旅遊紀錄
            </button>
          </nav>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-6 lg:p-10">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800">歡迎回來，{user.name}</h1>
          <p className="mt-1 text-slate-500">這裡顯示你的旅遊統計、收藏行程與收藏規劃師。</p>
        </header>

        <div className="mb-10 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-5">
            <div className="h-20 w-20 overflow-hidden rounded-full border-4 border-white bg-blue-100 flex items-center justify-center shadow-lg">
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.name} className="h-full w-full object-cover" />
              ) : (
                <span className="text-3xl font-black text-blue-600">{user.name.charAt(0)}</span>
              )}
            </div>
            <div>
              <p className="text-3xl font-bold text-slate-900">{user.name}</p>
              <p className="mt-2 inline-block rounded-full bg-blue-100 px-4 py-1.5 text-sm font-semibold text-blue-700 shadow-sm">
                旅人會員
              </p>
            </div>
          </div>
          <Link href="/" className="inline-flex items-center justify-center rounded-3xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-700">
            回到首頁搜尋
          </Link>
        </div>

        <div className="mb-10 grid grid-cols-1 gap-6 md:grid-cols-3">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
            <div className="h-14 w-14 rounded-2xl bg-rose-100 flex items-center justify-center text-rose-600">
              <Heart size={28} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">收藏行程</p>
              <p className="text-2xl font-bold">
                {loadingData ? "..." : stats.favoriteTrips}
                <span className="text-sm font-normal text-slate-400"> 個</span>
              </p>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex items-center gap-4 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
            <div className="h-14 w-14 rounded-2xl bg-sky-100 flex items-center justify-center text-sky-600">
              <Users size={28} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">收藏規劃師</p>
              <p className="text-2xl font-bold">
                {loadingData ? "..." : stats.favoritePlanners}
                <span className="text-sm font-normal text-slate-400"> 位</span>
              </p>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="flex items-center gap-4 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
            <div className="h-14 w-14 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-600">
              <Star size={28} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">平均給予評分</p>
              <p className="text-2xl font-bold">
                {loadingData ? "..." : stats.averageGivenRating ? `${stats.averageGivenRating} / 5` : "尚未評分"}
              </p>
            </div>
          </motion.div>
        </div>

        <section className="mb-10">
          <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="flex items-center gap-2 text-xl font-bold text-slate-900">
                  <Users size={22} className="text-blue-600" /> 收藏規劃師
                </h2>
                <p className="text-sm text-slate-500">首頁搜尋到喜歡的規劃師後，可以直接收藏，這裡會同步顯示。</p>
              </div>
              <Link href="/" className="inline-flex items-center justify-center rounded-3xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700">
                去首頁搜尋規劃師
              </Link>
            </div>

            {loadingData ? (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {[...Array(3)].map((_, index) => (
                  <div key={index} className="h-32 rounded-3xl bg-slate-100 animate-pulse" />
                ))}
              </div>
            ) : favoritePlanners.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-6 text-slate-500">
                目前尚未收藏任何規劃師。你可以從首頁搜尋結果直接加入收藏。
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {favoritePlanners.map((favoritePlanner) => (
                  <div key={favoritePlanner.id} className="rounded-3xl border border-slate-200 bg-white p-5 transition hover:border-blue-400 hover:bg-blue-50">
                    <Link href={`/planner/${favoritePlanner.planner.id}`} className="block">
                      <div className="flex items-center gap-4">
                        <div className="h-14 w-14 overflow-hidden rounded-2xl bg-slate-100 flex items-center justify-center text-xl font-bold text-slate-700">
                          {favoritePlanner.planner.avatarUrl ? (
                            <img src={favoritePlanner.planner.avatarUrl} alt={favoritePlanner.planner.name ?? "規劃師"} className="h-full w-full object-cover" />
                          ) : (
                            (favoritePlanner.planner.name ?? "P").charAt(0)
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-slate-900">{favoritePlanner.planner.name ?? "規劃師"}</h3>
                          <p className="text-sm text-slate-500">公開行程 {favoritePlanner.planner.publishedTripCount} 筆</p>
                          <p className="mt-1 text-xs text-slate-400">收藏於 {new Date(favoritePlanner.favoritedAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </Link>

                    <div className="mt-4 flex justify-end">
                      <FavoriteToggle
                        endpoint={`/api/planners/${favoritePlanner.planner.id}/favorite`}
                        initialIsFavorited
                        activeLabel="已收藏"
                        inactiveLabel="收藏"
                        variant="ghost"
                        onChange={(isFavorited) => {
                          if (!isFavorited) {
                            setFavoritePlanners((current) =>
                              current.filter((item) => item.planner.id !== favoritePlanner.planner.id)
                            );
                            setStats((current) => ({
                              ...current,
                              favoritePlanners: Math.max(0, current.favoritePlanners - 1),
                            }));
                          }
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="lg:col-span-2 rounded-3xl border border-slate-100 bg-white shadow-sm overflow-hidden flex flex-col">
            <div className="border-b border-slate-100 p-6 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-xl font-bold">
                <Map size={24} className="text-blue-600" /> 我的地圖視圖
              </h2>
              <button className="text-sm font-medium text-blue-600 hover:underline">查看完整地圖</button>
            </div>
            <div className="relative flex min-h-[300px] flex-1 items-center justify-center bg-slate-200">
              <div className="text-center text-slate-500">
                <MapPin size={48} className="mx-auto mb-2 text-slate-400 opacity-50" />
                <p>這裡會顯示你收藏旅程的景點位置與路線。</p>
                <p className="text-sm">後續可以擴充為收藏行程的地圖聚合檢視。</p>
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }} className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-xl font-bold">
                <Calendar size={24} className="text-teal-600" /> 收藏行程
              </h2>
              <Link href="/" className="h-8 w-8 rounded-full bg-slate-100 text-slate-600 transition hover:bg-slate-200 flex items-center justify-center">
                +
              </Link>
            </div>
            <div className="space-y-4">
              {loadingData ? (
                <div className="space-y-3">
                  <div className="h-16 rounded-2xl bg-slate-100 animate-pulse" />
                  <div className="h-16 rounded-2xl bg-slate-100 animate-pulse" />
                </div>
              ) : favoriteTrips.length === 0 ? (
                <div className="py-8 text-center text-slate-500">
                  <Map size={32} className="mx-auto mb-2 text-slate-400" />
                  <p>還沒有收藏任何行程</p>
                  <p className="text-sm">從首頁或行程頁加入你喜歡的旅程。</p>
                </div>
              ) : (
                favoriteTrips.map((favoriteTrip) => (
                  <div key={favoriteTrip.id} className="rounded-2xl p-3 transition hover:bg-slate-50 group">
                    <div className="flex items-center gap-4">
                      <Link href={`/trip/${favoriteTrip.trip.id}`} className="flex flex-1 items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                          {favoriteTrip.trip.title.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-slate-800 transition group-hover:text-blue-600">{favoriteTrip.trip.title}</h3>
                          <div className="mt-1 flex gap-2 text-xs font-medium">
                            <span className="text-slate-500">收藏於 {new Date(favoriteTrip.favoritedAt).toLocaleDateString()}</span>
                            {favoriteTrip.trip.averageRating ? (
                              <span className="text-amber-600">
                                ★ {favoriteTrip.trip.averageRating.toFixed(1)} ({favoriteTrip.trip.reviewCount})
                              </span>
                            ) : null}
                          </div>
                        </div>
                        <ChevronRight size={18} className="text-slate-300 transition group-hover:text-blue-600" />
                      </Link>

                      <FavoriteToggle
                        endpoint={`/api/trips/${favoriteTrip.trip.id}/favorite`}
                        initialIsFavorited
                        activeLabel="已收藏"
                        inactiveLabel="收藏"
                        variant="ghost"
                        className="shrink-0"
                        onChange={(isFavorited) => {
                          if (!isFavorited) {
                            setFavoriteTrips((current) =>
                              current.filter((item) => item.trip.id !== favoriteTrip.trip.id)
                            );
                            setStats((current) => ({
                              ...current,
                              favoriteTrips: Math.max(0, current.favoriteTrips - 1),
                            }));
                          }
                        }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
