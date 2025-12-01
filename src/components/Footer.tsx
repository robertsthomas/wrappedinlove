import Link from 'next/link';
import { Gift, Mail, Phone, MapPin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-[#1A3D2E] text-[#E8DFC9]/90">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <Gift className="h-7 w-7 text-[#C9A962]" />
              <span className="font-serif text-xl font-semibold text-[#E8DFC9]">
                Wrapped in Love Co.
              </span>
            </Link>
            <p className="text-[#E8DFC9]/70 text-sm leading-relaxed">
              Gift wrapping with a personal touch. Just a mom who loves wrapping and wants to help out during the busy season!
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-serif text-lg font-semibold text-[#C9A962]">Quick Links</h3>
            <nav className="flex flex-col gap-2">
              <Link href="/#how-it-works" className="text-sm text-[#E8DFC9]/70 hover:text-[#E8DFC9] transition-colors">
                How It Works
              </Link>
              <Link href="/#pricing" className="text-sm text-[#E8DFC9]/70 hover:text-[#E8DFC9] transition-colors">
                Pricing
              </Link>
              <Link href="/#faq" className="text-sm text-[#E8DFC9]/70 hover:text-[#E8DFC9] transition-colors">
                FAQ
              </Link>
              <Link href="/book" className="text-sm text-[#E8DFC9]/70 hover:text-[#E8DFC9] transition-colors">
                Book Now
              </Link>
            </nav>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h3 className="font-serif text-lg font-semibold text-[#C9A962]">Contact Us</h3>
            <div className="space-y-3">
              <a
                href="mailto:hello@wrappedinloveco.com"
                className="flex items-center gap-2 text-sm text-[#E8DFC9]/70 hover:text-[#E8DFC9] transition-colors"
              >
                <Mail className="h-4 w-4 text-[#C9A962]" />
                hello@wrappedinloveco.com
              </a>
              <a
                href="tel:+15551234567"
                className="flex items-center gap-2 text-sm text-[#E8DFC9]/70 hover:text-[#E8DFC9] transition-colors"
              >
                <Phone className="h-4 w-4 text-[#C9A962]" />
                (555) 123-4567
              </a>
              <div className="flex items-start gap-2 text-sm text-[#E8DFC9]/70">
                <MapPin className="h-4 w-4 text-[#C9A962] mt-0.5 flex-shrink-0" />
                <span>
                  Serving Oakleaf, Argyle & Eagle Landing
                  <br />
                  <span className="text-[#E8DFC9]/50">Jacksonville, FL</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-[#E8DFC9]/10 text-center text-sm text-[#E8DFC9]/50">
          <p>© {new Date().getFullYear()} Wrapped in Love Co. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
