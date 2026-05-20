"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { MapPin, MapPinned, Search, Users } from "lucide-react";
import { FavoriteToggle } from "@/app/components/favorite-toggle";
import { useAuth } from "@/app/providers";

type SearchTrip = {
  id: number;
  title: string;
  summary: string | null;
  coverImage: string | null;
  updatedAt: string;
  averageRating: number | null;
  reviewCount: number;
  isFavorited: boolean;
  author: {
    id: number;
    name: string | null;
    avatarUrl: string | null;
  };
};

type SearchPlanner = {
  id: number;
  name: string | null;
  avatarUrl: string | null;
  createdAt: string;
  publishedTripCount: number;
  isFavorited: boolean;
};

type SearchResponse = {
  trips: SearchTrip[];
  planners: SearchPlanner[];
};

export default function HomePage() {
  const { user, loading: authLoading, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [trips, setTrips] = useState<SearchTrip[]>([]);
  const [planners, setPlanners] = useState<SearchPlanner[]>([]);
  const [loadingResults, setLoadingResults] = useState(true);
  const [searching, setSearching] = useState(false);
  const [hasActiveSearch, setHasActiveSearch] = useState(false);
  const [currentQuery, setCurrentQuery] = useState("");

  const fetchResults = async (query?: string) => {
    setLoadingResults(true);
    const url = query ? `/api/search?q=${encodeURIComponent(query)}` : "/api/search";

    try {
      const response = await fetch(url, { cache: "no-store" });
      if (!response.ok) {
        setTrips([]);
        setPlanners([]);
        return;
      }

      const data = (await response.json()) as SearchResponse;
      setTrips(data.trips ?? []);
      setPlanners(data.planners ?? []);
    } catch {
      setTrips([]);
      setPlanners([]);
    } finally {
      setLoadingResults(false);
      setSearching(false);
    }
  };

  useEffect(() => {
    if (authLoading) {
      return;
    }

    const loadResults = async () => {
      await fetchResults(currentQuery || undefined);
    };

    void loadResults();
  }, [authLoading, currentQuery, user?.id, user?.role]);

  const handleSearch = async (event: FormEvent) => {
    event.preventDefault();
    const sanitizedQuery = searchQuery.replace(/<[^>]*>?/gm, "").trim();

    setSearching(true);
    setHasActiveSearch(Boolean(sanitizedQuery));
    setCurrentQuery(sanitizedQuery);
    await fetchResults(sanitizedQuery || undefined);
  };

  return (
    <div className="min-h-screen bg-slate-50 px-8 font-sans text-slate-800 sm:px-16 md:px-24 lg:px-[16vw] xl:px-[20vw]">
      <header className="flex flex-col items-start justify-between gap-4 py-6 sm:flex-row sm:items-center">
        <Link href="/" className="group flex items-center gap-3">
          <div className="rounded-full bg-blue-600 p-3 transition-colors group-hover:bg-blue-700">
            <MapPinned className="h-8 w-8 text-white" />
          </div>
          <span className="border-b-4 border-transparent text-2xl font-black tracking-tight text-blue-900 transition-all group-hover:border-blue-400 md:text-3xl">
            AITravel
          </span>
        </Link>

        <div className="flex items-center gap-3">
          {authLoading ? (
            <span className="rounded-2xl bg-slate-100 px-6 py-3 text-sm text-slate-500">載入中...</span>
          ) : user ? (
            <>
              <Link
                href={user.role === "admin" ? "/admin/dashboard" : `/${user.role}/dashboard`}
                className="flex items-center gap-3 rounded-2xl px-6 py-3 text-base font-bold text-slate-700 transition-colors hover:bg-slate-200"
              >
                <span className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-slate-100 text-slate-700">
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt={user.name} className="h-full w-full object-cover" />
                  ) : (
                    <span>{user.name.charAt(0)}</span>
                  )}
                </span>
                {user.name}
              </Link>
              <button
                onClick={logout}
                className="rounded-2xl px-6 py-3 text-base font-bold text-red-600 transition-colors hover:bg-red-50"
              >
                登出
              </button>
            </>
          ) : (
            <Link
              href="/signup-loggin/log-sign"
              className="rounded-2xl bg-blue-600 px-7 py-3 text-base font-bold text-white shadow-sm transition-colors hover:bg-blue-700"
            >
              Sign Up / Log In
            </Link>
          )}
        </div>
      </header>

      <main className="flex flex-col items-center pb-16 pt-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 w-full text-center">
          <h1 className="mb-3 text-3xl font-extrabold leading-tight tracking-tight text-slate-900 md:text-4xl">
            探索 AITravel 精選旅程
            <br className="hidden md:block" />
            也一起找到值得收藏的規劃師
          </h1>
          <p className="mx-auto max-w-2xl text-sm text-slate-500 md:text-base">
            首頁搜尋現在會同時返回公開行程與規劃師結果。旅人可以直接在這裡收藏，收藏內容會同步出現在旅人儀表板。
          </p>
        </motion.div>

        {user?.role === "planner" && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 0.999, y: 0 }} className="mb-8 w-full">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">規劃師工作台</h2>
                  <p className="text-sm text-slate-500">管理公開行程、草稿與 AI 編輯器。</p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Link href="/planner/dashboard" className="inline-flex items-center justify-center rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">
                    打開規劃師後台
                  </Link>
                  <Link href="/editor" className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
                    建立新行程
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-12 w-full">
          <form onSubmit={handleSearch} className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:shadow-md">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <Search className="h-5 w-5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="搜尋公開行程或規劃師"
                className="w-full bg-transparent text-lg font-bold text-slate-800 outline-none placeholder:text-slate-300"
              />
            </div>
            <button
              type="submit"
              className="mt-3 w-full rounded-xl bg-blue-600 py-3 text-sm font-bold text-white shadow-sm transition-all hover:bg-blue-700"
            >
              {searching ? "搜尋中..." : "搜尋行程與規劃師"}
            </button>
          </form>
        </motion.div>

        {loadingResults ? (
          <div className="grid w-full gap-8">
            <div className="grid gap-4">
              {[...Array(3)].map((_, index) => (
                <div key={index} className="h-40 rounded-3xl bg-slate-100 animate-pulse" />
              ))}
            </div>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {[...Array(3)].map((_, index) => (
                <div key={index} className="h-32 rounded-3xl bg-slate-100 animate-pulse" />
              ))}
            </div>
          </div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }} className="w-full space-y-10">
            <section>
              <div className="mb-4 flex items-end justify-between border-b border-slate-200 pb-2">
                <div>
                  <h2 className="text-lg font-bold text-slate-800">公開行程</h2>
                  <p className="text-xs text-slate-500">
                    {hasActiveSearch ? "搜尋結果中的可收藏行程" : "最新公開行程"}
                  </p>
                </div>
              </div>

              {trips.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">
                  {hasActiveSearch ? "沒有找到符合的行程。試著調整搜尋關鍵字。" : "目前還沒有公開行程。"}
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {trips.map((trip) => (
                    <div
                      key={trip.id}
                      className="flex flex-row overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm transition-all hover:shadow-md"
                    >
                      <Link href={`/trip/${trip.id}`} className="flex flex-1 cursor-pointer flex-row group">
                        <div className="relative h-28 w-32 shrink-0 overflow-hidden bg-slate-200 sm:w-36">
                          {trip.coverImage ? (
                            <img
                              src={trip.coverImage}
                              alt={trip.title}
                              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-slate-200 text-slate-400">No Image</div>
                          )}
                        </div>
                        <div className="flex flex-grow flex-col justify-center p-3">
                          <div className="mb-1 flex items-center gap-1.5 text-[11px] font-semibold text-blue-600">
                            <MapPin className="h-3 w-3" />
                            更新於 {new Date(trip.updatedAt).toLocaleDateString()}
                          </div>
                          <h3 className="mb-2 line-clamp-2 text-base font-bold leading-tight text-slate-800 transition-colors group-hover:text-blue-600">
                            {trip.title}
                          </h3>
                          <p className="line-clamp-2 text-sm text-slate-500">{trip.summary || "尚未提供行程摘要。"}</p>
                          <div className="mt-3 flex items-center justify-between">
                            <div className="flex items-center gap-2 text-xs text-slate-500">
                              <span className="flex h-6 w-6 items-center justify-center overflow-hidden rounded-full bg-slate-100 text-slate-500">
                                {trip.author.avatarUrl ? (
                                  <img src={trip.author.avatarUrl} alt={trip.author.name ?? "規劃師"} className="h-full w-full object-cover" />
                                ) : (
                                  <span>{(trip.author.name ?? "A").charAt(0)}</span>
                                )}
                              </span>
                              <span>{trip.author.name ?? "規劃師"}</span>
                            </div>
                            {trip.averageRating ? (
                              <div className="flex items-center gap-1 text-xs text-amber-600">
                                <span>★</span>
                                <span className="font-medium">{trip.averageRating.toFixed(1)}</span>
                                <span className="text-slate-400">({trip.reviewCount})</span>
                              </div>
                            ) : null}
                          </div>
                        </div>
                      </Link>

                      <div className="flex items-center px-3">
                        <FavoriteToggle
                          key={`trip-${trip.id}-${trip.isFavorited ? "1" : "0"}`}
                          endpoint={`/api/trips/${trip.id}/favorite`}
                          initialIsFavorited={trip.isFavorited}
                          activeLabel="已收藏"
                          inactiveLabel="收藏"
                          variant="ghost"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section>
              <div className="mb-4 flex items-end justify-between border-b border-slate-200 pb-2">
                <div>
                  <h2 className="text-lg font-bold text-slate-800">規劃師</h2>
                  <p className="text-xs text-slate-500">
                    {hasActiveSearch ? "搜尋結果中的規劃師" : "近期可合作的規劃師"}
                  </p>
                </div>
              </div>

              {planners.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">
                  {hasActiveSearch ? "沒有找到符合的規劃師。試著換個關鍵字。" : "目前沒有可顯示的規劃師。"}
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {planners.map((planner) => (
                    <div key={planner.id} className="rounded-3xl border border-slate-200 bg-white p-5 transition hover:border-blue-400 hover:bg-blue-50">
                      <Link href={`/planner/${planner.id}`} className="block">
                        <div className="flex items-center gap-4">
                          <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl bg-slate-100 text-xl font-bold text-slate-700">
                            {planner.avatarUrl ? (
                              <img src={planner.avatarUrl} alt={planner.name ?? "規劃師"} className="h-full w-full object-cover" />
                            ) : (
                              (planner.name ?? "P").charAt(0)
                            )}
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-slate-900">{planner.name ?? "規劃師"}</h3>
                            <p className="text-sm text-slate-500">公開行程 {planner.publishedTripCount} 筆</p>
                            <p className="mt-1 text-xs text-slate-400">加入時間 {new Date(planner.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                      </Link>

                      <div className="mt-4 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                          <Users size={16} />
                          <span>可前往個人頁查看公開行程</span>
                        </div>
                        <FavoriteToggle
                          key={`planner-${planner.id}-${planner.isFavorited ? "1" : "0"}`}
                          endpoint={`/api/planners/${planner.id}/favorite`}
                          initialIsFavorited={planner.isFavorited}
                          activeLabel="已收藏"
                          inactiveLabel="收藏"
                          variant="ghost"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </motion.div>
        )}
      </main>
    </div>
  );
}
