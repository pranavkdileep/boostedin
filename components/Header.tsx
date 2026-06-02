"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const navLinks = [
  { label: "Features", href: "#features" },
  { label: "Pricing", href: "#pricing" },
  { label: "Blog", href: "#blog" },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-300 px-margin-mobile md:px-margin-desktop ${
        scrolled ? "py-2" : "py-base mt-4"
      }`}
    >
      <div className="max-w-7xl mx-auto glass rounded-2xl px-6 py-3 shadow-card border border-surface-container-high flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <svg
            className="h-8 w-8"
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
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="font-label-md text-label-md text-on-surface-variant hover:text-primary transition-colors duration-200"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-4">
          <button className="font-label-md text-label-md text-on-surface-variant hover:text-primary transition-colors duration-200 cursor-pointer"
          
          onClick={()=>{
            window.location.href = "/auth";
          }}
          >
            Sign In
          </button>
          <button className="bg-primary-container text-on-primary px-6 py-2.5 rounded-lg font-label-md text-label-md hover:bg-primary transition-colors duration-200 flex items-center gap-2 group cursor-pointer"
          onClick={()=>{            window.location.href = "/auth";
          }}
          >
            Get Started
            <svg
              className="w-[18px] h-[18px] group-hover:translate-x-1 transition-transform"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </button>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden text-on-surface-variant cursor-pointer"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? (
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          ) : (
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden glass rounded-2xl mt-2 px-6 py-4 shadow-card border border-surface-container-high animate-fade-in-up">
          <div className="flex flex-col gap-3">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="font-label-md text-label-md text-on-surface-variant hover:text-primary transition-colors duration-200 py-1"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </a>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-surface-container-high flex flex-col gap-3">
            <button className="font-label-md text-label-md text-on-surface-variant hover:text-primary transition-colors duration-200 text-left cursor-pointer"
            onClick={()=>{              window.location.href = "/auth";
            }}
            >
              Sign In
            </button>
            <button className="bg-primary-container text-on-primary px-6 py-2.5 rounded-lg font-label-md text-label-md hover:bg-primary transition-colors duration-200 flex items-center gap-2 w-fit cursor-pointer"
            onClick={()=>{            window.location.href = "/auth";
            }}
            >
              Get Started
              <svg
                className="w-[18px] h-[18px]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
