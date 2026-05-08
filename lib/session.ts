import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function getSessionFromCookies() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("aiTravelSession");

  if (!sessionCookie?.value) {
    return null;
  }

  try {
    const sessionData = JSON.parse(decodeURIComponent(sessionCookie.value));

    if (!sessionData?.email) {
      return null;
    }

    const user = await prisma.user.findUnique({
      where: { email: sessionData.email },
    });

    return user;
  } catch {
    return null;
  }
}
