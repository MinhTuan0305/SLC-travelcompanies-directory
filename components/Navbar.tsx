"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";

export default function Navbar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const menuItems = [
    { name: "Home Page", href: "/agencies" },
    { name: "Dashboard", href: "/dashboard" },
    { name: "Map View", href: "/map" },
    { name: "Store Locator", href: "/stores" },
    { name: "How to use", href: "/how-to-use" },
  ];

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="bg-white shadow-sm border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo with Link */}
          <Link href="/agencies" className="flex items-center space-x-2 hover:opacity-80 transition-opacity" onClick={closeMobileMenu}>
            <Image
              src="/SLC-Logo.png"
              alt="SLC Logo"
              width={120}
              height={40}
              className="h-10 w-auto"
              priority
            />
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-1">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-4 py-2 rounded-lg uppercase text-sm font-semibold transition-all duration-200 ${
                  pathname === item.href
                    ? "text-sky-600 bg-sky-50 border border-sky-200"
                    : "text-gray-600 hover:text-sky-600 hover:bg-sky-50/50"
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              type="button"
              className="text-gray-600 hover:text-sky-600 focus:outline-none focus:text-sky-600 transition-colors"
              aria-label="Toggle menu"
              onClick={toggleMobileMenu}
            >
              {isMobileMenuOpen ? (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 py-2 bg-white">
            <div className="flex flex-col space-y-1">
              {menuItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-4 py-2 rounded-lg uppercase text-sm font-semibold transition-all duration-200 ${
                    pathname === item.href
                      ? "text-sky-600 bg-sky-50 border border-sky-200"
                      : "text-gray-600 hover:text-sky-600 hover:bg-sky-50/50"
                  }`}
                  onClick={closeMobileMenu}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}