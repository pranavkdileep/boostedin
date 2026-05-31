import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Header />
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-margin-mobile md:px-margin-desktop relative overflow-hidden">
        {/* Animated Background Blobs */}
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-primary-fixed rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob" />
        <div className="absolute top-[20%] right-[-10%] w-96 h-96 bg-secondary-fixed rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000" />

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
          {/* Left: Copy */}
          <div className="flex flex-col gap-6 min-w-0 animate-slide-in-left opacity-0 animation-delay-200">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-surface-container-high text-primary px-3 py-1 rounded-full w-fit">
              <svg
                className="w-4 h-4 text-secondary"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838l-2.328.999 3.18 1.363a1 1 0 00.788 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0z" />
              </svg>
              <span className="font-label-sm text-label-sm">
                AI-Powered LinkedIn Growth
              </span>
            </div>

            {/* Heading */}
            <h1 className="font-display-lg-mobile md:font-display-lg text-display-lg-mobile md:text-display-lg text-on-background leading-tight">
              Turn Your LinkedIn Into a{" "}
              <span className="text-purple-gradient">Growth Engine</span>
            </h1>

            {/* Description */}
            <p className="font-body-lg text-body-lg text-on-surface-variant w-full max-w-[36rem] text-pretty">
              Create viral LinkedIn posts, AI-powered articles, and schedule
              content automatically. Build your personal brand while Boostedin
              handles the writing.
            </p>

            {/* Email CTA */}
            <div className="flex w-full max-w-[36rem] flex-col gap-3 rounded-2xl border border-outline-variant/70 bg-surface-container-lowest/80 p-2 shadow-card backdrop-blur sm:flex-row sm:items-center sm:gap-2">
              <div className="relative flex-1">
                <svg
                  className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-outline"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"
                  />
                </svg>
                <input
                  className="h-12 w-full rounded-xl border-0 bg-transparent pl-12 pr-4 font-body-md text-body-md text-on-surface placeholder:text-on-surface-variant/70 outline-none focus:ring-0"
                  placeholder="Enter your email"
                  type="email"
                />
              </div>
              <button className="group bg-purple-gradient min-h-12 rounded-xl px-7 py-3 font-label-md text-label-md text-on-primary shadow-[0_10px_24px_rgba(124,58,237,0.22)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_32px_rgba(124,58,237,0.3)] active:translate-y-0 flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer">
                Start Free
                <svg
                  className="h-[18px] w-[18px] transition-transform duration-200 group-hover:translate-x-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.59 14.37a6 6 0 0 1-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 0 0 6.16-12.12A14.98 14.98 0 0 0 9.631 8.41m5.96 5.96a14.926 14.926 0 0 1-5.841 2.58m-.119-8.54a6 6 0 0 0-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 0 0-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 0 1-2.448-2.448 14.9 14.9 0 0 1 .06-.312m-2.24 2.39a4.493 4.493 0 0 0-1.757 4.306 4.493 4.493 0 0 0 4.306-1.758M16.5 9a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z"
                  />
                </svg>
              </button>
            </div>

            {/* Social Proof */}
            <div className="flex items-center gap-4 mt-2">
              <button className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors font-label-md text-label-md cursor-pointer">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.91 11.672a.375.375 0 0 1 0 .656l-5.603 3.113a.375.375 0 0 1-.557-.328V8.887c0-.286.307-.466.557-.327l5.603 3.112Z"
                  />
                </svg>
                Watch Demo
              </button>
              <div className="flex -space-x-2">
                <div className="w-8 h-8 rounded-full border-2 border-surface-container-lowest bg-primary-container overflow-hidden">
                  <div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600" />
                </div>
                <div className="w-8 h-8 rounded-full border-2 border-surface-container-lowest bg-secondary-container overflow-hidden">
                  <div className="w-full h-full bg-gradient-to-br from-purple-400 to-purple-600" />
                </div>
                <div className="w-8 h-8 rounded-full border-2 border-surface-container-lowest bg-tertiary-container overflow-hidden">
                  <div className="w-full h-full bg-gradient-to-br from-amber-400 to-amber-600" />
                </div>
                <div className="w-8 h-8 rounded-full border-2 border-surface-container-lowest bg-surface-container-high flex items-center justify-center font-label-sm text-label-sm text-on-surface-variant">
                  +2k
                </div>
              </div>
              <span className="font-label-sm text-label-sm text-on-surface-variant">
                Active users
              </span>
            </div>
          </div>

          {/* Right: Dashboard Mockup */}
          <div className="relative h-[600px] w-full rounded-2xl bg-surface-container-lowest shadow-card border border-surface-container-high animate-slide-in-right opacity-0 animation-delay-400">
            <div className="h-full w-full overflow-hidden rounded-2xl flex flex-col">
              {/* Mac Header */}
              <div className="h-8 bg-surface-container-low border-b border-surface-container-high flex items-center px-4 gap-2">
                <div className="w-3 h-3 rounded-full bg-error/50" />
                <div className="w-3 h-3 rounded-full bg-tertiary-fixed-dim/50" />
                <div className="w-3 h-3 rounded-full bg-surface-tint/50" />
              </div>

            <div className="flex flex-1 overflow-hidden p-4 gap-4 bg-surface-container-lowest">
              {/* Left Panel: Content Ideas */}
              <div className="w-1/4 flex-col gap-4 hidden sm:flex">
                <div className="bg-surface-container-low rounded-lg p-3">
                  <h3 className="font-label-sm text-label-sm text-on-surface mb-2">
                    Content Ideas
                  </h3>
                  <div className="flex flex-col gap-2">
                    <div className="h-8 bg-surface-container-highest rounded px-2 flex items-center gap-2">
                      <svg
                        className="w-3.5 h-3.5 text-primary"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z" />
                      </svg>
                      <div className="h-2 w-16 bg-outline-variant/30 rounded" />
                    </div>
                    <div className="h-8 bg-surface-container-highest rounded px-2 flex items-center gap-2">
                      <svg
                        className="w-3.5 h-3.5 text-primary"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941"
                        />
                      </svg>
                      <div className="h-2 w-20 bg-outline-variant/30 rounded" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Center Panel: AI Post Generator */}
              <div className="flex-1 flex flex-col gap-4">
                <div className="bg-surface-container-low rounded-lg p-4 flex-1 border border-surface-container-high relative">
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-surface-container-lowest/50 pointer-events-none rounded-lg z-10" />
                  <div className="flex items-center gap-2 mb-4">
                    <svg
                      className="w-5 h-5 text-secondary"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838l-2.328.999 3.18 1.363a1 1 0 00.788 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0z" />
                    </svg>
                    <h3 className="font-label-md text-label-md text-on-surface">
                      AI Post Generator
                    </h3>
                  </div>
                  <div className="bg-surface-container-lowest rounded border border-outline-variant/30 p-3 mb-4 shadow-card">
                    <p className="font-body-md text-body-md text-on-background leading-relaxed">
                      &ldquo;5 lessons I learned after building my
                      startup...&rdquo;
                    </p>
                    <div className="mt-2 space-y-2">
                      <div className="h-2 w-full bg-surface-container-highest rounded animate-pulse" />
                      <div className="h-2 w-5/6 bg-surface-container-highest rounded animate-pulse animation-delay-200" />
                      <div className="h-2 w-4/6 bg-surface-container-highest rounded animate-pulse animation-delay-400" />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 relative z-20">
                    <button className="px-3 py-1.5 rounded bg-surface-container-highest text-on-surface-variant font-label-sm text-label-sm flex items-center gap-1 cursor-pointer hover:bg-surface-container-high transition-colors">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182"
                        />
                      </svg>
                      Retry
                    </button>
                    <button className="px-3 py-1.5 rounded bg-primary-container text-on-primary font-label-sm text-label-sm flex items-center gap-1 cursor-pointer hover:bg-primary transition-colors">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5"
                        />
                      </svg>
                      Schedule
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Panel: Analytics */}
              <div className="w-1/4 flex-col gap-4 hidden md:flex">
                <div className="bg-surface-container-low rounded-lg p-3">
                  <h3 className="font-label-sm text-label-sm text-on-surface mb-2">
                    Analytics
                  </h3>
                  <div className="h-24 bg-surface-container-highest rounded w-full flex items-end p-2 gap-1">
                    <div className="w-1/4 h-1/3 bg-primary-fixed rounded-t" />
                    <div className="w-1/4 h-1/2 bg-primary-fixed rounded-t" />
                    <div className="w-1/4 h-full bg-primary-container rounded-t" />
                    <div className="w-1/4 h-2/3 bg-primary-fixed rounded-t" />
                  </div>
                </div>
              </div>
              </div>
            </div>

            {/* Floating Badges */}
            <div className="absolute top-12 -left-8 bg-surface-container-lowest px-4 py-2 rounded-lg shadow-card border border-surface-container-high flex items-center gap-2 animate-float">
              <svg
                className="w-4 h-4 text-green-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0zM17 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 0 0-1.5-4.33A5 5 0 0 1 19 16v1h-6.07zM6 11a5 5 0 0 1 5 5v1H1v-1a5 5 0 0 1 5-5z" />
              </svg>
              <span className="font-label-sm text-label-sm font-bold text-on-surface">
                +127 Followers
              </span>
            </div>
            <div className="absolute bottom-20 -right-8 bg-surface-container-lowest px-4 py-2 rounded-lg shadow-card border border-surface-container-high flex items-center gap-2 animate-float animation-delay-1000">
              <svg
                className="w-4 h-4 text-secondary"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z"
                />
              </svg>
              <span className="font-label-sm text-label-sm font-bold text-on-surface">
                +89% Engagement
              </span>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
