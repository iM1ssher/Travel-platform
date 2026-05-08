// 前端 - 旅行者儀表板頁面：顯示旅行者的個人資料與旅程概覽

"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Map, Plane, MapPin, Calendar, Heart, Compass, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/app/providers";

type FavoriteTrip = {
  id: number;
  title: string;
  date: string;
  status: string;
  imageClasses: string;
};

const userStats = {
  totalDistance: 12450,
  visitedCities: 15,
  savedTrips: 8,
};

const tripHistory: FavoriteTrip[] = [
  { id: 1, title: "東京美食深度遊", date: "2026-06-15", status: "已完成", imageClasses: "bg-blue-100 text-blue-600" },
  { id: 2, title: "京都賞櫻規劃", date: "2025-12-10", status: "進行中", imageClasses: "bg-gray-100 text-gray-600" },
  { id: 3, title: "大阪夜市巡禮", date: "2025-01-05", status: "已完成", imageClasses: "bg-gray-100 text-gray-600" },
];

export default function TravelerDashboard() {
  const { user, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    document.title = user ? `${user.name} 的旅行者儀表板` : "旅行者儀表板";
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
              <Plane size={28} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">累積旅程距離</p>
              <p className="text-2xl font-bold">{userStats.totalDistance.toLocaleString()} <span className="text-sm text-slate-400 font-normal">km</span></p>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-teal-100 flex items-center justify-center text-teal-600">
              <MapPin size={28} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">拜訪城市數</p>
              <p className="text-2xl font-bold">{userStats.visitedCities} <span className="text-sm text-slate-400 font-normal">座</span></p>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-rose-100 flex items-center justify-center text-rose-600">
              <Heart size={28} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">收藏行程</p>
              <p className="text-2xl font-bold">{userStats.savedTrips} <span className="text-sm text-slate-400 font-normal">個</span></p>
            </div>
          </motion.div>
        </div>

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
              {tripHistory.map((trip) => (
                <div key={trip.id} className="group flex items-center gap-4 p-3 rounded-2xl hover:bg-slate-50 cursor-pointer transition">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold ${trip.imageClasses}`}>
                    {trip.title.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-slate-800 group-hover:text-blue-600 transition">{trip.title}</h3>
                    <div className="flex gap-2 text-xs font-medium mt-1">
                      <span className="text-slate-500">{trip.date}</span>
                      <span className={trip.status === "已完成" ? "text-emerald-500" : "text-slate-400"}>{trip.status}</span>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-slate-300 group-hover:text-blue-600 transition" />
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}



