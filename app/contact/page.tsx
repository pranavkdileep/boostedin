import type { Metadata } from "next";
import Link from "next/link";

import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Contact Boostedin",
  description:
    "Find the best way to reach the Boostedin team for support, questions, or partnerships.",
};

const contactOptions = [
  {
    title: "Support",
    description:
      "If you are already signed in, the support desk is the fastest way to get help.",
    href: "/dash/support",
    label: "Open Support",
  },
  {
    title: "Account help",
    description:
      "Need to manage your profile or posting setup? Sign in and continue from the dashboard.",
    href: "/auth",
    label: "Sign In",
  },
  {
    title: "Pricing",
    description:
      "Want to understand credits before getting started? Review the pricing section on the home page.",
    href: "/#pricing",
    label: "View Pricing",
  },
];

export default function ContactPage() {
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
                Contact
              </span>
              <h1 className="font-display-lg-mobile md:font-display-lg text-display-lg-mobile md:text-display-lg text-on-background leading-tight">
                Talk to the team behind Boostedin.
              </h1>
              <p className="w-full max-w-2xl text-pretty font-body-lg text-body-lg text-on-surface-variant">
                The fastest way to reach us is through the support area once
                you are signed in. That keeps account questions, product
                feedback, and publishing issues in one place.
              </p>

              <div className="flex flex-wrap gap-3">
                <Link
                  href="/dash/support"
                  className="bg-purple-gradient inline-flex min-h-12 items-center justify-center rounded-xl px-6 py-3 font-label-md text-label-md text-on-primary shadow-[0_10px_24px_rgba(124,58,237,0.22)] transition-all duration-200 hover:-translate-y-0.5"
                >
                  Open Support
                </Link>
                <Link
                  href="/auth"
                  className="inline-flex min-h-12 items-center justify-center rounded-xl border border-outline-variant/70 bg-surface-container-lowest px-6 py-3 font-label-md text-label-md text-on-surface transition-colors hover:border-primary hover:text-primary"
                >
                  Sign In
                </Link>
              </div>
            </div>

            <div className="rounded-3xl border border-outline-variant/70 bg-surface-container-lowest p-8 shadow-card">
              <span className="font-label-md text-label-md text-primary">
                Best path
              </span>
              <h2 className="mt-3 font-headline-lg text-headline-lg text-on-surface">
                Use the dashboard support desk for the quickest reply
              </h2>
              <p className="mt-4 font-body-md text-body-md leading-relaxed text-on-surface-variant">
                Once you are signed in, support requests stay attached to your
                account so we can help you faster and keep the conversation in
                context.
              </p>
              <div className="mt-6 rounded-2xl bg-surface-container-low p-4">
                <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-[0.18em]">
                  Tip
                </p>
                <p className="mt-2 font-body-md text-body-md text-on-surface">
                  If you are just exploring, start from the home page or sign
                  in and jump directly to support.
                </p>
              </div>
            </div>
          </section>

          <section>
            <div className="mb-8 flex flex-col gap-4">
              <span className="font-label-md text-label-md text-primary">
                Contact options
              </span>
              <h2 className="font-display-md-mobile md:font-display-md text-display-md-mobile md:text-display-md text-on-background">
                Choose the right starting point
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              {contactOptions.map((option) => (
                <article
                  key={option.title}
                  className="rounded-3xl border border-outline-variant/70 bg-surface-container-lowest p-6 shadow-card"
                >
                  <h3 className="font-headline-md text-headline-md text-on-surface">
                    {option.title}
                  </h3>
                  <p className="mt-3 font-body-md text-body-md text-on-surface-variant">
                    {option.description}
                  </p>
                  <Link
                    href={option.href}
                    className="mt-5 inline-flex font-label-md text-label-md text-primary transition-colors hover:text-secondary"
                  >
                    {option.label}
                  </Link>
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
