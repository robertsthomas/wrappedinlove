import type { Metadata } from 'next';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { BookingPageContent } from '@/components/BookingPageContent';

export const metadata: Metadata = {
  title: 'Book Your Wrapping | Wrapped in Love Co.',
  description:
    'Book your gift wrapping service. Choose your date, bag count, and payment method. We handle the rest!',
  openGraph: {
    title: 'Book Your Wrapping | Wrapped in Love Co.',
    description:
      'Book your gift wrapping service. Choose your date, bag count, and payment method.',
  },
};

export default function BookPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 py-12 bg-cream">
        <div className="container mx-auto px-4">
          <BookingPageContent />
        </div>
      </main>

      <Footer />
    </div>
  );
}
