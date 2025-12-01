'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { format, parseISO } from 'date-fns';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  CheckCircle2,
  Gift,
  Calendar,
  Clock,
  Package,
  MapPin,
  CreditCard,
  Wallet,
  Home,
  Loader2,
} from 'lucide-react';
import type { Booking } from '@/types/booking';
import { SERVICE_TYPE_LABELS, TIME_WINDOW_LABELS, STATUS_LABELS } from '@/types/booking';

function SuccessContent() {
  const searchParams = useSearchParams();
  const bookingId = searchParams.get('booking');
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cashAppHandle = process.env.NEXT_PUBLIC_CASHAPP_HANDLE || '$YourCashApp';
  const venmoHandle = process.env.NEXT_PUBLIC_VENMO_HANDLE || '@YourVenmo';

  useEffect(() => {
    async function fetchBooking() {
      if (!bookingId) {
        setError('No booking ID provided');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/bookings/${bookingId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch booking');
        }
        const data = await response.json();
        setBooking(data.booking);
      } catch (err) {
        console.error('Error fetching booking:', err);
        setError('Could not load booking details');
      } finally {
        setLoading(false);
      }
    }

    fetchBooking();
  }, [bookingId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-[#1A3D2E]" />
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="text-center py-20">
        <Gift className="h-16 w-16 text-[#4A6358] mx-auto mb-4" />
        <h2 className="font-serif text-2xl font-bold text-[#1A3D2E] mb-2">
          Booking Not Found
        </h2>
        <p className="text-[#4A6358] mb-6">
          {error || 'We could not find your booking details.'}
        </p>
        <Button asChild className="bg-[#1A3D2E] hover:bg-[#0F2A1F] text-[#E8DFC9]">
          <Link href="/">
            <Home className="mr-2 h-4 w-4" />
            Go Home
          </Link>
        </Button>
      </div>
    );
  }

  const isPaid = booking.status === 'paid';
  const isOfflinePayment = booking.payment_method === 'offline';

  return (
    <div className="max-w-2xl mx-auto">
      {/* Success Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#1A3D2E]/10 mb-6">
          <CheckCircle2 className="h-10 w-10 text-[#1A3D2E]" />
        </div>
        <h1 className="font-serif text-3xl md:text-4xl font-bold text-[#1A3D2E] mb-3">
          {isPaid ? 'Booking Confirmed!' : 'Booking Received!'}
        </h1>
        <p className="text-[#4A6358] max-w-md mx-auto">
          {isPaid
            ? 'Thank you for your payment! Your gift wrapping session is confirmed.'
            : 'Your booking has been received. Please complete payment at pickup/dropoff.'}
        </p>
      </div>

      {/* Booking Summary Card */}
      <Card className="mb-8 overflow-hidden border-[#D4C5A9]">
        <div className="bg-[#1A3D2E] p-4">
          <h2 className="font-serif text-xl font-semibold text-[#E8DFC9] flex items-center gap-2">
            <Gift className="h-5 w-5 text-[#C9A962]" />
            Booking Details
          </h2>
        </div>
        <CardContent className="p-6 space-y-4">
          {/* Customer Info */}
          <div>
            <h3 className="font-semibold text-[#1A3D2E] mb-1">{booking.customer_name}</h3>
            <p className="text-sm text-[#4A6358]">{booking.email}</p>
            <p className="text-sm text-[#4A6358]">{booking.phone}</p>
          </div>

          <hr className="border-[#D4C5A9]" />

          {/* Service Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-[#1A3D2E] mt-0.5" />
              <div>
                <p className="text-sm text-[#4A6358]">Date</p>
                <p className="font-medium text-[#1A3D2E]">
                  {format(parseISO(booking.date), 'EEEE, MMMM d, yyyy')}
                </p>
              </div>
            </div>

            {booking.time_window && (
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-[#1A3D2E] mt-0.5" />
                <div>
                  <p className="text-sm text-[#4A6358]">Time Window</p>
                  <p className="font-medium text-[#1A3D2E]">
                    {TIME_WINDOW_LABELS[booking.time_window]}
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-start gap-3">
              <Package className="h-5 w-5 text-[#1A3D2E] mt-0.5" />
              <div>
                <p className="text-sm text-[#4A6358]">Bags</p>
                <p className="font-medium text-[#1A3D2E]">
                  {booking.bag_count} {booking.bag_count === 1 ? 'bag' : 'bags'}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Gift className="h-5 w-5 text-[#1A3D2E] mt-0.5" />
              <div>
                <p className="text-sm text-[#4A6358]">Service Type</p>
                <p className="font-medium text-[#1A3D2E]">
                  {SERVICE_TYPE_LABELS[booking.service_type]}
                </p>
              </div>
            </div>
          </div>

          {/* Address */}
          {booking.address_line1 && (
            <>
              <hr className="border-[#D4C5A9]" />
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-[#1A3D2E] mt-0.5" />
                <div>
                  <p className="text-sm text-[#4A6358]">Address</p>
                  <p className="font-medium text-[#1A3D2E]">
                    {booking.address_line1}
                    <br />
                    {booking.city}, {booking.state} {booking.zip}
                  </p>
                </div>
              </div>
            </>
          )}

          {/* Notes */}
          {booking.notes && (
            <>
              <hr className="border-[#D4C5A9]" />
              <div>
                <p className="text-sm text-[#4A6358] mb-1">Special Instructions</p>
                <p className="text-[#1A3D2E] bg-[#E8DFC9] p-3 rounded-lg text-sm">
                  {booking.notes}
                </p>
              </div>
            </>
          )}

          <hr className="border-[#D4C5A9]" />

          {/* Payment & Total */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {booking.payment_method === 'stripe' ? (
                <CreditCard className="h-5 w-5 text-[#1A3D2E]" />
              ) : (
                <Wallet className="h-5 w-5 text-[#1A3D2E]" />
              )}
              <span className="text-sm text-[#4A6358]">
                {booking.payment_method === 'stripe' ? 'Paid Online' : 'Pay Later'}
              </span>
            </div>
            <Badge
              variant={isPaid ? 'default' : 'secondary'}
              className={
                isPaid ? 'bg-[#1A3D2E] hover:bg-[#1A3D2E] text-[#E8DFC9]' : 'bg-[#C9A962] text-[#1A3D2E]'
              }
            >
              {STATUS_LABELS[booking.status]}
            </Badge>
          </div>

          <div className="bg-[#1A3D2E] text-[#E8DFC9] p-4 rounded-lg -mx-2">
            <div className="flex justify-between items-center">
              <span className="font-medium">Estimated Total</span>
              <span className="text-2xl font-bold">${booking.estimated_total}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Next Steps */}
      <Card className="mb-8 border-[#D4C5A9]">
        <CardContent className="p-6">
          <h3 className="font-serif text-xl font-semibold text-[#1A3D2E] mb-4">
            What&apos;s Next?
          </h3>
          <ul className="space-y-3 text-[#4A6358]">
            {isOfflinePayment && (
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-[#C9A962]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-[#C9A962]">1</span>
                </div>
                <span>
                  <strong className="text-[#1A3D2E]">Prepare payment:</strong> Have Cash App (
                  {cashAppHandle}), Venmo ({venmoHandle}), or cash ready for pickup/dropoff.
                </span>
              </li>
            )}
            <li className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-[#1A3D2E]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-[#1A3D2E]">
                  {isOfflinePayment ? '2' : '1'}
                </span>
              </div>
              <span>
                <strong className="text-[#1A3D2E]">Gather your gifts:</strong> Place unwrapped
                items in 13-gallon kitchen bags.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-[#1A3D2E]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-[#1A3D2E]">
                  {isOfflinePayment ? '3' : '2'}
                </span>
              </div>
              <span>
                <strong className="text-[#1A3D2E]">We&apos;ll be in touch:</strong> Expect a
                confirmation call or text with drop-off details.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-[#C9A962]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-[#C9A962]">
                  {isOfflinePayment ? '4' : '3'}
                </span>
              </div>
              <span>
                <strong className="text-[#1A3D2E]">3-day turnaround:</strong> Your beautifully
                wrapped gifts will be ready within 3 days!
              </span>
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button asChild variant="outline" size="lg" className="border-[#D4C5A9]">
          <Link href="/">
            <Home className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
        </Button>
        <Button asChild size="lg" className="bg-[#1A3D2E] hover:bg-[#0F2A1F] text-[#E8DFC9]">
          <Link href="/book">
            <Gift className="mr-2 h-4 w-4" />
            Book Another Session
          </Link>
        </Button>
      </div>
    </div>
  );
}

export default function SuccessPage() {
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
            <SuccessContent />
          </Suspense>
        </div>
      </main>

      <Footer />
    </div>
  );
}
