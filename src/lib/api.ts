import type { Booking, BookingFormSubmission } from '@/types/booking';

const API_BASE = '/api';

// Fetch a single booking by ID
export async function fetchBooking(bookingId: string): Promise<Booking> {
  const response = await fetch(`${API_BASE}/bookings/${bookingId}`);
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || 'Failed to fetch booking');
  }
  const data = await response.json();
  return data.booking;
}

// Fetch all bookings (admin)
export async function fetchBookings(filter: string = 'all'): Promise<Booking[]> {
  const response = await fetch(`${API_BASE}/admin/bookings?filter=${filter}`);
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || 'Failed to fetch bookings');
  }
  const data = await response.json();
  return data.bookings;
}

// Create a new booking
export interface CreateBookingResponse {
  booking: Booking;
  checkoutUrl?: string;
}

export async function createBooking(data: BookingFormSubmission): Promise<CreateBookingResponse> {
  const response = await fetch(`${API_BASE}/bookings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || 'Failed to create booking');
  }
  
  return response.json();
}

// Address validation
export interface AddressInput {
  street: string;
  city: string;
  state: string;
  zip: string;
}

export interface NormalizedAddress {
  street: string;
  city: string;
  state: string;
  zip: string;
}

export interface ValidateAddressResponse {
  success: boolean;
  normalizedAddress: NormalizedAddress;
}

export async function validateAddress(address: AddressInput): Promise<ValidateAddressResponse> {
  const response = await fetch(`${API_BASE}/validate-address`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(address),
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || 'Address validation failed');
  }
  
  return response.json();
}
