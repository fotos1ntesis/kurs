import { NextResponse } from "next/server";
import { deleteSession } from "@/lib/auth-store";

export async function POST(request) {
  await deleteSession(request.cookies.get("eduform_session")?.value);

  const response = NextResponse.json({ success: true });
  response.cookies.set("eduform_session", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  return response;
}
