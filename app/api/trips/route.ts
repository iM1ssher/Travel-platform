import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromCookies } from "@/lib/session";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const query = url.searchParams.get("q")?.trim();

  const where: {
    isPublished: boolean;
    OR?: Array<{
      title?: { contains: string; mode: "insensitive" };
      summary?: { contains: string; mode: "insensitive" };
    }>;
  } = { isPublished: true };

  if (query) {
    where.OR = [
      { title: { contains: query, mode: "insensitive" } },
      { summary: { contains: query, mode: "insensitive" } },
    ];
  }

  const trips = await prisma.trip.findMany({
    where,
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      title: true,
      coverImage: true,
      summary: true,
      isPublished: true,
      createdAt: true,
      updatedAt: true,
      averageRating: true,
      reviewCount: true,
      author: {
        select: {
          name: true,
          avatarUrl: true,
        },
      },
    },
  });

  return NextResponse.json({ trips });
}

export async function POST(request: Request) {
  const user = await getSessionFromCookies();

  if (!user) {
    return NextResponse.json({ message: "未登入，無法建立行程。" }, { status: 401 });
  }

  if (user.role !== "planner") {
    return NextResponse.json({ message: "只有規劃師可以建立行程草稿。" }, { status: 403 });
  }

  const body = await request.json();
  const { title, summary, coverImage } = body as { title?: string; summary?: string; coverImage?: string };

  if (!title || title.trim().length === 0) {
    return NextResponse.json({ message: "行程標題為必填欄位。" }, { status: 400 });
  }

  const trip = await prisma.trip.create({
    data: {
      title: title.trim(),
      summary: summary?.trim() ?? "由 AI 生成的草稿，請稍後補齊內容。",
      coverImage: coverImage?.trim() ?? null,
      authorId: user.id,
      isPublished: false,
    },
  });

  return NextResponse.json({ trip });
}
