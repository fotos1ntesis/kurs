"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

export default function CoursePurchaseButton({ courseId }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isPurchased, setIsPurchased] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const refreshPurchaseStatus = useCallback(async () => {
    try {
      const response = await fetch("/api/purchases");
      if (response.status === 401) {
        setIsAuthenticated(false);
        setIsPurchased(false);
        return;
      }
      if (!response.ok) {
        throw new Error("Не удалось проверить доступ к курсу.");
      }

      const result = await response.json();
      setIsAuthenticated(true);
      setIsPurchased(
        result.purchases.some((purchase) => purchase.courseId === courseId),
      );
      setError("");
    } catch {
      setError("Не удалось проверить доступ к курсу. Обновите страницу.");
    } finally {
      setIsLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    refreshPurchaseStatus();
    window.addEventListener("eduform:auth-changed", refreshPurchaseStatus);
    return () =>
      window.removeEventListener("eduform:auth-changed", refreshPurchaseStatus);
  }, [refreshPurchaseStatus]);

  async function handlePurchase() {
    if (!isAuthenticated) {
      window.dispatchEvent(
        new CustomEvent("eduform:open-auth", { detail: { mode: "login" } }),
      );
      return;
    }

    setError("");
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/purchases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId }),
      });
      const result = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          setIsAuthenticated(false);
        }
        throw new Error(result.error || "Не удалось оформить покупку.");
      }

      setIsPurchased(true);
    } catch (purchaseError) {
      setError(purchaseError.message || "Не удалось оформить покупку.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return <p className="text-sm text-slate">Проверяем доступ...</p>;
  }

  if (isPurchased) {
    return (
      <div>
        <p className="font-semibold text-green-700">Курс в вашем кабинете</p>
        <Link
          className="mt-3 inline-block font-medium text-iris hover:text-ocean"
          href="/account"
        >
          Перейти в личный кабинет
        </Link>
      </div>
    );
  }

  return (
    <div>
      <button
        className="rounded-xl bg-iris px-7 py-3 font-semibold text-white transition hover:bg-ocean disabled:cursor-not-allowed disabled:opacity-60"
        disabled={isSubmitting}
        onClick={handlePurchase}
        type="button"
      >
        {isSubmitting
          ? "Добавляем курс..."
          : isAuthenticated
            ? "Купить курс"
            : "Войти, чтобы купить"}
      </button>

      {error && (
        <p className="mt-3 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
