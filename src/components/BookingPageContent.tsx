'use client';

import { useState, useEffect } from 'react';
import { Gift, Bell, Loader2, CheckCircle, Mail, Phone } from 'lucide-react';
import { toast } from 'sonner';
import { BookingForm } from '@/components/BookingForm';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';

export function BookingPageContent() {
  const [isLoading, setIsLoading] = useState(true);
  const [bookingsEnabled, setBookingsEnabled] = useState(true);
  const [waitlistForm, setWaitlistForm] = useState({ email: '', phone: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOnWaitlist, setIsOnWaitlist] = useState(false);

  useEffect(() => {
    async function checkBookingStatus() {
      try {
        const res = await fetch('/api/settings/bookings');
        const data = await res.json();
        setBookingsEnabled(data.enabled);
      } catch (error) {
        console.error('Failed to check booking status:', error);
        // Default to enabled on error
        setBookingsEnabled(true);
      } finally {
        setIsLoading(false);
      }
    }
    checkBookingStatus();
  }, []);

  const handleWaitlistSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!waitlistForm.email && !waitlistForm.phone) {
      toast.error('Please provide an email or phone number');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(waitlistForm),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Failed to join waitlist');
        return;
      }

      setIsOnWaitlist(true);
      toast.success(data.message);
    } catch (error) {
      console.error('Waitlist error:', error);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-forest" />
      </div>
    );
  }

  // Bookings are closed - show waitlist form
  if (!bookingsEnabled) {
    return (
      <div className="max-w-xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gold/20 mb-6">
            <Gift className="h-10 w-10 text-forest" />
          </div>
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-forest mb-4">
            We&apos;re Fully Booked!
          </h1>
          <p className="text-forest/70 text-lg max-w-md mx-auto">
            Thank you for your interest! We&apos;re currently at capacity, but we&apos;d love to 
            wrap your gifts when spots open up.
          </p>
        </div>

        {/* Waitlist Card */}
        <Card className="border-cream-dark shadow-lg">
          <CardContent className="p-8">
            {isOnWaitlist ? (
              <div className="text-center py-6">
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h2 className="font-serif text-2xl font-semibold text-forest mb-2">
                  You&apos;re on the List!
                </h2>
                <p className="text-forest/70">
                  We&apos;ll notify you as soon as spots open up. Thank you for your patience!
                </p>
              </div>
            ) : (
              <>
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-forest/10 mb-3">
                    <Bell className="h-6 w-6 text-forest" />
                  </div>
                  <h2 className="font-serif text-xl font-semibold text-forest mb-2">
                    Get Notified
                  </h2>
                  <p className="text-forest/60 text-sm">
                    Leave your contact info and we&apos;ll let you know when booking reopens.
                  </p>
                </div>

                <form onSubmit={handleWaitlistSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="waitlist-email" className="text-forest flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email
                    </Label>
                    <Input
                      id="waitlist-email"
                      type="email"
                      value={waitlistForm.email}
                      onChange={(e) => setWaitlistForm({ ...waitlistForm, email: e.target.value })}
                      placeholder="your@email.com"
                      className="border-cream-dark"
                    />
                  </div>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-cream-dark" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white px-2 text-forest/40">or</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="waitlist-phone" className="text-forest flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Phone
                    </Label>
                    <Input
                      id="waitlist-phone"
                      type="tel"
                      value={waitlistForm.phone}
                      onChange={(e) => setWaitlistForm({ ...waitlistForm, phone: e.target.value.replace(/[^\d\s()\-+.]/g, '') })}
                      placeholder="(555) 123-4567"
                      className="border-cream-dark"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting || (!waitlistForm.email && !waitlistForm.phone)}
                    className="w-full bg-forest hover:bg-forest/90 text-cream py-6 text-lg rounded-full mt-6"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Joining...
                      </>
                    ) : (
                      <>
                        <Bell className="mr-2 h-5 w-5" />
                        Notify Me When Spots Open
                      </>
                    )}
                  </Button>
                </form>
              </>
            )}
          </CardContent>
        </Card>

        {/* Additional Info */}
        <div className="text-center mt-8 text-forest/50 text-sm">
          <p>Questions? Contact us at{' '}
            <a href="mailto:hello@wrappedinlove.co" className="underline hover:text-forest">
              hello@wrappedinlove.co
            </a>
          </p>
        </div>
      </div>
    );
  }

  // Bookings are open - show normal form
  return (
    <div className="max-w-2xl mx-auto">
      {/* Page Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-forest/10 mb-4">
          <Gift className="h-8 w-8 text-forest" />
        </div>
        <h1 className="font-serif text-3xl md:text-4xl font-bold text-forest mb-3">
          Book Your Wrapping Day
        </h1>
        <p className="text-forest/70 max-w-md mx-auto">
          Fill out the form below to schedule your gift wrapping service. We&apos;ll
          take care of the rest!
        </p>
      </div>

      {/* Booking Form */}
      <BookingForm />
    </div>
  );
}

