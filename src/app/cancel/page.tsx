'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { format, parseISO } from 'date-fns';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  XCircle,
  Gift,
  Calendar,
  Package,
  Home,
  RefreshCw,
  Mail,
  Loader2,
} from 'lucide-react';
import { useBooking } from '@/hooks/useBookings';
import { SERVICE_TYPE_LABELS } from '@/types/booking';

function CancelContent() {
  const searchParams = useSearchParams();
  const bookingId = searchParams.get('booking');

  const { data: booking, isLoading } = useBooking(bookingId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-[#1A3D2E]" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Cancel Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-100 mb-6">
          <XCircle className="h-10 w-10 text-red-500" />
        </div>
        <h1 className="font-serif text-3xl md:text-4xl font-bold text-[#1A3D2E] mb-3">
          Payment Canceled
        </h1>
        <p className="text-[#4A6358] max-w-md mx-auto">
          Your payment was not completed. Don&apos;t worry—no charges were made to your card.
        </p>
      </div>

      {/* Booking Summary (if available) */}
      {booking && (
        <Card className="mb-8 overflow-hidden border-[#D4C5A9]">
          <div className="bg-[#E8DFC9] border-b border-[#D4C5A9] p-4">
            <h2 className="font-serif text-lg font-semibold text-[#1A3D2E] flex items-center gap-2">
              <Gift className="h-5 w-5 text-[#1A3D2E]" />
              Your Pending Booking
            </h2>
          </div>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div>
                <p className="font-semibold text-[#1A3D2E]">{booking.customer_name}</p>
                {booking.email && <p className="text-sm text-[#4A6358]">{booking.email}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-start gap-2">
                  <Calendar className="h-4 w-4 text-[#1A3D2E] mt-0.5" />
                  <div>
                    <p className="text-xs text-[#4A6358]">Date</p>
                    <p className="text-sm font-medium text-[#1A3D2E]">
                      {format(parseISO(booking.date), 'MMM d, yyyy')}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Package className="h-4 w-4 text-[#1A3D2E] mt-0.5" />
                  <div>
                    <p className="text-xs text-[#4A6358]">Bags</p>
                    <p className="text-sm font-medium text-[#1A3D2E]">
                      {booking.bag_count} {booking.bag_count === 1 ? 'bag' : 'bags'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2 col-span-2">
                  <Gift className="h-4 w-4 text-[#1A3D2E] mt-0.5" />
                  <div>
                    <p className="text-xs text-[#4A6358]">Service</p>
                    <p className="text-sm font-medium text-[#1A3D2E]">
                      {SERVICE_TYPE_LABELS[booking.service_type]}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-[#C9A962]/20 text-[#1A3D2E] p-4 rounded-lg text-center">
                <p className="font-semibold text-lg">${booking.estimated_total}</p>
                <p className="text-xs text-[#4A6358]">Estimated Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Info Card */}
      <Card className="mb-8 border-[#D4C5A9]">
        <CardContent className="p-6">
          <h3 className="font-serif text-lg font-semibold text-[#1A3D2E] mb-3">
            What happened?
          </h3>
          <p className="text-[#4A6358] text-sm mb-4">
            The payment was canceled before completion. This could happen if:
          </p>
          <ul className="space-y-2 text-sm text-[#4A6358] mb-4">
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#1A3D2E]" />
              You clicked the back button or closed the payment window
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#1A3D2E]" />
              The payment session expired
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#1A3D2E]" />
              There was an issue with your payment method
            </li>
          </ul>
          <p className="text-sm text-[#1A3D2E] font-medium">
            Your booking is still saved—you can try again or contact us for help.
          </p>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex flex-col gap-4">
        <Button asChild size="lg" className="bg-[#1A3D2E] hover:bg-[#0F2A1F] text-[#E8DFC9]">
          <Link href="/book">
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Booking Again
          </Link>
        </Button>

        <div className="flex flex-col sm:flex-row gap-4">
          <Button asChild variant="outline" size="lg" className="flex-1 border-[#D4C5A9]">
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="flex-1 border-[#D4C5A9]">
            <a href="mailto:hello@wrappedinloveco.com">
              <Mail className="mr-2 h-4 w-4" />
              Contact Us
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function CancelPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 py-12 bg-[#F5F0E6]">
        <div className="container mx-auto px-4">
          <Suspense
            fallback={
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-[#1A3D2E]" />
              </div>
            }
          >
            <CancelContent />
          </Suspense>
        </div>
      </main>

      <Footer />
    </div>
  );
}
