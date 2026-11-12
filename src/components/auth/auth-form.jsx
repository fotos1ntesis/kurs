"use client";

import { useEffect, useState } from "react";

export default function AuthForm({ mode, onModeChange, onClose, onAuthenticated }) {
  const isRegister = mode === "register";
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const formData = new FormData(event.currentTarget);
      const response = await fetch(`/api/auth/${isRegister ? "register" : "login"}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(formData)),
      });
      const result = await response.json();

      if (!response.ok) {
        setError(result.error || "Не удалось выполнить запрос.");
        return;
      }

      onAuthenticated(result.user);
      onClose();
    } catch {
      setError("Не удалось связаться с сервером. Попробуйте ещё раз.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const inputClass =
    "mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-navy-blue outline-none transition focus:border-iris focus:ring-2 focus:ring-iris/20";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-navy-blue/45 px-4 py-8 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <section
        aria-labelledby="auth-modal-title"
        aria-modal="true"
        className="relative my-auto w-full max-w-md rounded-3xl border border-slate-200/80 bg-white p-7 shadow-2xl sm:p-9"
        role="dialog"
      >
        <button
          aria-label="Закрыть окно"
          className="absolute right-4 top-4 rounded-full px-3 py-1 text-2xl leading-none text-slate transition hover:bg-cloud hover:text-navy-blue"
          onClick={onClose}
          type="button"
        >
          &times;
        </button>
        <h1 className="text-3xl font-bold text-navy-blue">
          <span id="auth-modal-title">
            {isRegister ? "Создать аккаунт" : "С возвращением"}
          </span>
        </h1>
        <p className="mt-2 text-slate">
          {isRegister
            ? "Зарегистрируйтесь, чтобы пользоваться личным кабинетом."
            : "Войдите в личный кабинет EDUFORM."}
        </p>

        <form className="mt-7 space-y-5" onSubmit={handleSubmit}>
          {isRegister && (
            <label className="block text-sm font-medium text-navy-blue">
              Имя
              <input
                className={inputClass}
                name="name"
                type="text"
                autoComplete="name"
                minLength={2}
                maxLength={80}
                required
              />
            </label>
          )}

          <label className="block text-sm font-medium text-navy-blue">
            Email
            <input
              className={inputClass}
              name="email"
              type="email"
              autoComplete="email"
              maxLength={254}
              required
            />
          </label>

          <label className="block text-sm font-medium text-navy-blue">
            Пароль
            <input
              className={inputClass}
              name="password"
              type="password"
              autoComplete={isRegister ? "new-password" : "current-password"}
              minLength={isRegister ? 8 : undefined}
              maxLength={128}
              required
            />
            {isRegister && (
              <span className="mt-1 block text-xs font-normal text-slate">
                Не менее 8 символов
              </span>
            )}
          </label>

          {error && (
            <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
              {error}
            </p>
          )}

          <button
            className="w-full rounded-xl bg-iris px-5 py-3 font-semibold text-white transition hover:bg-ocean disabled:cursor-not-allowed disabled:opacity-60"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting
              ? "Подождите..."
              : isRegister
                ? "Зарегистрироваться"
                : "Войти"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate">
          {isRegister ? "Уже есть аккаунт?" : "Ещё нет аккаунта?"}{" "}
          <button
            className="font-semibold text-iris hover:text-ocean"
            onClick={() => onModeChange(isRegister ? "login" : "register")}
            type="button"
          >
            {isRegister ? "Войти" : "Зарегистрироваться"}
          </button>
        </p>
      </section>
    </div>
  );
}
