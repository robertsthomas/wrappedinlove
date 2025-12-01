'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { format, addDays, isBefore, isAfter, startOfDay } from 'date-fns';
import { toast } from 'sonner';
import { CalendarIcon, Loader2, CreditCard, Wallet, Minus, Plus, Info } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';

import type { BookingFormSubmission, ServiceType, TimeWindow, PaymentMethod } from '@/types/booking';
import { SERVICE_TYPE_LABELS, TIME_WINDOW_LABELS } from '@/types/booking';

const PRICE_PER_BAG = 35;
const BOOKING_WINDOW_START = 1;
const BOOKING_WINDOW_END = 45;

interface FormErrors {
  [key: string]: string;
}

export function BookingForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  // Form state
  const [customerName, setCustomerName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [addressLine1, setAddressLine1] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zip, setZip] = useState('');
  const [serviceType, setServiceType] = useState<ServiceType>('dropoff_pickup');
  const [date, setDate] = useState<Date | undefined>();
  const [timeWindow, setTimeWindow] = useState<TimeWindow>(null);
  const [bagCount, setBagCount] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('stripe');
  const [notes, setNotes] = useState('');

  const pickupDeliveryFee = Number(process.env.NEXT_PUBLIC_PICKUP_DELIVERY_FEE || 15);
  const cashAppHandle = process.env.NEXT_PUBLIC_CASHAPP_HANDLE || '$YourCashApp';
  const venmoHandle = process.env.NEXT_PUBLIC_VENMO_HANDLE || '@YourVenmo';

  // Calculate if service requires pickup/delivery
  const requiresPickupDelivery = serviceType === 'pickup_delivery' || serviceType === 'dropoff_pickup';
  const requiresAddress = serviceType !== 'dropoff_only';

  // Calculate total
  const estimatedTotal = useMemo(() => {
    const bagTotal = bagCount * PRICE_PER_BAG;
    const fee = requiresPickupDelivery ? pickupDeliveryFee : 0;
    return bagTotal + fee;
  }, [bagCount, requiresPickupDelivery, pickupDeliveryFee]);

  // Date constraints
  const minDate = addDays(startOfDay(new Date()), BOOKING_WINDOW_START);
  const maxDate = addDays(startOfDay(new Date()), BOOKING_WINDOW_END);

  const isDateDisabled = (date: Date) => {
    const day = startOfDay(date);
    return isBefore(day, minDate) || isAfter(day, maxDate);
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!customerName.trim()) {
      newErrors.customerName = 'Name is required';
    }

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[\d\s\-\(\)\+]{10,}$/.test(phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    if (requiresAddress) {
      if (!addressLine1.trim()) {
        newErrors.addressLine1 = 'Address is required for this service type';
      }
      if (!city.trim()) {
        newErrors.city = 'City is required';
      }
      if (!state.trim()) {
        newErrors.state = 'State is required';
      }
      if (!zip.trim()) {
        newErrors.zip = 'ZIP code is required';
      }
    }

    if (!date) {
      newErrors.date = 'Please select a date';
    }

    if (bagCount < 1) {
      newErrors.bagCount = 'At least 1 bag is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setIsSubmitting(true);

    try {
      const bookingData: BookingFormSubmission = {
        customer_name: customerName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        address_line1: addressLine1.trim() || undefined,
        city: city.trim() || undefined,
        state: state.trim() || undefined,
        zip: zip.trim() || undefined,
        service_type: serviceType,
        date: format(date!, 'yyyy-MM-dd'),
        time_window: timeWindow,
        bag_count: bagCount,
        payment_method: paymentMethod,
        notes: notes.trim() || undefined,
      };

      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create booking');
      }

      if (paymentMethod === 'stripe' && result.checkoutUrl) {
        // Redirect to Stripe Checkout
        window.location.href = result.checkoutUrl;
      } else {
        // Offline payment - redirect to success page
        router.push(`/success?booking=${result.booking.id}`);
      }
    } catch (error) {
      console.error('Booking error:', error);
      toast.error(error instanceof Error ? error.message : 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Customer Information */}
      <Card className="border-[#D4C5A9]">
        <CardContent className="p-6 space-y-4">
          <h3 className="font-serif text-xl font-semibold text-[#1A3D2E]">
            Your Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="customerName">Full Name *</Label>
              <Input
                id="customerName"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Jane Doe"
                className={errors.customerName ? 'border-red-500' : 'border-[#D4C5A9]'}
              />
              {errors.customerName && (
                <p className="text-sm text-red-500">{errors.customerName}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jane@example.com"
                className={errors.email ? 'border-red-500' : 'border-[#D4C5A9]'}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email}</p>
              )}
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(555) 123-4567"
                className={errors.phone ? 'border-red-500' : 'border-[#D4C5A9]'}
              />
              {errors.phone && (
                <p className="text-sm text-red-500">{errors.phone}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Service Type */}
      <Card className="border-[#D4C5A9]">
        <CardContent className="p-6 space-y-4">
          <h3 className="font-serif text-xl font-semibold text-[#1A3D2E]">
            Service Type
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {(Object.entries(SERVICE_TYPE_LABELS) as [ServiceType, string][]).map(
              ([type, label]) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setServiceType(type)}
                  className={`p-4 rounded-lg border-2 text-left transition-all ${
                    serviceType === type
                      ? 'border-[#1A3D2E] bg-[#1A3D2E]/5'
                      : 'border-[#D4C5A9] hover:border-[#1A3D2E]/50'
                  }`}
                >
                  <span className="font-medium text-[#1A3D2E]">{label}</span>
                  {type === 'dropoff_only' ? (
                    <span className="block text-xs text-[#1A3D2E] mt-1 font-medium">
                      Free!
                    </span>
                  ) : (type === 'pickup_delivery' || type === 'dropoff_pickup') ? (
                    <span className="block text-xs text-[#4A6358] mt-1">
                      +${pickupDeliveryFee} delivery fee
                    </span>
                  ) : null}
                </button>
              )
            )}
          </div>

          <div className="flex items-start gap-2 text-sm text-[#4A6358] bg-[#E8DFC9] p-3 rounded-lg">
            <Info className="h-4 w-4 mt-0.5 flex-shrink-0 text-[#1A3D2E]" />
            <p>
              <strong className="text-[#1A3D2E]">Free drop-off</strong> at our home in the Oakleaf/Argyle area. 
              We&apos;ll give you the address after booking!
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Address (conditional) */}
      {requiresAddress && (
        <Card className="border-[#D4C5A9]">
          <CardContent className="p-6 space-y-4">
            <h3 className="font-serif text-xl font-semibold text-[#1A3D2E]">
              Address for Pickup/Delivery
            </h3>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="addressLine1">Street Address *</Label>
                <Input
                  id="addressLine1"
                  value={addressLine1}
                  onChange={(e) => setAddressLine1(e.target.value)}
                  placeholder="123 Main Street"
                  className={errors.addressLine1 ? 'border-red-500' : 'border-[#D4C5A9]'}
                />
                {errors.addressLine1 && (
                  <p className="text-sm text-red-500">{errors.addressLine1}</p>
                )}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Jacksonville"
                    className={errors.city ? 'border-red-500' : 'border-[#D4C5A9]'}
                  />
                  {errors.city && (
                    <p className="text-sm text-red-500">{errors.city}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="state">State *</Label>
                  <Input
                    id="state"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="FL"
                    maxLength={2}
                    className={errors.state ? 'border-red-500' : 'border-[#D4C5A9]'}
                  />
                  {errors.state && (
                    <p className="text-sm text-red-500">{errors.state}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="zip">ZIP *</Label>
                  <Input
                    id="zip"
                    value={zip}
                    onChange={(e) => setZip(e.target.value)}
                    placeholder="32065"
                    className={errors.zip ? 'border-red-500' : 'border-[#D4C5A9]'}
                  />
                  {errors.zip && (
                    <p className="text-sm text-red-500">{errors.zip}</p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Date & Time */}
      <Card className="border-[#D4C5A9]">
        <CardContent className="p-6 space-y-4">
          <h3 className="font-serif text-xl font-semibold text-[#1A3D2E]">
            Date & Time
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Preferred Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={`w-full justify-start text-left font-normal border-[#D4C5A9] ${
                      errors.date ? 'border-red-500' : ''
                    } ${!date ? 'text-[#4A6358]' : 'text-[#1A3D2E]'}`}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, 'PPP') : 'Select a date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    disabled={isDateDisabled}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {errors.date && (
                <p className="text-sm text-red-500">{errors.date}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Preferred Time Window (Optional)</Label>
              <Select
                value={timeWindow || ''}
                onValueChange={(value) =>
                  setTimeWindow(value ? (value as NonNullable<TimeWindow>) : null)
                }
              >
                <SelectTrigger className="border-[#D4C5A9]">
                  <SelectValue placeholder="Any time works" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Any time works</SelectItem>
                  {(Object.entries(TIME_WINDOW_LABELS) as [string, string][]).map(
                    ([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-start gap-2 text-sm text-[#4A6358] bg-[#E8DFC9] p-3 rounded-lg">
            <Info className="h-4 w-4 mt-0.5 flex-shrink-0 text-[#1A3D2E]" />
            <p>
              <strong className="text-[#1A3D2E]">3-day turnaround!</strong> Your gifts will be ready 
              within 3 days of drop-off.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Bag Count */}
      <Card className="border-[#D4C5A9]">
        <CardContent className="p-6 space-y-4">
          <h3 className="font-serif text-xl font-semibold text-[#1A3D2E]">
            Number of Bags
          </h3>

          <div className="flex items-center gap-4">
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => setBagCount(Math.max(1, bagCount - 1))}
              disabled={bagCount <= 1}
              className="border-[#D4C5A9]"
            >
              <Minus className="h-4 w-4" />
            </Button>
            <div className="text-center">
              <span className="text-3xl font-bold text-[#1A3D2E]">{bagCount}</span>
              <p className="text-sm text-[#4A6358]">
                13-gallon {bagCount === 1 ? 'bag' : 'bags'}
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => setBagCount(bagCount + 1)}
              className="border-[#D4C5A9]"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-start gap-2 text-sm text-[#4A6358] bg-[#E8DFC9] p-3 rounded-lg">
            <Info className="h-4 w-4 mt-0.5 flex-shrink-0 text-[#1A3D2E]" />
            <p>
              A 13-gallon bag is a standard tall kitchen trash bag. Fill it with unwrapped
              gifts and we&apos;ll take care of the rest!
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Payment Method */}
      <Card className="border-[#D4C5A9]">
        <CardContent className="p-6 space-y-4">
          <h3 className="font-serif text-xl font-semibold text-[#1A3D2E]">
            Payment Method
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setPaymentMethod('stripe')}
              className={`p-4 rounded-lg border-2 text-left transition-all ${
                paymentMethod === 'stripe'
                  ? 'border-[#1A3D2E] bg-[#1A3D2E]/5'
                  : 'border-[#D4C5A9] hover:border-[#1A3D2E]/50'
              }`}
            >
              <div className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-[#1A3D2E]" />
                <span className="font-medium text-[#1A3D2E]">Pay Online</span>
              </div>
              <span className="text-xs text-[#4A6358] mt-1 block">
                Secure payment via Stripe
              </span>
            </button>

            <button
              type="button"
              onClick={() => setPaymentMethod('offline')}
              className={`p-4 rounded-lg border-2 text-left transition-all ${
                paymentMethod === 'offline'
                  ? 'border-[#1A3D2E] bg-[#1A3D2E]/5'
                  : 'border-[#D4C5A9] hover:border-[#1A3D2E]/50'
              }`}
            >
              <div className="flex items-center gap-2">
                <Wallet className="h-5 w-5 text-[#1A3D2E]" />
                <span className="font-medium text-[#1A3D2E]">Pay Later</span>
              </div>
              <span className="text-xs text-[#4A6358] mt-1 block">
                Cash App, Venmo, or cash
              </span>
            </button>
          </div>

          {paymentMethod === 'offline' && (
            <div className="bg-[#C9A962]/20 p-4 rounded-lg border border-[#C9A962]/40">
              <p className="text-sm text-[#1A3D2E]">
                <strong>Pay Later Instructions:</strong>
              </p>
              <p className="text-sm text-[#4A6358] mt-1">
                Pay via Cash App ({cashAppHandle}), Venmo ({venmoHandle}), or cash at
                pickup/dropoff. Payment is due when we return your wrapped gifts.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notes */}
      <Card className="border-[#D4C5A9]">
        <CardContent className="p-6 space-y-4">
          <h3 className="font-serif text-xl font-semibold text-[#1A3D2E]">
            Special Instructions (Optional)
          </h3>

          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any special requests? Preferred wrapping styles, color preferences, or notes about specific gifts..."
            rows={3}
            className="border-[#D4C5A9]"
          />
        </CardContent>
      </Card>

      {/* Price Summary */}
      <Card className="bg-[#1A3D2E] text-[#E8DFC9] border-none">
        <CardContent className="p-6">
          <h3 className="font-serif text-xl font-semibold mb-4">Order Summary</h3>

          <div className="space-y-2 text-[#E8DFC9]/90">
            <div className="flex justify-between">
              <span>
                {bagCount} {bagCount === 1 ? 'bag' : 'bags'} × ${PRICE_PER_BAG}
              </span>
              <span>${bagCount * PRICE_PER_BAG}</span>
            </div>
            {requiresPickupDelivery && (
              <div className="flex justify-between">
                <span>Pickup/Delivery Fee</span>
                <span>${pickupDeliveryFee}</span>
              </div>
            )}
            {!requiresPickupDelivery && serviceType === 'dropoff_only' && (
              <div className="flex justify-between text-[#C9A962]">
                <span>Drop-off at our home</span>
                <span>Free!</span>
              </div>
            )}
            <div className="border-t border-[#E8DFC9]/20 pt-2 mt-2">
              <div className="flex justify-between text-xl font-bold">
                <span>Estimated Total</span>
                <span>${estimatedTotal}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Submit Button */}
      <Button
        type="submit"
        size="lg"
        disabled={isSubmitting}
        className="w-full bg-[#C9A962] hover:bg-[#DBC07A] text-[#1A3D2E] py-6 text-lg rounded-full shadow-lg font-semibold"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Processing...
          </>
        ) : paymentMethod === 'stripe' ? (
          'Continue to Payment'
        ) : (
          'Complete Booking'
        )}
      </Button>
    </form>
  );
}
