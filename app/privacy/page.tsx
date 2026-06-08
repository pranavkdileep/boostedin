import type { Metadata } from "next";

import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Privacy Policy | Boostedin",
  description:
    "Read how Boostedin handles account information, authentication data, and usage details.",
};

const sections = [
  {
    title: "Information we collect",
    body: "We collect the information needed to provide the service, including your account details, LinkedIn profile information used during sign in, and any content or settings you choose to save in the app.",
  },
  {
    title: "How we use information",
    body: "We use information to authenticate you, operate the product, improve the user experience, and support features like scheduled publishing and account management.",
  },
  {
    title: "Data protection",
    body: "We store sensitive tokens using encryption at rest and use session cookies to keep you signed in securely. Access to account data is limited to the functionality required to run the product.",
  },
  {
    title: "Sharing",
    body: "We do not sell personal information. We only share data when necessary to provide the service, comply with the law, or work with service providers that support our infrastructure.",
  },
  {
    title: "Your choices",
    body: "You can request support for account questions, manage your profile in the dashboard, and stop using the service at any time. If you need help with your data, contact the team through support.",
  },
];

export default function PrivacyPage() {
  return (
    <>
      <Header />
      <main className="relative flex-1 overflow-hidden px-margin-mobile md:px-margin-desktop pt-32 pb-20">
        <div className="absolute top-[-10%] left-[-10%] h-96 w-96 rounded-full bg-primary-fixed opacity-50 blur-3xl animate-blob" />
        <div className="absolute top-[20%] right-[-10%] h-96 w-96 rounded-full bg-secondary-fixed opacity-50 blur-3xl animate-blob animation-delay-2000" />

        <div className="relative z-10 mx-auto flex max-w-4xl flex-col gap-10">
          <section className="rounded-3xl border border-outline-variant/70 bg-surface-container-lowest p-8 shadow-card">
            <span className="font-label-md text-label-md text-primary">
              Legal
            </span>
            <h1 className="mt-3 font-display-lg-mobile md:font-display-lg text-display-lg-mobile md:text-display-lg text-on-background leading-tight">
              Privacy Policy
            </h1>
            <p className="mt-4 font-body-lg text-body-lg text-on-surface-variant">
              This page explains how Boostedin handles information when you use
              the product.
            </p>
          </section>

          <div className="grid gap-4">
            {sections.map((section) => (
              <article
                key={section.title}
                className="rounded-3xl border border-outline-variant/70 bg-surface-container-lowest p-6 shadow-card"
              >
                <h2 className="font-headline-md text-headline-md text-on-surface">
                  {section.title}
                </h2>
                <p className="mt-3 font-body-md text-body-md leading-relaxed text-on-surface-variant">
                  {section.body}
                </p>
              </article>
            ))}
          </div>

          <section className="rounded-3xl border border-outline-variant/70 bg-surface-container-lowest p-6 shadow-card">
            <h2 className="font-headline-md text-headline-md text-on-surface">
              Contact
            </h2>
            <p className="mt-3 font-body-md text-body-md leading-relaxed text-on-surface-variant">
              If you have privacy questions or need help with your account,
              use the contact page or the support desk inside the dashboard.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
