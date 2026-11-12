import { NextResponse } from "next/server";
import { courses } from "@/data/data.json";
import {
  addCoursePurchase,
  getSessionUser,
  getUserPurchases,
} from "@/lib/auth-store";

async function getAuthenticatedUser(request) {
  return getSessionUser(request.cookies.get("eduform_session")?.value);
}

export async function GET(request) {
  const user = await getAuthenticatedUser(request);
  if (!user) {
    return NextResponse.json({ error: "Требуется авторизация." }, { status: 401 });
  }

  const purchases = await getUserPurchases(user.id);
  return NextResponse.json({ purchases });
}

export async function POST(request) {
  const user = await getAuthenticatedUser(request);
  if (!user) {
    return NextResponse.json({ error: "Требуется авторизация." }, { status: 401 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Некорректный формат запроса." },
      { status: 400 },
    );
  }

  if (!body || typeof body !== "object" || !Number.isInteger(body.courseId)) {
    return NextResponse.json(
      { error: "Укажите корректный идентификатор курса." },
      { status: 400 },
    );
  }

  const courseId = body.courseId;
  if (!courses.some((course) => course.id === courseId)) {
    return NextResponse.json({ error: "Курс не найден." }, { status: 404 });
  }

  const result = await addCoursePurchase(user.id, courseId);
  return NextResponse.json(result, { status: result.alreadyPurchased ? 200 : 201 });
}
