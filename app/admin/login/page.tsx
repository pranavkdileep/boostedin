"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { adminLogin } from "@/actions/admin/auth";

export default function AdminLoginPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const [pending, setPending] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setPending(true);
    setLoginError(null);

    try {
      await adminLogin(formData);
    } catch (e) {
      setLoginError(e instanceof Error ? e.message : "Login failed");
      setPending(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="relative w-full max-w-[400px]">
        <div
          className="absolute -inset-[1px] rounded-2xl bg-gradient-to-tr from-secondary via-primary to-tertiary opacity-60 blur-sm"
          aria-hidden="true"
        />
        <div className="relative bg-surface-container-lowest rounded-2xl shadow-card border border-surface-container-high p-6 sm:p-8">
          <div className="flex items-center justify-center mb-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary text-on-secondary shadow-[0_8px_20px_rgba(113,42,226,0.25)]">
              <svg
                className="h-6 w-6"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 3s-6 3-6 9v3.75a2.25 2.25 0 0 0 1.125 1.948L12 21l4.875-2.302A2.25 2.25 0 0 0 18 15.75V12c0-6-6-9-6-9Z"
                />
              </svg>
            </div>
          </div>

          <h1 className="text-center font-headline-md text-headline-md text-on-background mb-1">
            Admin Login
          </h1>
          <p className="text-center font-body-md text-body-md text-on-surface-variant mb-6">
            Sign in to manage Boostedin
          </p>

          {(error || loginError) && (
            <div
              role="alert"
              className="flex items-center gap-2 p-3 mb-4 bg-error-container text-on-error-container text-sm rounded-xl"
            >
              <svg
                className="h-5 w-5 shrink-0"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16zm-.75-5.5a.75.75 0 0 0 1.5 0V9a.75.75 0 0 0-1.5 0v3.5zm.75 2a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"
                  clipRule="evenodd"
                />
              </svg>
              <span>{loginError ?? "Invalid credentials"}</span>
            </div>
          )}

          <form action={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="username"
                className="block font-label-sm text-label-sm text-on-surface-variant mb-1"
              >
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                autoFocus
                className="h-10 w-full rounded-lg border border-outline-variant/50 bg-surface-container-lowest px-3 font-body-md text-body-md text-on-surface outline-none transition-colors placeholder:text-on-surface-variant/70 focus:border-primary focus:ring-1 focus:ring-primary"
                placeholder="Enter username"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block font-label-sm text-label-sm text-on-surface-variant mb-1"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="h-10 w-full rounded-lg border border-outline-variant/50 bg-surface-container-lowest px-3 font-body-md text-body-md text-on-surface outline-none transition-colors placeholder:text-on-surface-variant/70 focus:border-primary focus:ring-1 focus:ring-primary"
                placeholder="Enter password"
              />
            </div>

            <button
              type="submit"
              disabled={pending}
              className="group relative w-full flex items-center justify-center gap-2 rounded-lg bg-secondary px-4 py-3 font-label-md text-label-md text-white shadow-[0_10px_24px_rgba(113,42,226,0.25)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_30px_rgba(113,42,226,0.35)] active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0 overflow-hidden"
            >
              {pending ? (
                <svg
                  className="animate-spin h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 0 1 8-8v4a4 4 0 0 0-4 4H4z"
                  />
                </svg>
              ) : (
                <>
                  <span>Sign in</span>
                  <svg
                    className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M17 8l4 4m0 0l-4 4m4-4H3"
                    />
                  </svg>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
