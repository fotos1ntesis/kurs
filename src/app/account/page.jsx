"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { courses } from "@/data/data.json";

export default function AccountPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [purchases, setPurchases] = useState([]);
  const [logoutError, setLogoutError] = useState("");
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    let isMounted = true;

    fetch("/api/auth/me")
      .then(async (response) => {
        if (response.status === 401) {
          window.dispatchEvent(
            new CustomEvent("eduform:open-auth", { detail: { mode: "login" } }),
          );
          router.replace("/");
          return null;
        }

        const result = await response.json();
        if (!response.ok) {
          throw new Error(result.error || "Не удалось загрузить профиль.");
        }

        const purchasesResponse = await fetch("/api/purchases");
        if (!purchasesResponse.ok) {
          throw new Error("Не удалось загрузить ваши курсы.");
        }
        const purchasesResult = await purchasesResponse.json();
        if (isMounted) {
          setPurchases(purchasesResult.purchases);
        }

        return result.user;
      })
      .then((profile) => {
        if (isMounted && profile) {
          setUser(profile);
        }
      })
      .catch(() => {
        if (isMounted) {
          setError(
            "Не удалось загрузить профиль. Попробуйте обновить страницу.",
          );
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [router]);

  async function handleLogout() {
    setLogoutError("");
    setIsLoggingOut(true);

    try {
      const response = await fetch("/api/auth/logout", { method: "POST" });
      if (!response.ok) {
        throw new Error("Не удалось завершить сеанс.");
      }

      setUser(null);
      window.dispatchEvent(
        new CustomEvent("eduform:auth-changed", {
          detail: { loggedOut: true },
        }),
      );
      router.replace("/");
    } catch {
      setLogoutError("Не удалось выйти из аккаунта. Попробуйте ещё раз.");
    } finally {
      setIsLoggingOut(false);
    }
  }

  if (isLoading) {
    return (
      <section className="flex flex-1 items-center justify-center px-4 py-20">
        <p className="text-slate">Загружаем личный кабинет...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="flex flex-1 items-center justify-center px-4 py-20">
        <p className="text-red-700" role="alert">
          {error}
        </p>
      </section>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <section className="flex-1 px-4 py-14">
      <div className="mx-auto max-w-3xl">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-iris">
              Личный кабинет
            </p>
            <h1 className="mt-2 text-3xl font-bold text-navy-blue sm:text-4xl">
              Здравствуйте, {user.name}!
            </h1>
          </div>
          <button
            className="rounded-xl border border-slate-200 px-5 py-3 font-semibold text-navy-blue transition hover:border-red-700 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isLoggingOut}
            onClick={handleLogout}
            type="button"
          >
            {isLoggingOut ? "Выходим..." : "Выйти"}
          </button>
        </div>
        {logoutError && (
          <p className="mt-4 text-sm text-red-700" role="alert">
            {logoutError}
          </p>
        )}
        <div className="mt-8 rounded-3xl border border-slate-200/80 bg-cloud p-6 sm:p-8">
          <h2 className="text-xl font-semibold text-navy-blue">Ваш профиль</h2>
          <dl className="mt-5 space-y-4">
            <div>
              <dt className="text-sm text-slate">Имя</dt>
              <dd className="mt-1 font-medium text-navy-blue">{user.name}</dd>
            </div>
            <div>
              <dt className="text-sm text-slate">Email</dt>
              <dd className="mt-1 font-medium text-navy-blue">{user.email}</dd>
            </div>
            <div>
              <dt className="text-sm text-slate">Дата регистрации</dt>
              <dd className="mt-1 font-medium text-navy-blue">
                {new Intl.DateTimeFormat("ru-RU", { dateStyle: "long" }).format(
                  new Date(user.createdAt),
                )}
              </dd>
            </div>
          </dl>
        </div>
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-navy-blue">Мои курсы</h2>
          {purchases.length === 0 ? (
            <p className="mt-3 text-slate">
              Здесь появятся курсы, которые вы добавите в личный кабинет.
            </p>
          ) : (
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {purchases.map((purchase) => {
                const course = courses.find(
                  (item) => item.id === purchase.courseId,
                );
                if (!course) {
                  return null;
                }

                return (
                  <Link
                    className="rounded-2xl border border-slate-200/80 p-5 transition hover:border-iris"
                    href={`/courses/${course.id}`}
                    key={purchase.courseId}
                  >
                    <h3 className="font-semibold text-navy-blue hover:text-iris">
                      {course.title}
                    </h3>
                    <p className="mt-2 text-sm text-slate">
                      Добавлен{" "}
                      {new Intl.DateTimeFormat("ru-RU", {
                        dateStyle: "long",
                      }).format(new Date(purchase.purchasedAt))}
                    </p>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
        <Link
          href="/"
          className="mt-6 inline-flex rounded-xl bg-iris px-5 py-3 font-semibold text-white transition hover:bg-ocean"
        >
          Перейти к курсам
        </Link>
      </div>
    </section>
  );
}
