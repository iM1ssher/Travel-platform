"use client";
import React from "react";
import { motion } from "framer-motion";
import {
  ShieldCheck, Users, Database as DbIcon, Activity,
  DollarSign, AlertTriangle, Settings
} from "lucide-react";
import Link from "next/link";

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-slate-900 flex font-sans text-slate-100">

      {/* 管理員側邊欄 */}
      <aside className="w-64 flex-shrink-0 bg-slate-950 border-r border-slate-800 flex flex-col justify-between">
        <div>
          {/* 品牌標題和導航 */}
          <Link href="/" className="p-6 flex items-center gap-2 font-bold text-xl text-red-500 border-b border-slate-800 hover:bg-slate-800 transition-colors">
            <ShieldCheck size={28} />
            <span>管理員面板</span>
          </Link>
          <nav className="p-4 space-y-2 text-slate-400">
            <button className="flex items-center gap-3 w-full px-4 py-3 bg-slate-800 text-white rounded-xl font-medium transition">
              <Activity size={20} /> 系統概況
            </button>
            <button className="flex items-center gap-3 w-full px-4 py-3 hover:bg-slate-800 hover:text-white rounded-xl font-medium transition">
              <Users size={20} /> 用戶管理
            </button>
            <button className="flex items-center gap-3 w-full px-4 py-3 hover:bg-slate-800 hover:text-white rounded-xl font-medium transition">
              <DollarSign size={20} /> API 用量統計
            </button>
          </nav>
        </div>
        {/* 底部設定和登出 */}
      </aside>

      {/* 主內容區域 */}
      <main className="flex-1 p-10 overflow-y-auto">
        <header className="mb-10">
          <h1 className="text-3xl font-bold">管理員儀表板</h1>
          <p className="text-slate-400 mt-1">監控系統運行狀態和 API 使用情況</p>
        </header>

        {/* 統計卡片區域 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-slate-800 p-6 rounded-3xl border border-slate-700">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-red-500/10 rounded-2xl text-red-500"><AlertTriangle size={24} /></div>
              <span className="text-xs font-bold text-slate-500">API 用量監控</span>
            </div>
            <p className="text-sm font-medium text-slate-400">Google Maps API 費用</p>
            <p className="text-2xl font-bold font-mono">$185.20 <span className="text-sm font-normal text-slate-500">/ $200</span></p>
          </div>

          <div className="bg-slate-800 p-6 rounded-3xl border border-slate-700">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-500"><Users size={24} /></div>
              <span className="text-xs font-bold text-slate-500">活躍用戶數</span>
            </div>
            <p className="text-sm font-medium text-slate-400">本月註冊用戶</p>
            <p className="text-2xl font-bold font-mono">1,248 <span className="text-sm font-normal text-slate-500">Users</span></p>
          </div>

          <div className="bg-slate-800 p-6 rounded-3xl border border-slate-700">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-teal-500/10 rounded-2xl text-teal-500"><Activity size={24} /></div>
              <span className="text-xs font-bold text-slate-500">AI 回應時間</span>
            </div>
            <p className="text-sm font-medium text-slate-400">平均 Gemini API 延遲</p>
            <p className="text-2xl font-bold font-mono">1.2 <span className="text-sm font-normal text-slate-500">sec</span></p>
          </div>
        </div>
      </main>
    </div>
  );
}



