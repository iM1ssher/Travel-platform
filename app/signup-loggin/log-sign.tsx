// 前端 - 登入/註冊頁面組件：處理使用者認證、角色選擇和表單提交

"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Info, Lock, Mail, MapPinned, ShieldCheck } from "lucide-react";
import { useAuth } from "@/app/providers";

type UserRole = "traveler" | "planner" | "admin";

type AuthMode = "login" | "register";

const ROLE_OPTIONS: Array<{ value: UserRole; label: string; description: string }> = [
  { value: "traveler", label: "旅人", description: "尋找行程推薦、收藏行程與瀏覽旅遊方案" },
  { value: "planner", label: "規劃師", description: "建立行程、編輯景點與管理旅遊方案" },
  { value: "admin", label: "管理員", description: "系統後台管理與使用者權限控管" },
];

export default function LogSignPage() {
  const router = useRouter();
  const { setUser } = useAuth();
  const [mode, setMode] = useState<AuthMode>("login");
  const [role, setRole] = useState<UserRole>("traveler");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password.trim()) {
      setError("請輸入 Email 與密碼，密碼至少 6 個字元。 ");
      return;
    }

    if (mode === "register" && !name.trim()) {
      setError("請填寫名稱，以完成註冊。 ");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role, email, password, name }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result?.message || "發生錯誤，請稍後再試。");
        return;
      }

      const loggedUser = result?.user;
      if (loggedUser) {
        setUser({
          email: loggedUser.email,
          name: loggedUser.name,
          role: loggedUser.role,
          avatarUrl: loggedUser.avatarUrl ?? null,
        });
      }

      const destination = role === "admin" ? "/admin/dashboard" : `/${role}/dashboard`;
      router.push(destination);
    } catch (err) {
      setError("網路連線異常，請稍後重試。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col px-6 sm:px-10 lg:px-16 py-6">
      <header className="flex items-center justify-between mb-8">
        <Link href="/" className="flex items-center gap-3 text-slate-900">
          <div className="p-3 rounded-3xl bg-blue-600 text-white shadow-sm shadow-blue-500/20">
            <MapPinned className="w-8 h-8" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">登入入口</p>
            <h1 className="text-2xl font-black">AITravel</h1>
          </div>
        </Link>
        <Link href="/" className="text-sm font-semibold text-slate-500 hover:text-slate-900">
          關閉
        </Link>
      </header>

      <main className="flex flex-1 items-center justify-center">
        <div className="w-full max-w-4xl rounded-[2rem] border border-slate-200 bg-white shadow-2xl shadow-slate-200/60 overflow-hidden">
          <div className="grid gap-6 lg:grid-cols-[1fr_1.3fr]">
            <div className="bg-slate-950 p-10 text-white flex flex-col justify-between">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full bg-blue-500/10 px-3 py-1 text-xs uppercase tracking-[0.25em] text-blue-300 font-bold">
                  <ShieldCheck className="w-4 h-4" /> 安全驗證
                </span>
                <h2 className="mt-8 text-4xl font-black leading-tight">登入 / 註冊</h2>
                <p className="mt-4 text-sm leading-relaxed text-slate-300">
                  本系統採用 httpOnly cookie 與 session 管理安全登入，保護使用者資料與帳號安全。
                </p>
              </div>

              <div className="space-y-4 rounded-3xl bg-slate-900/70 p-5">
                <div className="flex items-center gap-3 text-slate-300">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-800">
                    <Info className="w-5 h-5 text-slate-300" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold">安全登入</p>
                    <p className="text-xs text-slate-400">採用安全驗證機制，保護您的帳號與個人資料。</p>
                  </div>
                </div>
                <p className="text-sm text-slate-300">
                  使用 session 與 cookie 進行身份管理，確保登入狀態穩定且資料傳輸安全。
                </p>
              </div>
            </div>

            <div className="p-8 sm:p-10">
              <div className="flex items-center justify-between gap-4 mb-8">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-blue-600 font-bold">帳戶管理</p>
                  <h3 className="mt-3 text-3xl font-bold text-slate-900">{mode === "login" ? "登入 AITravel" : "註冊新帳號"}</h3>
                </div>
                <div className="flex gap-2 rounded-full bg-slate-100 p-1">
                  <button
                    type="button"
                    onClick={() => { setMode("login"); setError(""); }}
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition ${mode === "login" ? "bg-white text-slate-950 shadow-md" : "text-slate-500 hover:text-slate-700"}`}
                  >
                    Log In
                  </button>
                  <button
                    type="button"
                    onClick={() => { setMode("register"); setError(""); }}
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition ${mode === "register" ? "bg-white text-slate-950 shadow-md" : "text-slate-500 hover:text-slate-700"}`}
                  >
                    Sign Up
                  </button>
                </div>
              </div>

              <div className="rounded-[2rem] border border-slate-200 bg-slate-50 p-6 space-y-6">
                <div>
                  <p className="text-sm font-semibold text-slate-700 mb-4">選擇身份</p>
                  <div className="grid gap-3 sm:grid-cols-3">
                    {ROLE_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setRole(option.value)}
                        className={`rounded-3xl border-2 p-4 text-left transition-all cursor-pointer ${
                          role === option.value
                            ? "border-blue-600 bg-blue-50 shadow-lg ring-2 ring-blue-200"
                            : "border-slate-200 bg-white hover:border-blue-400 hover:bg-slate-50 active:bg-blue-50"
                        }`}
                      >
                        <p className="text-sm font-bold text-slate-900">{option.label}</p>
                        <p className="mt-2 text-xs text-slate-500">{option.description}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {mode === "register" && (
                    <label className="block text-sm font-semibold text-slate-700">
                      名稱
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="輸入你的暱稱"
                        className="mt-2 w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      />
                    </label>
                  )}

                  <label className="block text-sm font-semibold text-slate-700">
                    Email
                    <div className="mt-2 relative">
                      <Mail className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="example@test.com"
                        className="w-full rounded-3xl border border-slate-300 bg-white px-12 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      />
                    </div>
                  </label>

                  <label className="block text-sm font-semibold text-slate-700">
                    密碼
                    <div className="mt-2 relative">
                      <Lock className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="請輸入 6 個以上字元"
                        className="w-full rounded-3xl border border-slate-300 bg-white px-12 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      />
                    </div>
                  </label>

                  {error && (
                    <div className="rounded-3xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-3xl bg-blue-600 px-6 py-3 text-base font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {loading ? "處理中..." : mode === "login" ? "登入並開始旅程" : "註冊新帳號"}
                  </button>

                  <p className="text-center text-xs text-slate-500">
                    登入後可建立行程、管理收藏與 AI 規劃功能。
                  </p>
                </form>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}





