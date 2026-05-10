// 前端 - 主頁面：顯示 AITravel 首頁，包含行程搜尋、熱門行程展示、登入/註冊導航

"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { MapPinned, Search, MapPin } from "lucide-react";
import { useAuth } from "@/app/providers";

type PublishedTrip = {
  id: number;
  title: string;
  summary: string | null;
  coverImage: string | null;
  updatedAt: string;
  averageRating: number | null;
  reviewCount: number;
  author: {
    name: string | null;
    avatarUrl: string | null;
  };
};

export default function HomePage() {
  const { user, loading: authLoading, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [trips, setTrips] = useState<PublishedTrip[]>([]);
  const [loadingTrips, setLoadingTrips] = useState(true);
  const [searching, setSearching] = useState(false);
  const [hasActiveSearch, setHasActiveSearch] = useState(false);

  const fetchTrips = async (query?: string) => {
    setLoadingTrips(true);
    const url = query ? `/api/trips?q=${encodeURIComponent(query)}` : "/api/trips";

    try {
      const response = await fetch(url, { cache: "no-store" });
      const data = await response.json();
      setTrips(data.trips ?? []);
    } catch {
      setTrips([]);
    } finally {
      setLoadingTrips(false);
      setSearching(false);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  const handleSearch = async (e: FormEvent) => {
    e.preventDefault();
    const sanitizedQuery = String(searchQuery).replace(/<[^>]*>?/gm, "").trim();

    setSearching(true);
    setHasActiveSearch(!!sanitizedQuery);
    await fetchTrips(sanitizedQuery || undefined);
    setSearchQuery(""); // 清空搜尋框
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800 px-8 sm:px-16 md:px-32 lg:px-[20vw] xl:px-[25vw]">
      <header className="w-full flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-6">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="p-3 bg-blue-600 rounded-full group-hover:bg-blue-700 transition-colors">
            <MapPinned className="w-8 h-8 text-white" />
          </div>
          <span className="text-2xl md:text-3xl font-black text-blue-900 tracking-tight border-b-4 border-transparent group-hover:border-blue-400 transition-all">
            AITravel
          </span>
        </Link>

        <div className="flex items-center gap-3">
          {authLoading ? (
            <span className="px-6 py-3 rounded-2xl bg-slate-100 text-slate-500 text-sm">載入中...</span>
          ) : user ? (
            <>
              <Link
                href={user.role === "admin" ? "/admin/dashboard" : `/${user.role}/dashboard`}
                className="flex items-center gap-3 px-6 py-3 text-base font-bold text-slate-700 hover:bg-slate-200 rounded-2xl transition-colors"
              >
                <span className="h-8 w-8 rounded-full bg-slate-100 overflow-hidden flex items-center justify-center text-slate-700">
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
                className="px-6 py-3 text-base font-bold text-red-600 hover:bg-red-50 rounded-2xl transition-colors"
              >
                登出
              </button>
            </>
          ) : (
            <Link
              href="/signup-loggin/log-sign"
              className="px-7 py-3 text-base font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-2xl shadow-sm transition-colors"
            >
              Sign Up / Log In
            </Link>
          )}
        </div>
      </header>

      <main className="flex-grow flex flex-col items-center pt-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8 w-full"
        >
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-3 text-slate-900 leading-tight">
            你的專屬 AI 行程助手 <br className="hidden md:block" />與旅遊靈感發源地
          </h1>
          <p className="text-sm md:text-base text-slate-500 max-w-lg mx-auto">
            告別繁瑣的搜尋與昂貴的機票比價。透過自然語言對話，一秒生成專屬行程表。
          </p>
        </motion.div>

        {user?.role === "planner" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full mb-8"
          >
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">規劃師快速入口</h2>
                  <p className="text-sm text-slate-500">立即進入你的規劃師儀表板或建立新的行程草稿。</p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Link href="/planner/dashboard" className="inline-flex items-center justify-center rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800 transition">
                    我的規劃師儀表板
                  </Link>
                  <Link href="/editor" className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition">
                    建立新草稿
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="w-full mb-12"
        >
          <form
            onSubmit={handleSearch}
            className="flex flex-col bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all"
          >
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <Search className="w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜尋行程標題或摘要..."
                className="w-full text-lg font-bold outline-none bg-transparent placeholder:text-slate-300 text-slate-800"
              />
            </div>
            <button
              type="submit"
              className="mt-3 w-full bg-blue-600 text-white py-3 rounded-xl font-bold text-sm hover:bg-blue-700 transition-all shadow-sm"
            >
              {searching ? "搜尋中..." : "搜尋公開行程"}
            </button>
          </form>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="w-full pb-16"
        >
          <div className="mb-4 flex justify-between items-end border-b border-slate-200 pb-2">
            <div>
              <h2 className="text-lg font-bold text-slate-800 mb-0.5">探索熱門行程</h2>
              <p className="text-xs text-slate-500">
                透過已發布的行程，找到最適合你的旅遊靈感
              </p>
            </div>
          </div>

          {loadingTrips ? (
            <div className="grid gap-4">
              {[...Array(3)].map((_, index) => (
                <div key={index} className="h-40 bg-slate-100 animate-pulse rounded-3xl" />
              ))}
            </div>
          ) : trips.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">
              {hasActiveSearch ? "沒有找到符合的行程。試著調整搜尋關鍵字。" : "目前還沒有公開行程。試著建立或搜尋更多旅遊靈感。"}
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {trips.map((itinerary) => (
                <Link
                  key={itinerary.id}
                  href={`/trip/${itinerary.id}`}
                  className="flex flex-row bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer group border border-slate-100"
                >
                  <div className="h-28 w-32 sm:w-36 bg-slate-200 relative overflow-hidden shrink-0">
                    {itinerary.coverImage ? (
                      <img
                        src={itinerary.coverImage}
                        alt={itinerary.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-slate-200 flex items-center justify-center text-slate-400">No Image</div>
                    )}
                  </div>
                  <div className="p-3 flex flex-col justify-center flex-grow">
                    <div className="flex items-center gap-1.5 text-[11px] font-semibold text-blue-600 mb-1">
                      <MapPin className="w-3 h-3" /> 發布於 {new Date(itinerary.updatedAt).toLocaleDateString()}
                    </div>
                    <h3 className="text-base font-bold text-slate-800 leading-tight mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                      {itinerary.title}
                    </h3>
                    <p className="text-sm text-slate-500 line-clamp-2">{itinerary.summary || "本行程尚未補上摘要。"}</p>
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <div className="flex items-center gap-2">
                          <span className="h-6 w-6 rounded-full overflow-hidden bg-slate-100 flex items-center justify-center text-slate-500">
                            {itinerary.author.avatarUrl ? (
                              <img src={itinerary.author.avatarUrl} alt={itinerary.author.name ?? "作者"} className="h-full w-full object-cover" />
                            ) : (
                              <span>{(itinerary.author.name ?? "A").charAt(0)}</span>
                            )}
                          </span>
                          <span>{itinerary.author.name ?? "匿名作者"}</span>
                        </div>
                      </div>
                      {itinerary.averageRating && (
                        <div className="flex items-center gap-1 text-xs text-amber-600">
                          <span>★</span>
                          <span className="font-medium">{itinerary.averageRating.toFixed(1)}</span>
                          <span className="text-slate-400">({itinerary.reviewCount})</span>
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}