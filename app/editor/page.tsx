// 前端 - 行程編輯器頁面：提供規劃師建立與發布行程
"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Compass,
  Map,
  Save,
  Send,
  Sparkles,
  AlignLeft,
  ImagePlus,
  CheckCircle,
  AlertTriangle,
  FileText,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/app/providers";

const parsedItinerary = [
  { id: 1, time: "09:00", type: "attraction", name: "淺草寺散步", note: "漫步仲見世商店街，品嚐日式小點" },
  { id: 2, time: "11:30", type: "transport", name: "搭乘地鐵前往上野", note: "約 30 分鐘，轉乘日比谷線" },
  { id: 3, time: "12:00", type: "restaurant", name: "築地壽司店（人氣推薦）", note: "品嚐新鮮海鮮握壽司，預算約 ¥1500" },
];

type DraftEntry = {
  id: number;
  title: string;
  updatedAt: string;
  isPublished: boolean;
};

type TripMutationResponse = {
  id?: number;
  trip?: {
    id?: number;
  };
  message?: string;
  error?: string;
};

export default function SmartEditor() {
  const router = useRouter();

  const { user, loading: authLoading } = useAuth();
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [statusType, setStatusType] = useState<"success" | "error" | "info">("info");
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [loadingDraft, setLoadingDraft] = useState(false);
  const [loadingMyDrafts, setLoadingMyDrafts] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [draftId, setDraftId] = useState<string | null>(null);
  const [myDrafts, setMyDrafts] = useState<DraftEntry[]>([]);

  const loadMyDrafts = useCallback(async () => {
    if (!user || user.role !== "planner") {
      setMyDrafts([]);
      return;
    }

    setLoadingMyDrafts(true);
    try {
      const res = await fetch("/api/trips/drafts", { cache: "no-store" });
      if (!res.ok) {
        setMyDrafts([]);
        return;
      }

      const data = await res.json();
      setMyDrafts((data.drafts ?? []) as DraftEntry[]);
    } catch {
      setMyDrafts([]);
    } finally {
      setLoadingMyDrafts(false);
    }
  }, [user]);

  useEffect(() => {
    const loadDraft = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const draftIdParam = urlParams.get("draftId");

      if (!draftIdParam) {
        setDraftId(null);
        return;
      }

      setLoadingDraft(true);
      try {
        const res = await fetch(`/api/trips/${draftIdParam}`);
        if (!res.ok) {
          setStatusType("error");
          setStatusMessage("無法讀取草稿，請確認該行程是否存在或是否有權限。請重新登入。");
          return;
        }

        const data = await res.json();
        setTitle(data.title ?? "");
        setSummary(data.summary ?? "");
        setCoverImage(data.coverImage ?? "");
        setDraftId(draftIdParam);
      } catch (error) {
        console.error(error);
        setStatusType("error");
        setStatusMessage("讀取草稿失敗，請稍後再試。");
      } finally {
        setLoadingDraft(false);
      }
    };

    void loadDraft();
  }, []);

  useEffect(() => {
    const loadDrafts = async () => {
      await loadMyDrafts();
    };

    void loadDrafts();
  }, [loadMyDrafts]);

  const handleAIGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
    }, 1500);
  };

  const updateStatus = (message: string, type: "success" | "error" | "info") => {
    setStatusMessage(message);
    setStatusType(type);
  };

  const saveDraft = async () => {
    if (!user) {
      updateStatus("請先登入規劃師帳號再建立草稿。", "error");
      return;
    }

    if (user.role !== "planner") {
      updateStatus("只有規劃師可以建立或編輯行程。", "error");
      return;
    }

    if (!title.trim()) {
      updateStatus("請輸入行程標題。", "error");
      return;
    }

    setSaving(true);
    setStatusMessage("");
    try {
      const payload = {
        title: title.trim(),
        summary: summary.trim(),
        coverImage: coverImage.trim() || null,
      };

      let res: Response;
      let result: TripMutationResponse;

      if (draftId) {
        res = await fetch(`/api/trips/${draftId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        result = await res.json();
      } else {
        res = await fetch("/api/trips", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        result = await res.json();
      }

      if (!res.ok) {
        updateStatus(result?.message || result?.error || "儲存草稿失敗。", "error");
        return;
      }

      const trip = result.trip ?? result;
      if (!draftId && trip?.id) {
        setDraftId(String(trip.id));
        router.replace(`/editor?draftId=${trip.id}`);
      }

      updateStatus("草稿已儲存。您可以繼續編輯或直接發布。", "success");
      await loadMyDrafts();
    } catch (error) {
      console.error(error);
      updateStatus("儲存草稿時發生錯誤。", "error");
    } finally {
      setSaving(false);
    }
  };

  const publishTrip = async () => {
    if (!user) {
      updateStatus("請先登入規劃師帳號再發布行程。", "error");
      return;
    }

    if (user.role !== "planner") {
      updateStatus("只有規劃師可以發布行程。", "error");
      return;
    }

    if (!title.trim()) {
      updateStatus("請輸入行程標題。", "error");
      return;
    }

    setPublishing(true);
    setStatusMessage("");

    try {
      let tripIdToPublish = draftId;
      if (!tripIdToPublish) {
        const createRes = await fetch("/api/trips", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: title.trim(),
            summary: summary.trim(),
            coverImage: coverImage.trim() || null,
          }),
        });

        if (!createRes.ok) {
          const errorData = await createRes.json();
          updateStatus(errorData?.message || errorData?.error || "建立草稿失敗，無法發布。", "error");
          return;
        }

        const created = await createRes.json();
        tripIdToPublish = String(created.trip.id);
        setDraftId(tripIdToPublish);
        router.replace(`/editor?draftId=${tripIdToPublish}`);
      }

      const publishRes = await fetch(`/api/trips/${tripIdToPublish}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          summary: summary.trim(),
          coverImage: coverImage.trim() || null,
          publish: true,
        }),
      });

      if (!publishRes.ok) {
        const errorData = await publishRes.json();
        updateStatus(errorData?.message || errorData?.error || "發布行程失敗。", "error");
        return;
      }

      const publishResult = await publishRes.json();
      const publishedTrip = publishResult.trip ?? publishResult;
      updateStatus("行程已發布！", "success");
      await loadMyDrafts();
      router.push(`/trip/${publishedTrip.id}`);
    } catch (error) {
      console.error(error);
      updateStatus("發布行程時發生錯誤。", "error");
    } finally {
      setPublishing(false);
    }
  };

  if (authLoading || loadingDraft) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500">載入中...</div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-800 overflow-hidden">
      <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-6 shadow-sm">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2 font-bold text-blue-600 hover:opacity-80 transition">
            <Compass size={24} />
            <span>AITravel</span>
          </Link>
          <Link href="/planner/dashboard" className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900">
            <ArrowLeft size={18} /> 返回規劃師儀表板
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={saveDraft}
            disabled={saving || publishing}
            className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800 transition disabled:opacity-60"
          >
            <Save size={16} /> {draftId ? "儲存草稿" : "建立草稿"}
          </button>
          <button
            onClick={publishTrip}
            disabled={saving || publishing}
            className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-700 transition disabled:opacity-60"
          >
            <Send size={16} /> {draftId ? "發布行程" : "儲存並發布"}
          </button>
        </div>
      </header>

      <main className="flex-1 lg:flex lg:space-x-6 p-4 lg:p-6">
        <section className="lg:w-2/3 bg-white rounded-3xl shadow-sm border border-slate-200 p-6 space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">建立你的行程</h1>
            <p className="text-slate-500 mt-2">請填寫標題、摘要與封面圖片 URL，然後儲存草稿或直接發布。</p>
          </div>

          <div className="grid gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">行程標題</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="例如：夏日大阪美食與夜景之旅"
                className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">行程摘要</label>
              <textarea
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                rows={6}
                placeholder="用一句話說明這篇行程，例如：深度大阪美食掃街、夜晚賞心斎橋璀璨燈海。"
                className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">封面圖片 URL</label>
              <div className="relative">
                <input
                  value={coverImage}
                  onChange={(e) => setCoverImage(e.target.value)}
                  placeholder="https://..."
                  className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 pr-32 text-slate-900 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 flex items-center gap-2 text-sm">
                  <ImagePlus size={16} /> 封面圖片
                </span>
              </div>
            </div>

            {coverImage.trim() && (
              <div className="rounded-3xl border border-slate-200 overflow-hidden bg-slate-100">
                <img src={coverImage} alt="封面預覽" className="w-full object-cover" style={{ minHeight: 220 }} />
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={handleAIGenerate}
              disabled={isGenerating}
              className="inline-flex items-center justify-center gap-2 rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4 text-slate-700 hover:border-teal-300 hover:text-teal-600 transition"
            >
              <Sparkles size={18} /> {isGenerating ? "生成中..." : "生成 AI 行程建議"}
            </button>
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <h2 className="text-sm font-semibold text-slate-700 mb-2">目前狀態</h2>
              <p className="text-sm text-slate-500">{draftId ? `草稿 ID：${draftId}` : "尚未建立草稿"}</p>
            </div>
          </div>

          {statusMessage && (
            <div className={`rounded-3xl px-4 py-3 text-sm ${statusType === "success" ? "bg-emerald-50 text-emerald-700" : statusType === "error" ? "bg-rose-50 text-rose-700" : "bg-slate-50 text-slate-700"}`}>
              <div className="flex items-center gap-2">
                {statusType === "success" ? <CheckCircle size={18} /> : statusType === "error" ? <AlertTriangle size={18} /> : <Sparkles size={18} />}
                <span>{statusMessage}</span>
              </div>
            </div>
          )}

          {!user && (
            <div className="rounded-3xl border border-amber-200 bg-amber-50 p-4 text-slate-700">
              <p className="font-semibold">未登入</p>
              <p className="text-sm">請先登入規劃師帳號，才能建立與發布行程。</p>
              <Link href="/signup-loggin/log-sign" className="mt-3 inline-flex rounded-full bg-amber-500 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-600 transition">前往登入</Link>
            </div>
          )}

          {user && user.role !== "planner" && (
            <div className="rounded-3xl border border-rose-200 bg-rose-50 p-4 text-slate-700">
              <p className="font-semibold">權限不足</p>
              <p className="text-sm">目前登入帳號不是規劃師，無法建立或發布行程。</p>
            </div>
          )}
        </section>

        <aside className="lg:w-1/3 mt-6 lg:mt-0 space-y-6">
          <section className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <Map size={24} className="text-teal-500" />
              <div>
                <h2 className="text-lg font-bold text-slate-900">示意行程</h2>
                <p className="text-sm text-slate-500">這裡顯示 AI 生成或你建立的行程內容。</p>
              </div>
            </div>
            <div className="space-y-3">
              {parsedItinerary.map((item) => (
                <div key={item.id} className="rounded-3xl border border-slate-100 bg-slate-50 p-4">
                  <div className="flex items-center justify-between text-sm text-slate-600 mb-2">
                    <span>{item.time}</span>
                    <span>{item.type === "restaurant" ? "餐飲" : item.type === "transport" ? "交通" : "景點"}</span>
                  </div>
                  <p className="font-semibold text-slate-800">{item.name}</p>
                  <p className="text-sm text-slate-500 mt-2">{item.note}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <FileText size={24} className="text-slate-500" />
              <div>
                <h2 className="text-lg font-bold text-slate-900">我的草稿</h2>
                <p className="text-sm text-slate-500">快速查看與切換你尚未發布的草稿。</p>
              </div>
            </div>
            <div className="space-y-3">
              {loadingMyDrafts ? (
                <div className="space-y-3">
                  <div className="h-16 rounded-3xl bg-slate-100 animate-pulse" />
                  <div className="h-16 rounded-3xl bg-slate-100 animate-pulse" />
                </div>
              ) : myDrafts.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-4 text-center text-slate-500">
                  尚未有草稿，儲存後會出現在這裡。
                </div>
              ) : (
                myDrafts.map((draft) => (
                  <Link
                    key={draft.id}
                    href={`/editor?draftId=${draft.id}`}
                    className={`block rounded-3xl border px-4 py-3 transition ${draftId === String(draft.id) ? "border-teal-500 bg-teal-50" : "border-slate-100 bg-slate-50 hover:border-teal-300 hover:bg-white"}`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-slate-900">{draft.title || "未命名草稿"}</p>
                      <span className="text-xs text-slate-500">{new Date(draft.updatedAt).toLocaleDateString()}</span>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </section>

          <section className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <AlignLeft size={24} className="text-slate-500" />
              <div>
                <h2 className="text-lg font-bold text-slate-900">小提醒</h2>
                <p className="text-sm text-slate-500">封面圖片請使用可公開存取的 URL。若沒有圖片也可以先存成草稿再補上。</p>
              </div>
            </div>
            <ul className="space-y-3 text-sm text-slate-600">
              <li>1. 行程標題與摘要為必填。</li>
              <li>2. 未發布的行程會保留為草稿。</li>
              <li>3. 發布後旅人即可加入並評論。</li>
            </ul>
          </section>
        </aside>
      </main>
    </div>
  );
}
