import { NextResponse } from "next/server";
import { createSession, registerUser, SESSION_DURATION } from "@/lib/auth-store";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Некорректный формат запроса." }, { status: 400 });
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email =
    typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";

  if (name.length < 2 || name.length > 80) {
    return NextResponse.json(
      { error: "Имя должно содержать от 2 до 80 символов." },
      { status: 400 },
    );
  }

  if (!emailPattern.test(email) || email.length > 254) {
    return NextResponse.json({ error: "Укажите корректный email." }, { status: 400 });
  }

  if (password.length < 8 || password.length > 128) {
    return NextResponse.json(
      { error: "Пароль должен содержать от 8 до 128 символов." },
      { status: 400 },
    );
  }

  const user = await registerUser({ name, email, password });
  if (!user) {
    return NextResponse.json(
      { error: "Пользователь с таким email уже зарегистрирован." },
      { status: 409 },
    );
  }

  const token = await createSession(user.id);
  const response = NextResponse.json({ user }, { status: 201 });
  response.cookies.set("eduform_session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DURATION / 1000,
  });

  return response;
}
