import Link from "next/link";

const productLinks = [
  { label: "Features", href: "#features" },
  { label: "Pricing", href: "#pricing" },
  { label: "Templates", href: "#templates" },
];

const companyLinks = [
  { label: "About Us", href: "#about" },
  { label: "Careers", href: "#careers" },
  { label: "Contact", href: "#contact" },
];

const legalLinks = [
  { label: "Privacy Policy", href: "#privacy" },
  { label: "Terms of Service", href: "#terms" },
];

export default function Footer() {
  return (
    <footer className="bg-surface-container border-t border-outline-variant py-xl mt-20">
      <div className="max-w-7xl mx-auto px-margin-desktop grid grid-cols-2 md:grid-cols-4 gap-gutter">
        {/* Brand */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <svg
              className="h-6 w-6"
              viewBox="0 0 32 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect width="32" height="32" rx="8" fill="#0a66c2" />
              <path
                d="M10 22V10h4l4 6 4-6h4v12h-4v-7l-4 5-4-5v7z"
                fill="white"
              />
            </svg>
            <span className="font-headline-md font-bold text-primary">
              Boostedin
            </span>
          </div>
          <p className="font-body-md text-body-md text-on-surface-variant">
            &copy; {new Date().getFullYear()} Boostedin. All rights reserved.
          </p>
          <div className="flex gap-4 mt-2">
            <a
              href="#"
              className="text-on-surface-variant hover:text-primary transition-colors"
              aria-label="Website"
            >
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
                  d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5a17.92 17.92 0 0 1-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418"
                />
              </svg>
            </a>
            <a
              href="#"
              className="text-on-surface-variant hover:text-primary transition-colors"
              aria-label="Share"
            >
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
                  d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z"
                />
              </svg>
            </a>
          </div>
        </div>

        {/* Product */}
        <div className="flex flex-col gap-3">
          <h4 className="font-label-md font-bold text-on-surface">Product</h4>
          {productLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Company */}
        <div className="flex flex-col gap-3">
          <h4 className="font-label-md font-bold text-on-surface">Company</h4>
          {companyLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Legal */}
        <div className="flex flex-col gap-3">
          <h4 className="font-label-md font-bold text-on-surface">Legal</h4>
          {legalLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
