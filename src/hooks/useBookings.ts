import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  fetchBooking, 
  fetchBookings, 
  createBooking, 
  validateAddress,
  type CreateBookingResponse,
  type AddressInput,
  type ValidateAddressResponse,
} from '@/lib/api';
import type { Booking, BookingFormSubmission } from '@/types/booking';

// Query keys
export const bookingKeys = {
  all: ['bookings'] as const,
  lists: () => [...bookingKeys.all, 'list'] as const,
  list: (filter: string) => [...bookingKeys.lists(), filter] as const,
  details: () => [...bookingKeys.all, 'detail'] as const,
  detail: (id: string) => [...bookingKeys.details(), id] as const,
};

export const addressKeys = {
  all: ['address'] as const,
  validation: (address: AddressInput) => [...addressKeys.all, 'validate', address] as const,
};

// Hook to fetch a single booking
export function useBooking(bookingId: string | null) {
  return useQuery({
    queryKey: bookingKeys.detail(bookingId ?? ''),
    queryFn: () => fetchBooking(bookingId!),
    enabled: !!bookingId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Hook to fetch all bookings (admin)
export function useBookings(filter: string = 'all') {
  return useQuery({
    queryKey: bookingKeys.list(filter),
    queryFn: () => fetchBookings(filter),
    staleTime: 30 * 1000, // 30 seconds
  });
}

// Hook to create a new booking
export function useCreateBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: BookingFormSubmission) => createBooking(data),
    onSuccess: (response) => {
      // Invalidate bookings list cache
      queryClient.invalidateQueries({ queryKey: bookingKeys.lists() });
      
      // Optionally prefetch the new booking detail
      if (response.booking) {
        queryClient.setQueryData(
          bookingKeys.detail(response.booking.id),
          response.booking
        );
      }
    },
  });
}

// Hook to validate an address
export function useValidateAddress() {
  return useMutation({
    mutationFn: (address: AddressInput) => validateAddress(address),
  });
}

// Type exports for convenience
export type { Booking, BookingFormSubmission, CreateBookingResponse, AddressInput, ValidateAddressResponse };
