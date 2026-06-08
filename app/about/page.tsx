import type { Metadata } from "next";
import Link from "next/link";

import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "About Boostedin",
  description:
    "Learn how Boostedin helps creators and teams turn ideas into consistent LinkedIn content.",
};

const highlights = [
  {
    title: "Built for consistency",
    description:
      "We focus on helping people show up regularly without burning out on content creation.",
  },
  {
    title: "Simple pricing",
    description:
      "Credits keep the cost easy to understand, so you always know what a post will cost.",
  },
  {
    title: "LinkedIn-first workflow",
    description:
      "Everything is designed around the way people actually publish and grow on LinkedIn.",
  },
];

const values = [
  {
    title: "Clarity over clutter",
    description:
      "Every product choice should make the writing and publishing process easier to follow.",
  },
  {
    title: "Speed with quality",
    description:
      "We want users to move quickly while still publishing posts that feel polished and useful.",
  },
  {
    title: "Ownership for creators",
    description:
      "The goal is to help people keep control of their voice while automating the repetitive work.",
  },
  {
    title: "Growth that compounds",
    description:
      "Small, consistent publishing habits can build strong professional momentum over time.",
  },
];

export default function AboutPage() {
  return (
    <>
      <Header />
      <main className="relative flex-1 overflow-hidden px-margin-mobile md:px-margin-desktop pt-32 pb-20">
        <div className="absolute top-[-10%] left-[-10%] h-96 w-96 rounded-full bg-primary-fixed opacity-50 blur-3xl animate-blob" />
        <div className="absolute top-[20%] right-[-10%] h-96 w-96 rounded-full bg-secondary-fixed opacity-50 blur-3xl animate-blob animation-delay-2000" />

        <div className="relative z-10 mx-auto flex max-w-7xl flex-col gap-16">
          <section className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="flex flex-col gap-6">
              <span className="font-label-md text-label-md text-primary">
                Company
              </span>
              <h1 className="font-display-lg-mobile md:font-display-lg text-display-lg-mobile md:text-display-lg text-on-background leading-tight">
                We help people turn LinkedIn ideas into a consistent growth
                engine.
              </h1>
              <p className="w-full max-w-2xl text-pretty font-body-lg text-body-lg text-on-surface-variant">
                Boostedin is built for creators, founders, and teams who want
                to publish better content without spending hours staring at a
                blank page.
              </p>

              <div className="flex flex-wrap gap-3">
                <Link
                  href="/auth"
                  className="bg-purple-gradient inline-flex min-h-12 items-center justify-center rounded-xl px-6 py-3 font-label-md text-label-md text-on-primary shadow-[0_10px_24px_rgba(124,58,237,0.22)] transition-all duration-200 hover:-translate-y-0.5"
                >
                  Start Free
                </Link>
                <Link
                  href="/#pricing"
                  className="inline-flex min-h-12 items-center justify-center rounded-xl border border-outline-variant/70 bg-surface-container-lowest px-6 py-3 font-label-md text-label-md text-on-surface transition-colors hover:border-primary hover:text-primary"
                >
                  See Pricing
                </Link>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
              {highlights.map((item) => (
                <article
                  key={item.title}
                  className="rounded-3xl border border-outline-variant/70 bg-surface-container-lowest p-5 shadow-card"
                >
                  <div className="mb-4 h-11 w-11 rounded-xl bg-primary-container flex items-center justify-center">
                    <div className="h-2.5 w-2.5 rounded-full bg-secondary" />
                  </div>
                  <h2 className="font-headline-md text-headline-md text-on-surface">
                    {item.title}
                  </h2>
                  <p className="mt-3 font-body-md text-body-md text-on-surface-variant">
                    {item.description}
                  </p>
                </article>
              ))}
            </div>
          </section>

          <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
            <article className="rounded-3xl border border-outline-variant/70 bg-surface-container-lowest p-8 shadow-card">
              <span className="font-label-md text-label-md text-primary">
                Our mission
              </span>
              <h2 className="mt-3 font-headline-lg text-headline-lg text-on-surface">
                Make consistent LinkedIn publishing feel easy
              </h2>
              <p className="mt-4 font-body-md text-body-md leading-relaxed text-on-surface-variant">
                We believe strong personal brands come from steady, thoughtful
                publishing. Boostedin helps users create content faster, plan
                ahead, and keep their voice intact while automation handles the
                repetitive work.
              </p>
              <p className="mt-4 font-body-md text-body-md leading-relaxed text-on-surface-variant">
                The product is designed around a simple promise: make the next
                post easier to ship than the last one.
              </p>
            </article>

            <div className="grid gap-4 sm:grid-cols-2">
              {values.map((value) => (
                <article
                  key={value.title}
                  className="rounded-3xl border border-outline-variant/70 bg-surface-container-lowest p-6 shadow-card"
                >
                  <h3 className="font-headline-md text-headline-md text-on-surface">
                    {value.title}
                  </h3>
                  <p className="mt-3 font-body-md text-body-md text-on-surface-variant">
                    {value.description}
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
