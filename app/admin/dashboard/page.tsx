"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ShieldCheck, Users, Activity,
  MessageSquare, FileText, Trash2
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/app/providers";

type AdminStats = {
  totalUsers: number;
  totalTrips: number;
  publishedTrips: number;
  draftTrips: number;
  totalReviews: number;
};

type User = {
  id: number;
  email: string;
  name: string;
  role: string;
  createdAt: string;
  _count: {
    trips: number;
    participations: number;
    reviews: number;
  };
};

type Review = {
  id: number;
  rating: number;
  comment: string | null;
  createdAt: string;
  reviewer: {
    id: number;
    name: string;
    email: string;
  };
  trip: {
    id: number;
    title: string;
    author: {
      name: string;
    };
  };
};

export default function AdminDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalTrips: 0,
    publishedTrips: 0,
    draftTrips: 0,
    totalReviews: 0,
  });
  const [users, setUsers] = useState<User[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user || user.role !== 'admin') return;

      setLoading(true);
      try {
        // Fetch admin stats
        const statsRes = await fetch(`/api/users/${user.id}/stats`);
        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(statsData);
        }

        // Fetch users
        const usersRes = await fetch('/api/admin/users?page=1&limit=20');
        if (usersRes.ok) {
          const usersData = await usersRes.json();
          setUsers(usersData.users);
        }

        // Fetch reviews
        const reviewsRes = await fetch('/api/admin/reviews?page=1&limit=20');
        if (reviewsRes.ok) {
          const reviewsData = await reviewsRes.json();
          setReviews(reviewsData.reviews);
        }
      } catch (error) {
        console.error('Error fetching admin data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const handleDeleteReview = async (reviewId: number) => {
    if (!confirm('確定要刪除這則評論嗎？')) return;

    try {
      const res = await fetch(`/api/admin/reviews?reviewId=${reviewId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setReviews(reviews.filter(review => review.id !== reviewId));
      }
    } catch (error) {
      console.error('Error deleting review:', error);
    }
  };

  const handleUpdateUserRole = async (userId: number, newRole: string) => {
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, role: newRole }),
      });

      if (res.ok) {
        const updatedUser = await res.json();
        setUsers(users.map(user =>
          user.id === userId ? { ...user, role: updatedUser.role } : user
        ));
      }
    } catch (error) {
      console.error('Error updating user role:', error);
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (!confirm('確定要刪除這個用戶嗎？此操作無法復原。')) return;

    try {
      const res = await fetch(`/api/admin/users?userId=${userId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setUsers(users.filter(user => user.id !== userId));
      }
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

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
            <button
              onClick={() => setActiveTab("overview")}
              className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl font-medium transition ${
                activeTab === "overview" ? "bg-slate-800 text-white" : "hover:bg-slate-800 hover:text-white"
              }`}
            >
              <Activity size={20} /> 系統概況
            </button>
            <button
              onClick={() => setActiveTab("users")}
              className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl font-medium transition ${
                activeTab === "users" ? "bg-slate-800 text-white" : "hover:bg-slate-800 hover:text-white"
              }`}
            >
              <Users size={20} /> 用戶管理
            </button>
            <button
              onClick={() => setActiveTab("reviews")}
              className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl font-medium transition ${
                activeTab === "reviews" ? "bg-slate-800 text-white" : "hover:bg-slate-800 hover:text-white"
              }`}
            >
              <MessageSquare size={20} /> 評論管理
            </button>
          </nav>
        </div>
        {/* 底部設定和登出 */}
      </aside>

      {/* 主內容區域 */}
      <main className="flex-1 p-10 overflow-y-auto">
        <header className="mb-10">
          <h1 className="text-3xl font-bold">管理員儀表板</h1>
          <p className="text-slate-400 mt-1">
            {activeTab === "overview" && "監控系統運行狀態和統計數據"}
            {activeTab === "users" && "管理用戶帳號和權限"}
            {activeTab === "reviews" && "審核和管理用戶評論"}
          </p>
        </header>

        {activeTab === "overview" && (
          <>
            {/* 統計卡片區域 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-slate-800 p-6 rounded-3xl border border-slate-700">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-500"><Users size={24} /></div>
                  <span className="text-xs font-bold text-slate-500">總用戶數</span>
                </div>
                <p className="text-sm font-medium text-slate-400">註冊用戶</p>
                <p className="text-2xl font-bold font-mono">
                  {loading ? "..." : stats.totalUsers.toLocaleString()}
                </p>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-slate-800 p-6 rounded-3xl border border-slate-700">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-teal-500/10 rounded-2xl text-teal-500"><FileText size={24} /></div>
                  <span className="text-xs font-bold text-slate-500">行程統計</span>
                </div>
                <p className="text-sm font-medium text-slate-400">已發布 / 草稿</p>
                <p className="text-2xl font-bold font-mono">
                  {loading ? "..." : `${stats.publishedTrips} / ${stats.draftTrips}`}
                </p>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-slate-800 p-6 rounded-3xl border border-slate-700">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-amber-500/10 rounded-2xl text-amber-500"><MessageSquare size={24} /></div>
                  <span className="text-xs font-bold text-slate-500">評論總數</span>
                </div>
                <p className="text-sm font-medium text-slate-400">用戶評論</p>
                <p className="text-2xl font-bold font-mono">
                  {loading ? "..." : stats.totalReviews.toLocaleString()}
                </p>
              </motion.div>
            </div>
          </>
        )}

        {activeTab === "users" && (
          <div className="bg-slate-800 rounded-3xl border border-slate-700 overflow-hidden">
            <div className="p-6 border-b border-slate-700">
              <h2 className="text-xl font-bold">用戶管理</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-900">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">用戶</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">角色</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">統計</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">註冊時間</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-slate-400">載入中...</td>
                    </tr>
                  ) : users.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-slate-400">沒有用戶數據</td>
                    </tr>
                  ) : (
                    users.map((user) => (
                      <tr key={user.id} className="hover:bg-slate-700/50">
                        <td className="px-6 py-4">
                          <div>
                            <div className="font-medium text-white">{user.name}</div>
                            <div className="text-sm text-slate-400">{user.email}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <select
                            value={user.role}
                            onChange={(e) => handleUpdateUserRole(user.id, e.target.value)}
                            className="bg-slate-700 border border-slate-600 rounded px-2 py-1 text-sm"
                          >
                            <option value="traveler">Traveler</option>
                            <option value="planner">Planner</option>
                            <option value="admin">Admin</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-400">
                          <div>行程: {user._count.trips}</div>
                          <div>參與: {user._count.participations}</div>
                          <div>評論: {user._count.reviews}</div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-400">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            className="text-red-400 hover:text-red-300 p-1"
                            title="刪除用戶"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "reviews" && (
          <div className="space-y-6">
            {loading ? (
              <div className="text-center text-slate-400 py-8">載入中...</div>
            ) : reviews.length === 0 ? (
              <div className="text-center text-slate-400 py-8">沒有評論數據</div>
            ) : (
              reviews.map((review) => (
                <motion.div
                  key={review.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-slate-800 rounded-3xl border border-slate-700 p-6"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center">
                        <span className="text-sm font-bold text-slate-300">
                          {review.reviewer.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium text-white">{review.reviewer.name}</div>
                        <div className="text-sm text-slate-400">{review.reviewer.email}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <span
                            key={star}
                            className={`text-sm ${star <= review.rating ? 'text-amber-400' : 'text-slate-600'}`}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                      <button
                        onClick={() => handleDeleteReview(review.id)}
                        className="text-red-400 hover:text-red-300 p-1 ml-2"
                        title="刪除評論"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="mb-3">
                    <div className="text-sm text-slate-400 mb-1">
                      評論行程: <span className="text-slate-300">{review.trip.title}</span>
                      <span className="mx-2">•</span>
                      規劃師: {review.trip.author.name}
                    </div>
                    <div className="text-sm text-slate-500">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </div>
                  </div>

                  {review.comment && (
                    <p className="text-slate-300 leading-relaxed">{review.comment}</p>
                  )}
                </motion.div>
              ))
            )}
          </div>
        )}
      </main>
    </div>
  );
}



