import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth-store";

export async function GET(request) {
  const user = await getSessionUser(request.cookies.get("eduform_session")?.value);

  if (!user) {
    return NextResponse.json({ error: "Требуется авторизация." }, { status: 401 });
  }

  return NextResponse.json({ user });
}
