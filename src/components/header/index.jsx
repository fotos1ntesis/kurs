"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import AuthForm from "@/components/auth/auth-form";

const Header = () => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState("");
  const [authMode, setAuthMode] = useState(null);

  const closeAuthModal = useCallback(() => setAuthMode(null), []);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((response) => {
        if (response.status === 401) {
          return null;
        }
        if (!response.ok) {
          throw new Error("Не удалось проверить авторизацию.");
        }
        return response.json();
      })
      .then((result) => setUser(result?.user || null))
      .catch(() => setAuthError("Не удалось проверить авторизацию."))
      .finally(() => setIsLoading(false));

    const initialMode = new URLSearchParams(window.location.search).get("auth");
    if (initialMode === "login" || initialMode === "register") {
      setAuthMode(initialMode);
      window.history.replaceState({}, "", window.location.pathname);
    }

    function openAuthModal(event) {
      setAuthMode(event.detail?.mode === "register" ? "register" : "login");
    }

    function handleAuthChanged(event) {
      if (event.detail?.loggedOut) {
        setUser(null);
      } else if (event.detail?.user) {
        setUser(event.detail.user);
      }
    }

    window.addEventListener("eduform:open-auth", openAuthModal);
    window.addEventListener("eduform:auth-changed", handleAuthChanged);
    return () => {
      window.removeEventListener("eduform:open-auth", openAuthModal);
      window.removeEventListener("eduform:auth-changed", handleAuthChanged);
    };
  }, []);

  function handleAuthenticated(profile) {
    setUser(profile);
    window.dispatchEvent(
      new CustomEvent("eduform:auth-changed", { detail: { user: profile } }),
    );
  }

  return (
    <header className="mx-auto w-full border-b border-slate-200/80">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-5 sm:px-6 xl:px-0">
        <Link href="/" aria-label="EDUFORM — главная">
          <Image
            src="/logo.png"
            alt="EDUFORM"
            width={150}
            height={50}
            className="cursor-pointer"
          />
        </Link>

        {isLoading ? (
          <span
            className="h-12 w-28 rounded-[17px] bg-cloud"
            aria-hidden="true"
          />
        ) : user ? (
          <Link
            href="/account"
            aria-label={`Личный кабинет: ${user.name}`}
            title={user.name}
            className="flex max-w-55 items-center gap-3 rounded-full border border-slate-200/80 py-1.5 pl-1.5 pr-4"
          >
            <span
              aria-hidden="true"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-iris text-sm font-bold text-white"
            >
              {user.name
                .trim()
                .split(/\s+/)
                .slice(0, 2)
                .map((part) => part[0])
                .join("")
                .toUpperCase()}
            </span>
            <span className="truncate text-sm font-semibold text-navy-blue">
              {user.name}
            </span>
          </Link>
        ) : (
          <button
            onClick={() => setAuthMode("login")}
            className="rounded-[17px] bg-iris px-7 py-3 text-base font-medium leading-6 text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-ocean active:translate-y-0"
            type="button"
          >
            Войти
          </button>
        )}
        {authError && (
          <span className="text-right text-xs text-red-700" role="alert">
            {authError}
          </span>
        )}
      </div>
      {authMode && (
        <AuthForm
          mode={authMode}
          onModeChange={setAuthMode}
          onClose={closeAuthModal}
          onAuthenticated={handleAuthenticated}
        />
      )}
    </header>
  );
};

export default Header;
