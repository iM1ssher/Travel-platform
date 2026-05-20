"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Heart } from "lucide-react";
import { useAuth } from "@/app/providers";

type FavoriteRole = "traveler" | "planner";

type FavoriteToggleProps = {
  endpoint: string;
  activeLabel: string;
  inactiveLabel: string;
  initialIsFavorited?: boolean | null;
  variant?: "solid" | "ghost";
  className?: string;
  allowedRoles?: FavoriteRole[];
  onChange?: (isFavorited: boolean) => void;
};

type FavoriteStatusResponse = {
  isFavorited?: boolean;
};

const canManageFavorite = (role: string | undefined, allowedRoles: FavoriteRole[]): boolean =>
  allowedRoles.some((allowedRole: FavoriteRole) => allowedRole === role);

export function FavoriteToggle({
  endpoint,
  activeLabel,
  inactiveLabel,
  initialIsFavorited = null,
  variant = "solid",
  className = "",
  allowedRoles = ["traveler"],
  onChange,
}: FavoriteToggleProps) {
  const { user } = useAuth();
  const allowedRolesKey = allowedRoles.join("|");
  const [isFavorited, setIsFavorited] = useState<boolean>(initialIsFavorited ?? false);
  const [isLoading, setIsLoading] = useState<boolean>(initialIsFavorited === null && canManageFavorite(user?.role, allowedRoles));
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    const loadStatus = async () => {
      const allowedRoleList = allowedRolesKey.split("|") as FavoriteRole[];
      if (!user || !canManageFavorite(user.role, allowedRoleList) || initialIsFavorited !== null) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(endpoint, { cache: "no-store" });
        if (!response.ok) {
          setIsFavorited(false);
          return;
        }

        const data = (await response.json()) as FavoriteStatusResponse;
        setIsFavorited(Boolean(data.isFavorited));
      } catch {
        setIsFavorited(false);
      } finally {
        setIsLoading(false);
      }
    };

    void loadStatus();
  }, [allowedRolesKey, endpoint, initialIsFavorited, user]);

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

  if (!canManageFavorite(user.role, allowedRolesKey.split("|") as FavoriteRole[])) {
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
