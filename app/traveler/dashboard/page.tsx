"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Calendar, ChevronRight, Compass, Heart, Luggage, Map, MapPin, Star, Users } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/app/providers";
import { FavoriteToggle } from "@/app/components/favorite-toggle";
import { ProfilePanel } from "@/app/components/profile-panel";

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

type Participation = {
  id: number;
  joinedAt: string;
  status: string;
  trip: {
    id: number;
    title: string;
    isPublished: boolean;
  };
};

const defaultStats: TravelerStats = {
  participatedTrips: 0,
  activeTrips: 0,
  completedTrips: 0,
  favoriteTrips: 0,
  favoritePlanners: 0,
  averageGivenRating: null,
  totalReviewsGiven: 0,
};

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString("zh-TW");
}

export default function TravelerDashboard() {
  const { user, loading: authLoading, setUser } = useAuth();
  const [favoriteTrips, setFavoriteTrips] = useState<FavoriteTrip[]>([]);
  const [favoritePlanners, setFavoritePlanners] = useState<FavoritePlanner[]>([]);
  const [participations, setParticipations] = useState<Participation[]>([]);
  const [stats, setStats] = useState<TravelerStats>(defaultStats);
  const [loadingData, setLoadingData] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) {
        return;
      }

      setLoadingData(true);
      try {
        const [statsRes, favoritesRes, participationsRes] = await Promise.all([
          fetch(`/api/users/${user.id}/stats`, { cache: "no-store" }),
          fetch(`/api/users/${user.id}/favorites`, { cache: "no-store" }),
          fetch(`/api/users/${user.id}/participations`, { cache: "no-store" }),
        ]);

        if (statsRes.ok) {
          const statsData = (await statsRes.json()) as TravelerStats;
          setStats(statsData);
        } else {
          setStats(defaultStats);
        }

        if (favoritesRes.ok) {
          const favoritesData = (await favoritesRes.json()) as FavoritesResponse;
          setFavoriteTrips(favoritesData.trips ?? []);
          setFavoritePlanners(favoritesData.planners ?? []);
        } else {
          setFavoriteTrips([]);
          setFavoritePlanners([]);
        }

        if (participationsRes.ok) {
          const participationData = (await participationsRes.json()) as Participation[];
          setParticipations(participationData);
        } else {
          setParticipations([]);
        }
      } catch {
        setStats(defaultStats);
        setFavoriteTrips([]);
        setFavoritePlanners([]);
        setParticipations([]);
      } finally {
        setLoadingData(false);
      }
    };

    void fetchData();
  }, [user]);

  if (authLoading) {
    return <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-500">載入中...</div>;
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6 text-slate-600">
        <div className="max-w-md rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-lg">
          <p className="mb-3 text-lg font-semibold text-slate-900">您尚未登入。</p>
          <p className="mb-6 text-sm text-slate-500">請先登入後，才能檢視旅人儀表板與收藏資料。</p>
          <Link href="/signup-loggin/log-sign" className="inline-flex items-center justify-center rounded-3xl bg-blue-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-blue-700">
            回到登入頁面
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 lg:flex">
      <aside className="border-r border-slate-200 bg-white lg:sticky lg:top-0 lg:h-screen lg:w-80 lg:flex-shrink-0 lg:overflow-y-auto">
        <Link href="/" className="flex items-center gap-2 border-b border-slate-100 p-6 text-xl font-bold text-blue-600 transition hover:opacity-80">
          <Compass size={28} />
          <span>AITravel</span>
        </Link>

        <nav className="space-y-2 p-4">
          <a href="#overview" className="flex w-full items-center gap-3 rounded-xl bg-blue-50 px-4 py-3 text-left font-medium text-blue-600 transition">
            <Heart size={20} /> 我的收藏
          </a>
          <a href="#participations" className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left font-medium text-slate-600 transition hover:bg-slate-50 hover:text-blue-600">
            <Luggage size={20} /> 參與行程
          </a>
          <Link href="/" className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left font-medium text-slate-600 transition hover:bg-slate-50 hover:text-blue-600">
            <Map size={20} /> 探索行程
          </Link>
        </nav>

        <div className="p-4">
          <ProfilePanel user={user} roleLabel="旅人會員" accentColor="blue" compact onUserUpdated={setUser} />
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-6 lg:p-10">
        <header className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">歡迎回來，{user.name}</h1>
            <p className="mt-1 text-slate-500">管理你的收藏、參與行程與個人資料。</p>
          </div>
          <Link href="/" className="inline-flex items-center justify-center rounded-3xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-700">
            探索更多行程
          </Link>
        </header>

        <section id="overview" className="mb-10 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-100 text-rose-600">
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
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-100 text-sky-600">
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
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-100 text-teal-600">
              <Calendar size={28} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">參與行程</p>
              <p className="text-2xl font-bold">
                {loadingData ? "..." : stats.participatedTrips}
                <span className="text-sm font-normal text-slate-400"> 個</span>
              </p>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="flex items-center gap-4 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-600">
              <Star size={28} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">平均評分</p>
              <p className="text-2xl font-bold">
                {loadingData ? "..." : stats.averageGivenRating ? `${stats.averageGivenRating} / 5` : "尚未評分"}
              </p>
            </div>
          </motion.div>
        </section>

        <section className="mb-10 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="flex items-center gap-2 text-xl font-bold text-slate-900">
                <Users size={22} className="text-blue-600" /> 收藏規劃師
              </h2>
              <p className="text-sm text-slate-500">快速回到你信任的規劃師頁面，查看他們最新發布的行程。</p>
            </div>
            <Link href="/" className="inline-flex items-center justify-center rounded-3xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700">
              尋找規劃師
            </Link>
          </div>

          {loadingData ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <div className="h-32 rounded-3xl bg-slate-100 animate-pulse" />
              <div className="h-32 rounded-3xl bg-slate-100 animate-pulse" />
              <div className="h-32 rounded-3xl bg-slate-100 animate-pulse" />
            </div>
          ) : favoritePlanners.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-6 text-slate-500">
              目前還沒有收藏規劃師。到首頁探索並收藏喜歡的規劃師後，會顯示在這裡。
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {favoritePlanners.map((favoritePlanner: FavoritePlanner) => (
                <div key={favoritePlanner.id} className="rounded-3xl border border-slate-200 bg-white p-5 transition hover:border-blue-400 hover:bg-blue-50">
                  <Link href={`/planner/${favoritePlanner.planner.id}`} className="block">
                    <div className="flex items-center gap-4">
                      <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl bg-slate-100 text-xl font-bold text-slate-700">
                        {favoritePlanner.planner.avatarUrl ? (
                          <img src={favoritePlanner.planner.avatarUrl} alt={favoritePlanner.planner.name ?? "規劃師"} className="h-full w-full object-cover" />
                        ) : (
                          (favoritePlanner.planner.name ?? "P").charAt(0)
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="truncate text-lg font-semibold text-slate-900">{favoritePlanner.planner.name ?? "規劃師"}</h3>
                        <p className="text-sm text-slate-500">已發布 {favoritePlanner.planner.publishedTripCount} 個行程</p>
                        <p className="mt-1 text-xs text-slate-400">收藏於 {formatDate(favoritePlanner.favoritedAt)}</p>
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
                      onChange={(isFavorited: boolean) => {
                        if (!isFavorited) {
                          setFavoritePlanners((current: FavoritePlanner[]) =>
                            current.filter((item: FavoritePlanner) => item.planner.id !== favoritePlanner.planner.id)
                          );
                          setStats((current: TravelerStats) => ({
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
        </section>

        <div className="grid grid-cols-1 gap-8 xl:grid-cols-3">
          <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm xl:col-span-2">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="flex items-center gap-2 text-xl font-bold text-slate-900">
                  <Luggage size={24} className="text-teal-600" /> 參與行程
                </h2>
                <p className="text-sm text-slate-500">你已加入的公開行程會集中在這裡。</p>
              </div>
              <span className="rounded-full bg-teal-50 px-3 py-1 text-sm font-semibold text-teal-700">
                進行中 {stats.activeTrips}
              </span>
            </div>

            {loadingData ? (
              <div className="space-y-3">
                <div className="h-20 rounded-3xl bg-slate-100 animate-pulse" />
                <div className="h-20 rounded-3xl bg-slate-100 animate-pulse" />
              </div>
            ) : participations.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-slate-500">
                <MapPin size={36} className="mx-auto mb-3 text-slate-400" />
                尚未參與任何行程。探索行程並加入後，會顯示在這裡。
              </div>
            ) : (
              <div className="space-y-4">
                {participations.map((participation: Participation) => (
                  <Link
                    key={participation.id}
                    href={`/trip/${participation.trip.id}`}
                    className="group block rounded-3xl border border-slate-100 bg-slate-50 p-5 transition hover:border-teal-300 hover:bg-white"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900 transition group-hover:text-teal-700">{participation.trip.title}</h3>
                        <p className="mt-2 text-sm text-slate-500">加入於 {formatDate(participation.joinedAt)}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600">
                          {participation.status === "completed" ? "已完成" : "進行中"}
                        </span>
                        <ChevronRight size={18} className="text-slate-300 transition group-hover:text-teal-600" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>

          <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-xl font-bold">
                <Heart size={24} className="text-rose-600" /> 收藏行程
              </h2>
              <Link href="/" className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition hover:bg-slate-200">
                +
              </Link>
            </div>

            {loadingData ? (
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
                        <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl bg-blue-100 font-bold text-blue-600">
                          {favoriteTrip.trip.coverImage ? (
                            <img src={favoriteTrip.trip.coverImage} alt={favoriteTrip.trip.title} className="h-full w-full object-cover" />
                          ) : (
                            favoriteTrip.trip.title.charAt(0)
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="truncate font-bold text-slate-800 transition group-hover:text-blue-600">{favoriteTrip.trip.title}</h3>
                          <div className="mt-1 flex flex-wrap gap-2 text-xs font-medium">
                            <span className="text-slate-500">收藏於 {formatDate(favoriteTrip.favoritedAt)}</span>
                            {favoriteTrip.trip.averageRating ? (
                              <span className="text-amber-600">
                                {favoriteTrip.trip.averageRating.toFixed(1)} 分 ({favoriteTrip.trip.reviewCount})
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
                        onChange={(isFavorited: boolean) => {
                          if (!isFavorited) {
                            setFavoriteTrips((current: FavoriteTrip[]) =>
                              current.filter((item: FavoriteTrip) => item.trip.id !== favoriteTrip.trip.id)
                            );
                            setStats((current: TravelerStats) => ({
                              ...current,
                              favoriteTrips: Math.max(0, current.favoriteTrips - 1),
                            }));
                          }
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
