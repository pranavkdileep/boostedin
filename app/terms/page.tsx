import type { Metadata } from "next";

import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Terms of Service | Boostedin",
  description:
    "Review the terms that apply when you use Boostedin, including subscriptions, account use, and acceptable behavior.",
};

const sections = [
  {
    title: "Using Boostedin",
    body: "You agree to use the service in a lawful and respectful way and to keep your account information accurate. You are responsible for activity that happens under your account.",
  },
  {
    title: "Credits and billing",
    body: "Credits are used to power content generation and posting. The product currently includes a monthly free credit allowance, and additional credits may be purchased or offered through the app as the product evolves.",
  },
  {
    title: "Content responsibility",
    body: "You are responsible for the content you create, schedule, and publish using Boostedin. Please review generated content before posting and make sure it follows the rules that apply to your account and audience.",
  },
  {
    title: "Service changes",
    body: "We may update, change, or discontinue features as needed to improve the product, stay secure, or support the business. We will try to make those changes in a way that is reasonable and clear.",
  },
  {
    title: "Limitation of liability",
    body: "Boostedin is provided on an as-is and as-available basis. We are not responsible for indirect losses, missed opportunities, or issues caused by third-party services outside our control.",
  },
];

export default function TermsPage() {
  return (
    <>
      <Header />
      <main className="relative flex-1 overflow-hidden px-margin-mobile md:px-margin-desktop pt-32 pb-20">
        <div className="absolute top-[-10%] left-[-10%] h-96 w-96 rounded-full bg-primary-fixed opacity-50 blur-3xl animate-blob" />
        <div className="absolute top-[20%] right-[-10%] h-96 w-96 rounded-full bg-tertiary-fixed opacity-40 blur-3xl animate-blob animation-delay-2000" />

        <div className="relative z-10 mx-auto flex max-w-4xl flex-col gap-10">
          <section className="rounded-3xl border border-outline-variant/70 bg-surface-container-lowest p-8 shadow-card">
            <span className="font-label-md text-label-md text-primary">
              Legal
            </span>
            <h1 className="mt-3 font-display-lg-mobile md:font-display-lg text-display-lg-mobile md:text-display-lg text-on-background leading-tight">
              Terms of Service
            </h1>
            <p className="mt-4 font-body-lg text-body-lg text-on-surface-variant">
              These terms explain the basic rules for using Boostedin.
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
              Questions
            </h2>
            <p className="mt-3 font-body-md text-body-md leading-relaxed text-on-surface-variant">
              If you have questions about these terms, contact the team through
              the contact page or the support desk after sign in.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
