"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Heart } from "lucide-react";
import { useAuth } from "@/app/providers";

type FavoriteToggleProps = {
  endpoint: string;
  activeLabel: string;
  inactiveLabel: string;
  initialIsFavorited?: boolean | null;
  variant?: "solid" | "ghost";
  className?: string;
  onChange?: (isFavorited: boolean) => void;
};

export function FavoriteToggle({
  endpoint,
  activeLabel,
  inactiveLabel,
  initialIsFavorited = null,
  variant = "solid",
  className = "",
  onChange,
}: FavoriteToggleProps) {
  const { user } = useAuth();
  const [isFavorited, setIsFavorited] = useState(initialIsFavorited ?? false);
  const [isLoading, setIsLoading] = useState(initialIsFavorited === null && user?.role === "traveler");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const loadStatus = async () => {
      if (!user || user.role !== "traveler" || initialIsFavorited !== null) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(endpoint, { cache: "no-store" });
        if (!response.ok) {
          setIsFavorited(false);
          return;
        }

        const data = await response.json();
        setIsFavorited(Boolean(data.isFavorited));
      } catch {
        setIsFavorited(false);
      } finally {
        setIsLoading(false);
      }
    };

    loadStatus();
  }, [endpoint, initialIsFavorited, user]);

  if (!user) {
    return (
      <Link
        href="/signup-loggin/log-sign"
        className={`inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 ${className}`}
      >
        <Heart size={16} />
        收藏
      </Link>
    );
  }

  if (user.role !== "traveler") {
    return null;
  }

  const buttonClasses =
    variant === "ghost"
      ? "inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
      : "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition";

  const activeClasses =
    variant === "ghost"
      ? "border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100"
      : "bg-rose-600 text-white hover:bg-rose-700";

  const inactiveClasses =
    variant === "ghost"
      ? "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
      : "bg-slate-900 text-white hover:bg-slate-800";

  const handleToggle = async () => {
    if (isSubmitting || isLoading) {
      return;
    }

    setIsSubmitting(true);
    const nextIsFavorited = !isFavorited;

    try {
      const response = await fetch(endpoint, {
        method: nextIsFavorited ? "POST" : "DELETE",
      });

      if (!response.ok) {
        return;
      }

      setIsFavorited(nextIsFavorited);
      onChange?.(nextIsFavorited);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={isSubmitting || isLoading}
      className={`${buttonClasses} ${isFavorited ? activeClasses : inactiveClasses} ${className}`}
      aria-pressed={isFavorited}
    >
      <Heart size={16} className={isFavorited ? "fill-current" : ""} />
      {isLoading ? "載入中..." : isFavorited ? activeLabel : inactiveLabel}
    </button>
  );
}
