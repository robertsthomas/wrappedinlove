import type { Metadata } from 'next';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { BookingForm } from '@/components/BookingForm';
import { Gift } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Book Your Wrapping | Wrapped in Love Co.',
  description:
    'Book your professional gift wrapping service. Choose your date, bag count, and payment method. We handle the rest!',
  openGraph: {
    title: 'Book Your Wrapping | Wrapped in Love Co.',
    description:
      'Book your professional gift wrapping service. Choose your date, bag count, and payment method.',
  },
};

export default function BookPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 py-12 bg-[#F5F0E6]">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            {/* Page Header */}
            <div className="text-center mb-10">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#1A3D2E]/10 mb-4">
                <Gift className="h-8 w-8 text-[#1A3D2E]" />
              </div>
              <h1 className="font-serif text-3xl md:text-4xl font-bold text-[#1A3D2E] mb-3">
                Book Your Wrapping Day
              </h1>
              <p className="text-[#4A6358] max-w-md mx-auto">
                Fill out the form below to schedule your gift wrapping service. We&apos;ll
                take care of the rest!
              </p>
            </div>

            {/* Booking Form */}
            <BookingForm />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
