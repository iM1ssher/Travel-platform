import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromCookies } from "@/lib/session";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const user = await getSessionFromCookies();

  if (!user) {
    return NextResponse.json({ message: "未登入。" }, { status: 401 });
  }

  const id = Number(params.id);
  if (Number.isNaN(id)) {
    return NextResponse.json({ message: "無效的行程 ID。" }, { status: 400 });
  }

  const existingTrip = await prisma.trip.findUnique({
    where: { id },
  });

  if (!existingTrip || existingTrip.authorId !== user.id) {
    return NextResponse.json({ message: "找不到該行程，或您無權編輯。" }, { status: 404 });
  }

  const body = await request.json();
  const { title, summary, coverImage, publish } = body as {
    title?: string;
    summary?: string;
    coverImage?: string;
    publish?: boolean;
  };

  const data: Record<string, any> = {};

  if (typeof title === "string") {
    data.title = title.trim();
  }

  if (typeof summary === "string") {
    data.summary = summary.trim();
  }

  if (typeof coverImage === "string") {
    data.coverImage = coverImage.trim() || null;
  }

  if (publish === true) {
    data.isPublished = true;
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ message: "沒有可更新的欄位。" }, { status: 400 });
  }

  const updatedTrip = await prisma.trip.update({
    where: { id },
    data,
  });

  return NextResponse.json({ trip: updatedTrip });
}
