import Link from "next/link";

const productLinks = [
  { label: "Features", href: "/#features" },
  { label: "Pricing", href: "/#pricing" },
];

const companyLinks = [
  { label: "About Us", href: "/about" },
  { label: "Careers", href: "/careers" },
  { label: "Contact", href: "/contact" },
];

const legalLinks = [
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Service", href: "/terms" },
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
