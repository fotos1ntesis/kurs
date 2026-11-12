import { NextResponse } from "next/server";
import {
  authenticateUser,
  createSession,
  SESSION_DURATION,
} from "@/lib/auth-store";

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Некорректный формат запроса." }, { status: 400 });
  }

  const email =
    typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";

  if (!email || !password || password.length > 128) {
    return NextResponse.json(
      { error: "Проверьте email и пароль." },
      { status: 400 },
    );
  }

  const user = await authenticateUser(email, password);
  if (!user) {
    return NextResponse.json(
      { error: "Неверный email или пароль." },
      { status: 401 },
    );
  }

  const token = await createSession(user.id);
  const response = NextResponse.json({ user });
  response.cookies.set("eduform_session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DURATION / 1000,
  });

  return response;
}
