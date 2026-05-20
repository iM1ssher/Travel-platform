"use client";

import { useState, type FormEvent } from "react";
import { Camera, CheckCircle2, Mail, UserRound } from "lucide-react";
import ImageUploader from "@/app/components/common/ImageUploader";
import type { UserSession } from "@/app/providers";

type AccentColor = "blue" | "teal";

type ProfilePanelProps = {
  user: UserSession;
  roleLabel: string;
  accentColor?: AccentColor;
  compact?: boolean;
  onUserUpdated: (user: UserSession) => void;
};

type ProfileResponse = {
  user?: UserSession;
  message?: string;
};

const accentClasses: Record<AccentColor, { badge: string; button: string; ring: string; icon: string }> = {
  blue: {
    badge: "bg-blue-50 text-blue-700",
    button: "bg-blue-600 hover:bg-blue-700 focus:ring-blue-100",
    ring: "ring-blue-100",
    icon: "text-blue-600",
  },
  teal: {
    badge: "bg-teal-50 text-teal-700",
    button: "bg-teal-600 hover:bg-teal-700 focus:ring-teal-100",
    ring: "ring-teal-100",
    icon: "text-teal-600",
  },
};

export function ProfilePanel({
  user,
  roleLabel,
  accentColor = "blue",
  compact = false,
  onUserUpdated,
}: ProfilePanelProps) {
  const [name, setName] = useState<string>(user.name);
  const [avatarUrl, setAvatarUrl] = useState<string>(user.avatarUrl ?? "");
  const [message, setMessage] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [saving, setSaving] = useState<boolean>(false);
  const classes = accentClasses[accentColor];
  const initial = (name || user.email).charAt(0).toUpperCase();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setMessage("");

    const trimmedName = name.trim();
    if (trimmedName.length < 2) {
      setError("顯示名稱至少需要 2 個字元。");
      return;
    }

    setSaving(true);
    try {
      const response = await fetch("/api/users/me/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: trimmedName,
          avatarUrl: avatarUrl.trim(),
        }),
      });

      const data = (await response.json()) as ProfileResponse;
      if (!response.ok || !data.user) {
        setError(data.message ?? "更新失敗，請稍後再試。");
        return;
      }

      onUserUpdated(data.user);
      setMessage("個人資料已更新。");
    } catch {
      setError("網路連線異常，請稍後再試。");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className={`rounded-3xl border border-slate-200 bg-white shadow-sm ${compact ? "p-5" : "p-6"}`}>
      <div className="flex items-start gap-4">
        <div className={`flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-100 text-2xl font-black text-slate-700 ring-4 ${classes.ring}`}>
          {avatarUrl ? (
            <img src={avatarUrl} alt={name} className="h-full w-full object-cover" />
          ) : (
            <span>{initial}</span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-lg font-bold text-slate-900">{name}</p>
          <p className="mt-1 flex items-center gap-1.5 truncate text-sm text-slate-500">
            <Mail size={14} />
            {user.email}
          </p>
          <span className={`mt-3 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${classes.badge}`}>
            {roleLabel}
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        <label className="block text-sm font-semibold text-slate-700">
          顯示名稱
          <div className="relative mt-2">
            <UserRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
            />
          </div>
        </label>

        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
            <Camera size={16} className={classes.icon} />
            頭像
          </div>
          <ImageUploader onUploadSuccess={setAvatarUrl} buttonText="上傳新頭像" />
          {avatarUrl ? (
            <button
              type="button"
              onClick={() => setAvatarUrl("")}
              className="self-start text-sm font-semibold text-slate-500 transition hover:text-red-600"
            >
              移除頭像
            </button>
          ) : null}
        </div>

        {error ? <p className="rounded-2xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
        {message ? (
          <p className="flex items-center gap-2 rounded-2xl bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
            <CheckCircle2 size={16} />
            {message}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={saving}
          className={`w-full rounded-2xl px-4 py-2.5 text-sm font-bold text-white transition focus:outline-none focus:ring-4 disabled:cursor-not-allowed disabled:opacity-70 ${classes.button}`}
        >
          {saving ? "儲存中..." : "儲存個人資料"}
        </button>
      </form>
    </section>
  );
}
