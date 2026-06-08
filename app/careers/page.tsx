import type { Metadata } from "next";
import Link from "next/link";

import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Careers at Boostedin",
  description:
    "Explore career opportunities at Boostedin and learn what it is like to build with us.",
};

const principles = [
  {
    title: "Move with intent",
    description:
      "We value thoughtful shipping over rushed features that add noise.",
  },
  {
    title: "Own the outcome",
    description:
      "Everyone on the team should feel responsible for user success, not just task completion.",
  },
  {
    title: "Stay user-first",
    description:
      "We make product decisions by asking whether they help people publish better content.",
  },
  {
    title: "Keep learning",
    description:
      "We like people who are curious, practical, and comfortable improving how we work.",
  },
];

export default function CareersPage() {
  return (
    <>
      <Header />
      <main className="relative flex-1 overflow-hidden px-margin-mobile md:px-margin-desktop pt-32 pb-20">
        <div className="absolute top-[-10%] left-[-10%] h-96 w-96 rounded-full bg-primary-fixed opacity-50 blur-3xl animate-blob" />
        <div className="absolute top-[20%] right-[-10%] h-96 w-96 rounded-full bg-tertiary-fixed opacity-40 blur-3xl animate-blob animation-delay-2000" />

        <div className="relative z-10 mx-auto flex max-w-7xl flex-col gap-16">
          <section className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="flex flex-col gap-6">
              <span className="font-label-md text-label-md text-primary">
                Careers
              </span>
              <h1 className="font-display-lg-mobile md:font-display-lg text-display-lg-mobile md:text-display-lg text-on-background leading-tight">
                Help us build the easiest way to publish on LinkedIn.
              </h1>
              <p className="w-full max-w-2xl text-pretty font-body-lg text-body-lg text-on-surface-variant">
                We are a small team focused on making content creation and
                scheduling less stressful for people who want to grow their
                professional presence.
              </p>

              <div className="flex flex-wrap gap-3">
                <Link
                  href="/contact"
                  className="bg-purple-gradient inline-flex min-h-12 items-center justify-center rounded-xl px-6 py-3 font-label-md text-label-md text-on-primary shadow-[0_10px_24px_rgba(124,58,237,0.22)] transition-all duration-200 hover:-translate-y-0.5"
                >
                  Contact Us
                </Link>
                <Link
                  href="/auth"
                  className="inline-flex min-h-12 items-center justify-center rounded-xl border border-outline-variant/70 bg-surface-container-lowest px-6 py-3 font-label-md text-label-md text-on-surface transition-colors hover:border-primary hover:text-primary"
                >
                  Start Free
                </Link>
              </div>
            </div>

            <div className="rounded-3xl border border-outline-variant/70 bg-surface-container-lowest p-8 shadow-card">
              <span className="font-label-md text-label-md text-primary">
                Current status
              </span>
              <h2 className="mt-3 font-headline-lg text-headline-lg text-on-surface">
                We are not hiring actively right now
              </h2>
              <p className="mt-4 font-body-md text-body-md leading-relaxed text-on-surface-variant">
                We grow carefully, and when roles open up we will post them here
                first. If you think you can help us build a better product,
                reach out anyway and introduce yourself.
              </p>
              <div className="mt-6 rounded-2xl bg-surface-container-low p-4">
                <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-[0.18em]">
                  What we care about
                </p>
                <p className="mt-2 font-body-md text-body-md text-on-surface">
                  Product thinking, good communication, and a strong sense of
                  ownership.
                </p>
              </div>
            </div>
          </section>

          <section>
            <div className="mb-8 flex flex-col gap-4">
              <span className="font-label-md text-label-md text-primary">
                Team values
              </span>
              <h2 className="font-display-md-mobile md:font-display-md text-display-md-mobile md:text-display-md text-on-background">
                How we like to work
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {principles.map((item) => (
                <article
                  key={item.title}
                  className="rounded-3xl border border-outline-variant/70 bg-surface-container-lowest p-6 shadow-card"
                >
                  <h3 className="font-headline-md text-headline-md text-on-surface">
                    {item.title}
                  </h3>
                  <p className="mt-3 font-body-md text-body-md text-on-surface-variant">
                    {item.description}
                  </p>
                </article>
              ))}
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
