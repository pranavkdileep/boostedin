"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useFormStatus } from "react-dom";
import { useSearchParams } from "next/navigation";

import { signInWithLinkedIn } from "@/actions/auth/login";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const ERROR_MESSAGES: Record<string, string> = {
  access_denied:
    "You declined LinkedIn authorization. Please try again to continue.",
  missing_params:
    "The authentication request was incomplete. Please try signing in again.",
  invalid_state:
    "Your session expired before completing sign in. Please try again.",
  token_exchange_failed:
    "We could not connect to LinkedIn. Please try again in a moment.",
  userinfo_failed:
    "We could not retrieve your LinkedIn profile. Please try again.",
};

function LinkedInIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.36V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zm1.78 13.02H3.56V9h3.56v11.45zM22.23 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.46c.98 0 1.77-.77 1.77-1.72V1.72C24 .77 23.21 0 22.23 0z" />
    </svg>
  );
}

function Spinner() {
  return (
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
  );
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <div
      role="alert"
      className="flex items-start gap-3 p-4 mb-6 bg-error-container text-on-error-container border border-error/30 rounded-xl animate-fade-in-down animate-shake"
    >
      <div className="shrink-0 mt-0.5">
        <svg
          className="h-5 w-5"
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
      </div>
      <div className="min-w-0">
        <p className="font-label-md font-semibold">Sign in failed</p>
        <p className="font-body-md text-sm mt-0.5 leading-relaxed">
          {message}
        </p>
      </div>
    </div>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="group/btn relative w-full flex items-center justify-center gap-3 px-6 py-4 bg-[#0a66c2] hover:bg-[#004e99] text-white font-label-md text-label-md rounded-xl shadow-[0_10px_30px_rgba(10,102,194,0.25)] hover:shadow-[0_14px_40px_rgba(10,102,194,0.45)] hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all duration-200 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0 overflow-hidden"
    >
      {pending ? (
        <>
          <Spinner />
          <span>Connecting to LinkedIn…</span>
        </>
      ) : (
        <>
          <span className="inline-flex items-center justify-center transition-transform duration-300 group-hover/btn:rotate-[8deg] group-hover/btn:scale-110">
            <LinkedInIcon className="h-6 w-6" />
          </span>
          <span>Continue with LinkedIn</span>
          <svg
            className="h-5 w-5 transition-transform duration-300 group-hover/btn:translate-x-1"
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
      <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover/btn:translate-x-full" />
    </button>
  );
}

function FeatureListItem({
  index,
  icon,
  title,
  description,
}: {
  index: number;
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <li
      className="flex items-start gap-3 opacity-0 animate-fade-in-left"
      style={{ animationDelay: `${300 + index * 120}ms` }}
    >
      <div className="shrink-0 w-10 h-10 rounded-lg bg-primary-container/15 text-primary flex items-center justify-center transition-transform duration-300 hover:rotate-[6deg]">
        {icon}
      </div>
      <div>
        <p className="font-label-md font-semibold text-on-surface">{title}</p>
        <p className="font-body-md text-sm text-on-surface-variant mt-0.5">
          {description}
        </p>
      </div>
    </li>
  );
}

function Pill({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="group flex flex-col items-center gap-1.5 p-3 rounded-xl bg-surface-container-low border border-surface-container-high transition-all duration-200 hover:bg-surface-container hover:-translate-y-0.5 hover:shadow-card cursor-default">
      <div className="text-primary transition-transform duration-300 group-hover:scale-110">
        {icon}
      </div>
      <span className="font-label-sm text-label-sm text-on-surface-variant">
        {label}
      </span>
    </div>
  );
}

function AuthContent() {
  const searchParams = useSearchParams();
  const errorCode = searchParams.get("error");
  const errorMessage = errorCode
    ? (ERROR_MESSAGES[errorCode] ??
      `Sign in could not be completed${errorCode ? ` (${errorCode})` : ""}. Please try again.`)
    : null;

  return (
    <>
      <Header />
      <main className="relative flex-1 flex items-center justify-center overflow-hidden pt-32 pb-20 px-margin-mobile md:px-margin-desktop">
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-primary-fixed rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob" />
        <div className="absolute top-[20%] right-[-10%] w-96 h-96 bg-secondary-fixed rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000" />
        <div className="absolute bottom-[-15%] left-[20%] w-96 h-96 bg-tertiary-fixed rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob animation-delay-4000" />

        <div className="relative max-w-6xl w-full mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center z-10">
          <div className="flex flex-col gap-6 min-w-0 opacity-0 animate-slide-in-left animation-delay-200">
            <div className="inline-flex items-center gap-2 bg-surface-container-high text-primary px-3 py-1.5 rounded-full w-fit">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
              </span>
              <span className="font-label-sm text-label-sm">
                Secure LinkedIn sign in
              </span>
            </div>

            <h1 className="font-headline-lg-mobile md:font-display-lg text-headline-lg-mobile md:text-display-lg text-on-background leading-tight">
              Sign in to keep your{" "}
              <span className="text-purple-gradient">LinkedIn growth</span> on
              autopilot
            </h1>

            <p className="font-body-lg text-body-lg text-on-surface-variant w-full max-w-[36rem] text-pretty whitespace-normal">
              One click unlocks AI powered posts, smart scheduling, and analytics that turn your profile into a real growth engine.
            </p>

            <ul className="flex flex-col gap-4 mt-2">
              <FeatureListItem
                index={0}
                title="AI posts in your voice"
                description="Generate content that sounds like you, not a robot."
                icon={
                  <svg
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z"
                    />
                  </svg>
                }
              />
              <FeatureListItem
                index={1}
                title="Schedule on autopilot"
                description="Queue weeks of content and let Boostedin publish for you."
                icon={
                  <svg
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5"
                    />
                  </svg>
                }
              />
              <FeatureListItem
                index={2}
                title="Real growth analytics"
                description="Track followers, reach, and what is working in one place."
                icon={
                  <svg
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z"
                    />
                  </svg>
                }
              />
            </ul>
          </div>

          <div className="relative opacity-0 animate-slide-in-right animation-delay-400">
            <div className="relative">
              <div
                className="absolute -inset-[1px] rounded-2xl bg-gradient-to-tr from-primary via-secondary to-tertiary opacity-60 blur-sm animate-gradient-rotate"
                aria-hidden="true"
              />
              <div className="relative bg-surface-container-lowest rounded-2xl shadow-card border border-surface-container-high p-6 sm:p-8 backdrop-blur transition-shadow duration-300 hover:shadow-card-hover">
                {errorMessage && <ErrorBanner message={errorMessage} />}

                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-primary-container text-on-primary flex items-center justify-center shadow-[0_8px_20px_rgba(10,102,194,0.25)] transition-transform duration-300 hover:rotate-[8deg]">
                    <LinkedInIcon className="h-6 w-6" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="font-headline-md-mobile md:font-headline-md text-headline-md-mobile md:text-headline-md text-on-background">
                      Welcome back
                    </h2>
                    <p className="font-body-md text-sm text-on-surface-variant mt-0.5">
                      Sign in to your Boostedin account
                    </p>
                  </div>
                </div>

                <form action={signInWithLinkedIn}>
                  <SubmitButton />
                </form>

                <div className="mt-6 flex items-center gap-3 text-on-surface-variant">
                  <div className="h-px flex-1 bg-outline-variant/50" />
                  <span className="font-label-sm text-label-sm uppercase tracking-wider">
                    Why LinkedIn
                  </span>
                  <div className="h-px flex-1 bg-outline-variant/50" />
                </div>

                <div className="mt-4 grid grid-cols-3 gap-3">
                  <Pill
                    label="Auto post"
                    icon={
                      <svg
                        className="h-5 w-5"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5"
                        />
                      </svg>
                    }
                  />
                  <Pill
                    label="Schedule"
                    icon={
                      <svg
                        className="h-5 w-5"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                        />
                      </svg>
                    }
                  />
                  <Pill
                    label="Analyze"
                    icon={
                      <svg
                        className="h-5 w-5"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z"
                        />
                      </svg>
                    }
                  />
                </div>

                <p className="mt-6 font-label-sm text-label-sm text-on-surface-variant text-center leading-relaxed">
                  By continuing you agree to our{" "}
                  <Link
                    href="#terms"
                    className="text-primary hover:underline underline-offset-2"
                  >
                    Terms
                  </Link>{" "}
                  and{" "}
                  <Link
                    href="#privacy"
                    className="text-primary hover:underline underline-offset-2"
                  >
                    Privacy Policy
                  </Link>
                  .
                </p>
              </div>
            </div>

            <div className="hidden sm:flex absolute -bottom-6 -left-6 bg-surface-container-lowest px-4 py-2 rounded-xl shadow-card border border-surface-container-high items-center gap-2 animate-float">
              <svg
                className="w-4 h-4 text-tertiary"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M9.653 16.915l-.005-.003-.019-.01a20.759 20.759 0 0 1-1.162-.682 22.045 22.045 0 0 1-2.582-1.9C4.045 12.733 2 10.352 2 7.5a4.5 4.5 0 0 1 8-2.828A4.5 4.5 0 0 1 18 7.5c0 2.852-2.044 5.233-3.885 6.82a22.049 22.049 0 0 1-3.744 2.582l-.019.01-.005.003h-.002a.739.739 0 0 1-.69 0l-.002-.001Z" />
              </svg>
              <span className="font-label-sm text-label-sm font-semibold text-on-surface">
                Trusted by 2k+ creators
              </span>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

function AuthLoading() {
  return (
    <>
      <Header />
      <main className="flex-1 flex items-center justify-center pt-32 pb-20">
        <Spinner />
      </main>
      <Footer />
    </>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={<AuthLoading />}>
      <AuthContent />
    </Suspense>
  );
}
