// 前端 - 旅行者儀表板頁面：顯示旅行者的個人資料與旅程概覽

"use client";

import { FormEvent, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Map, Plane, MapPin, Calendar, Heart, Compass, ChevronRight, Star, Search } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/app/providers";

type ParticipatedTrip = {
  id: number;
  title: string;
  joinedAt: string;
  status: string;
  trip: {
    id: number;
    title: string;
    isPublished: boolean;
  };
};

type TravelerStats = {
  participatedTrips: number;
  activeTrips: number;
  completedTrips: number;
  averageGivenRating: number | null;
  totalReviewsGiven: number;
};

export default function TravelerDashboard() {
  const { user, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [participations, setParticipations] = useState<ParticipatedTrip[]>([]);
  const [stats, setStats] = useState<TravelerStats>({
    participatedTrips: 0,
    activeTrips: 0,
    completedTrips: 0,
    averageGivenRating: null,
    totalReviewsGiven: 0,
  });
  const [loadingData, setLoadingData] = useState(true);
  const [plannerQuery, setPlannerQuery] = useState("");
  const [plannerResults, setPlannerResults] = useState<Array<{ id: number; name: string; avatarUrl: string | null; publishedTripCount: number }>>([]);
  const [plannerLoading, setPlannerLoading] = useState(false);

  const fetchPlannerResults = async (query = "") => {
    setPlannerLoading(true);
    try {
      const searchParams = new URLSearchParams();
      searchParams.set('role', 'planner');
      if (query.trim()) {
        searchParams.set('q', query.trim());
      }

      const res = await fetch(`/api/users?${searchParams.toString()}`, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setPlannerResults(data);
      }
    } catch (error) {
      console.error('Error fetching planner search results:', error);
      setPlannerResults([]);
    } finally {
      setPlannerLoading(false);
    }
  };

  const handlePlannerSearch = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await fetchPlannerResults(plannerQuery);
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      setLoadingData(true);
      try {
        // Fetch user stats
        const statsRes = await fetch(`/api/users/${user.id}/stats`, { cache: "no-store" });
        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(statsData);
        }

        // For now, we'll show empty participations since we need to implement the API to get participations with trip details
        // This would be implemented as a separate API endpoint or by modifying the existing trips API
        setParticipations([]);
      } catch (error) {
        console.error('Error fetching traveler data:', error);
        setParticipations([]);
      } finally {
        setLoadingData(false);
      }
    };

    fetchData();
    fetchPlannerResults();
  }, [user]);

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
          <p className="text-sm text-slate-500 mb-6">請先登入後，才能查看旅人儀表板與收藏行程。</p>
          <Link href="/signup-loggin/log-sign" className="inline-flex items-center justify-center rounded-3xl bg-blue-600 px-6 py-3 text-sm font-bold text-white hover:bg-blue-700 transition">
            回到登入頁面
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-800">
      <aside className="w-64 flex-shrink-0 bg-white border-r border-slate-200 flex flex-col justify-between">
        <div>
          <Link href="/" className="p-6 flex items-center gap-2 font-bold text-xl text-blue-600 border-b border-slate-100 hover:opacity-80 transition">
            <Compass size={28} />
            <span>AITravel</span>
          </Link>
          <nav className="p-4 space-y-2">
            <button className="flex items-center gap-3 w-full px-4 py-3 bg-blue-50 text-blue-600 rounded-xl font-medium transition">
              <Map size={20} /> 我的旅程
            </button>
            <button className="flex items-center gap-3 w-full px-4 py-3 text-slate-600 hover:bg-slate-50 hover:text-blue-600 rounded-xl font-medium transition">
              <Calendar size={20} /> 旅遊紀錄
            </button>
            <button className="flex items-center gap-3 w-full px-4 py-3 text-slate-600 hover:bg-slate-50 hover:text-blue-600 rounded-xl font-medium transition">
              <Heart size={20} /> 收藏清單
            </button>
          </nav>
        </div>
      </aside>

      <main className="flex-1 p-6 lg:p-10 overflow-y-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800">歡迎回來，{user.name}</h1>
          <p className="text-slate-500 mt-1">這裡顯示你的旅遊統計、收藏與近期行程。</p>
        </header>

        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between mb-10">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-full border-4 border-white bg-blue-100 flex items-center justify-center shadow-lg overflow-hidden">
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-3xl font-black text-blue-600">{user.name.charAt(0)}</span>
              )}
            </div>
            <div>
              <p className="text-3xl font-bold text-slate-900">{user.name}</p>
              <p className="text-sm font-semibold text-blue-700 bg-blue-100 px-4 py-1.5 rounded-full inline-block mt-2 shadow-sm">
                旅人會員
              </p>
            </div>
          </div>
          <Link href="/" className="inline-flex items-center justify-center rounded-3xl bg-blue-600 px-5 py-3 text-sm font-bold text-white hover:bg-blue-700 transition">
            回到首頁
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-sky-100 flex items-center justify-center text-sky-600">
              <Map size={28} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">參與的行程</p>
              <p className="text-2xl font-bold">
                {loadingData ? "..." : stats.participatedTrips}
                <span className="text-sm text-slate-400 font-normal"> 個</span>
              </p>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-teal-100 flex items-center justify-center text-teal-600">
              <Heart size={28} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">進行中的行程</p>
              <p className="text-2xl font-bold">
                {loadingData ? "..." : stats.activeTrips}
                <span className="text-sm text-slate-400 font-normal"> 個</span>
              </p>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-rose-100 flex items-center justify-center text-rose-600">
              <Star size={28} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">平均給予評分</p>
              <p className="text-2xl font-bold">
                {loadingData ? "..." : (stats.averageGivenRating ? `${stats.averageGivenRating} / 5` : "尚未評分")}
              </p>
            </div>
          </motion.div>
        </div>

        <section className="mb-10">
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <Search size={22} className="text-blue-600" /> 搜尋規劃師
                </h2>
                <p className="text-sm text-slate-500">以旅人身份快速找到想要合作的規劃師。</p>
              </div>
              <form onSubmit={handlePlannerSearch} className="flex gap-3 flex-1 sm:max-w-xl">
                <label htmlFor="plannerSearch" className="sr-only">搜尋規劃師</label>
                <input
                  id="plannerSearch"
                  value={plannerQuery}
                  onChange={(event) => setPlannerQuery(event.target.value)}
                  placeholder="輸入規劃師名稱或關鍵字"
                  className="flex-1 border border-slate-300 rounded-3xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 rounded-3xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition"
                >
                  搜尋
                </button>
              </form>
            </div>

            <div className="space-y-4">
              {plannerLoading ? (
                <div className="text-slate-500">搜尋中...</div>
              ) : plannerResults.length === 0 ? (
                <div className="rounded-3xl bg-slate-50 border border-dashed border-slate-200 p-6 text-slate-500">
                  目前尚未找到規劃師。請嘗試其他關鍵字。
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {plannerResults.map((planner) => (
                    <Link
                      key={planner.id}
                      href={`/planner/${planner.id}`}
                      className="block rounded-3xl border border-slate-200 p-5 hover:border-blue-400 hover:bg-blue-50 transition"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center overflow-hidden text-xl font-bold text-slate-700">
                          {planner.avatarUrl ? (
                            <img src={planner.avatarUrl} alt={planner.name} className="w-full h-full object-cover" />
                          ) : (
                            planner.name.charAt(0)
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-slate-900">{planner.name}</h3>
                          <p className="text-sm text-slate-500">公開行程 {planner.publishedTripCount} 筆</p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-xl font-bold flex items-center gap-2"><Map size={24} className="text-blue-600" /> 我的地圖視圖</h2>
              <button className="text-sm text-blue-600 font-medium hover:underline">查看完整地圖</button>
            </div>
            <div className="flex-1 bg-slate-200 min-h-[300px] relative flex items-center justify-center">
              <div className="text-center text-slate-500">
                <MapPin size={48} className="mx-auto mb-2 text-slate-400 opacity-50" />
                <p>這裡會顯示你旅程的景點位置與路線。</p>
                <p className="text-sm">可擴充為實際地圖檢視，搭配景點與交通安排。</p>
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }} className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2"><Calendar size={24} className="text-teal-600" /> 近期旅程</h2>
              <button className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition">+</button>
            </div>
            <div className="space-y-4">
              {loadingData ? (
                <div className="space-y-3">
                  <div className="h-16 rounded-2xl bg-slate-100 animate-pulse" />
                  <div className="h-16 rounded-2xl bg-slate-100 animate-pulse" />
                </div>
              ) : participations.length === 0 ? (
                <div className="text-center text-slate-500 py-8">
                  <Map size={32} className="mx-auto mb-2 text-slate-400" />
                  <p>還沒有參與任何行程</p>
                  <p className="text-sm">瀏覽並加入你喜歡的行程吧！</p>
                </div>
              ) : (
                participations.map((participation) => (
                  <div key={participation.id} className="group flex items-center gap-4 p-3 rounded-2xl hover:bg-slate-50 cursor-pointer transition">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold ${
                      participation.status === 'active' ? 'bg-blue-100 text-blue-600' :
                      participation.status === 'completed' ? 'bg-green-100 text-green-600' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {participation.trip.title.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-slate-800 group-hover:text-blue-600 transition">
                        {participation.trip.title}
                      </h3>
                      <div className="flex gap-2 text-xs font-medium mt-1">
                        <span className="text-slate-500">
                          {new Date(participation.joinedAt).toLocaleDateString()}
                        </span>
                        <span className={
                          participation.status === 'completed' ? 'text-emerald-500' :
                          participation.status === 'active' ? 'text-blue-500' :
                          'text-slate-400'
                        }>
                          {participation.status === 'active' ? '進行中' :
                           participation.status === 'completed' ? '已完成' :
                           '已取消'}
                        </span>
                      </div>
                    </div>
                    <ChevronRight size={18} className="text-slate-300 group-hover:text-blue-600 transition" />
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



