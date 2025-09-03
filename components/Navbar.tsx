"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ThemeSwitcher } from "./theme-switcher";

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
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-b border-gray-100/50 shadow-luxury">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo with Link */}
          <Link 
            href="/agencies" 
            className="flex items-center hover:opacity-80 transition-all duration-300 group -ml-4" 
            onClick={closeMobileMenu}
          >
            <div className="relative">
              <Image
                src="/SLC-Logo.png"
                alt="SLC Logo"
                width={120}
                height={40}
                className="h-12 w-auto transition-transform duration-300 group-hover:scale-105"
                priority
              />
            </div>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center h-full">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`h-full flex items-center px-6 text-sm font-medium transition-all duration-300 ${
                  pathname === item.href
                    ? "text-luxury-gold bg-luxury-gold/10 border-b-2 border-luxury-gold"
                    : "text-luxury-navy hover:text-luxury-gold hover:bg-luxury-gold/5"
                }`}
              >
                {item.name}
              </Link>
            ))}
            <div className="ml-4">
              <ThemeSwitcher />
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center space-x-2">
            <ThemeSwitcher />
            <button
              type="button"
              className="p-3 text-luxury-navy hover:text-luxury-gold focus:outline-none transition-colors duration-200"
              aria-label="Toggle menu"
              onClick={toggleMobileMenu}
            >
              {isMobileMenuOpen ? (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-100/50 py-6 bg-white/95 backdrop-blur-xl animate-slide-up">
            <div className="flex flex-col space-y-1">
              {menuItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-6 py-4 text-base font-medium transition-all duration-200 rounded-lg ${
                    pathname === item.href
                      ? "text-luxury-gold bg-luxury-gold/10 border-l-4 border-luxury-gold"
                      : "text-luxury-navy hover:text-luxury-gold hover:bg-luxury-gold/5"
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