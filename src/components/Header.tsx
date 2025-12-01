'use client';

import Link from 'next/link';
import { Gift, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#D4C5A9]/40 bg-[#F5F0E6]/95 backdrop-blur supports-[backdrop-filter]:bg-[#F5F0E6]/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="relative">
            <Gift className="h-8 w-8 text-[#1A3D2E] group-hover:scale-110 transition-transform" />
          </div>
          <span className="font-serif text-xl font-semibold text-[#1A3D2E]">
            Wrapped in Love Co.
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link
            href="/#how-it-works"
            className="text-sm font-medium text-[#4A6358] hover:text-[#1A3D2E] transition-colors"
          >
            How It Works
          </Link>
          <Link
            href="/#pricing"
            className="text-sm font-medium text-[#4A6358] hover:text-[#1A3D2E] transition-colors"
          >
            Pricing
          </Link>
          <Link
            href="/#faq"
            className="text-sm font-medium text-[#4A6358] hover:text-[#1A3D2E] transition-colors"
          >
            FAQ
          </Link>
          <Button asChild className="bg-[#1A3D2E] hover:bg-[#0F2A1F] text-[#E8DFC9]">
            <Link href="/book">Book Now</Link>
          </Button>
        </nav>

        {/* Mobile Menu Button */}
        <button
          type="button"
          className="md:hidden p-2"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? (
            <X className="h-6 w-6 text-[#1A3D2E]" />
          ) : (
            <Menu className="h-6 w-6 text-[#1A3D2E]" />
          )}
        </button>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#D4C5A9] bg-[#F5F0E6]">
          <nav className="container mx-auto flex flex-col gap-4 p-4">
            <Link
              href="/#how-it-works"
              className="text-sm font-medium py-2 text-[#1A3D2E]"
              onClick={() => setMobileMenuOpen(false)}
            >
              How It Works
            </Link>
            <Link
              href="/#pricing"
              className="text-sm font-medium py-2 text-[#1A3D2E]"
              onClick={() => setMobileMenuOpen(false)}
            >
              Pricing
            </Link>
            <Link
              href="/#faq"
              className="text-sm font-medium py-2 text-[#1A3D2E]"
              onClick={() => setMobileMenuOpen(false)}
            >
              FAQ
            </Link>
            <Button asChild className="bg-[#1A3D2E] hover:bg-[#0F2A1F] text-[#E8DFC9] w-full">
              <Link href="/book" onClick={() => setMobileMenuOpen(false)}>
                Book Now
              </Link>
            </Button>
          </nav>
        </div>
      )}
    </header>
  );
}
