// 旅行規劃師儀表板 - 顯示使用者資訊與真實草稿
"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Compass,
  BarChart2,
  Users,
  Star,
  FileText,
  Edit3,
  PlusCircle,
  ThumbsUp,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/app/providers";

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

type PlannerStats = {
  totalTrips: number;
  publishedTrips: number;
  draftTrips: number;
  averageRating: number | null;
  totalReviews: number;
};

const defaultStats: PlannerStats = {
  totalTrips: 0,
  publishedTrips: 0,
  draftTrips: 0,
  averageRating: null,
  totalReviews: 0,
};

export default function PlannerDashboard() {
  const { user, loading: authLoading } = useAuth();
  const [drafts, setDrafts] = useState<DraftTrip[]>([]);
  const [publishedTrips, setPublishedTrips] = useState<PlannerTrip[]>([]);
  const [loadingDrafts, setLoadingDrafts] = useState(true);
  const [loadingPublishedTrips, setLoadingPublishedTrips] = useState(true);
  const [stats, setStats] = useState<PlannerStats>(defaultStats);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      // Fetch drafts and published trips
      setLoadingDrafts(true);
      setLoadingPublishedTrips(true);
      try {
        const res = await fetch("/api/trips/drafts", { cache: "no-store" });
        if (!res.ok) {
          setDrafts([]);
          setPublishedTrips([]);
        } else {
          const data = await res.json();
          setDrafts(data.drafts ?? []);
          setPublishedTrips(data.publishedTrips ?? []);
        }
      } catch {
        setDrafts([]);
        setPublishedTrips([]);
      } finally {
        setLoadingDrafts(false);
        setLoadingPublishedTrips(false);
      }

      // Fetch stats
      setLoadingStats(true);
      try {
        const res = await fetch(`/api/users/${user.id}/stats`, { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch {
        setStats(defaultStats);
      } finally {
        setLoadingStats(false);
      }
    };

    fetchData();
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

          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-end">
            <div className="flex items-center gap-4 rounded-3xl bg-white border border-slate-200 px-5 py-4 shadow-sm">
              <div className="h-16 w-16 rounded-full overflow-hidden bg-slate-100 flex items-center justify-center text-slate-500">
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user.name} className="h-full w-full object-cover" />
                ) : (
                  <span className="text-xl font-bold">{user.name.charAt(0)}</span>
                )}
              </div>
              <div>
                <p className="text-lg font-bold text-slate-900">{user.name}</p>
                <p className="text-sm text-slate-500">{user.role === "planner" ? "認證規劃師" : user.role}</p>
              </div>
            </div>

            <Link href="/editor" className="inline-flex items-center gap-2 bg-teal-600 text-white px-5 py-3 rounded-full font-medium hover:bg-teal-700 transition shadow-sm">
              <PlusCircle size={20} /> 建立新草稿
            </Link>
          </div>
        </header>

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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2"><FileText size={24} className="text-teal-600" /> 草稿行程</h2>
              <Link href="/editor" className="text-sm text-teal-600 font-medium hover:underline">建立新草稿</Link>
            </div>
            <div className="space-y-4">
              {loadingDrafts ? (
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
                  <Link
                    key={draft.id}
                    href={`/editor?draftId=${draft.id}`}
                    className="group block rounded-3xl border border-slate-100 bg-slate-50 p-5 hover:border-teal-300 hover:bg-white transition"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <h3 className="text-lg font-semibold text-slate-900">{draft.title || "未命名草稿"}</h3>
                      <span className="text-xs text-slate-500">更新於 {new Date(draft.updatedAt).toLocaleString()}</span>
                    </div>
                    <p className="mt-3 text-sm text-slate-500">點擊繼續編輯並發布你的規劃。</p>
                  </Link>
                ))
              )}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35 }} className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2"><Users size={24} className="text-slate-600" /> 已發布行程</h2>
              <Link href="/planner/dashboard" className="text-sm text-teal-600 font-medium hover:underline">管理已發布</Link>
            </div>
            <div className="space-y-4">
              {loadingPublishedTrips ? (
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
                  <Link
                    key={trip.id}
                    href={`/trip/${trip.id}`}
                    className="group block rounded-3xl border border-slate-100 bg-slate-50 p-5 hover:border-teal-300 hover:bg-white transition"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <h3 className="text-lg font-semibold text-slate-900">{trip.title || "未命名行程"}</h3>
                      <span className="text-xs text-slate-500">更新於 {new Date(trip.updatedAt).toLocaleString()}</span>
                    </div>
                    <div className="mt-3 flex items-center gap-3 text-sm text-slate-500">
                      <span>評分：{trip.averageRating !== null ? `${trip.averageRating.toFixed(1)} / 5` : "尚未評分"}</span>
                      <span>{trip.reviewCount} 則評論</span>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }} className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2"><Edit3 size={24} className="text-amber-500" /> 快速操作</h2>
            </div>
            <div className="space-y-4">
              <Link href="/editor" className="block rounded-3xl bg-teal-600 px-5 py-4 text-white font-semibold text-center hover:bg-teal-700 transition">
                建立新行程草稿
              </Link>
              <Link href="/planner/dashboard" className="block rounded-3xl border border-slate-200 px-5 py-4 text-slate-700 font-semibold text-center hover:bg-slate-50 transition">
                查看全部草稿
              </Link>
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                <p className="font-semibold text-slate-900">小提醒</p>
                <p className="mt-2">草稿會自動儲存在你的帳號中，隨時回來繼續編輯或發布。</p>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}



