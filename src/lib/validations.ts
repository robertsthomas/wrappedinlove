import { z } from 'zod';

// US States - 2 letter codes
const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY', 'DC'
] as const;

// Address validation schema
export const addressSchema = z.object({
  street: z
    .string()
    .min(5, 'Street address must be at least 5 characters')
    .max(100, 'Street address is too long')
    .regex(/^[a-zA-Z0-9\s.,#\-']+$/, 'Street address contains invalid characters'),
  city: z
    .string()
    .min(2, 'City must be at least 2 characters')
    .max(50, 'City name is too long')
    .regex(/^[a-zA-Z\s.\-']+$/, 'City contains invalid characters'),
  state: z
    .string()
    .length(2, 'State must be 2 letters')
    .toUpperCase()
    .refine((val) => US_STATES.includes(val as typeof US_STATES[number]), {
      message: 'Please enter a valid US state (e.g., FL)',
    }),
  zip: z
    .string()
    .regex(/^\d{5}$/, 'ZIP code must be exactly 5 digits'),
});

// Customer info validation
export const customerSchema = z.object({
  customer_name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name is too long')
    .regex(/^[a-zA-Z\s.\-']+$/, 'Name contains invalid characters'),
  email: z
    .string()
    .email('Please enter a valid email address')
    .max(254, 'Email is too long'),
  phone: z
    .string()
    .min(10, 'Phone number must be at least 10 digits')
    .max(20, 'Phone number is too long')
    .regex(/^[\d\s()\-+.]+$/, 'Phone number contains invalid characters'),
});

// Booking validation
export const bookingSchema = customerSchema.extend({
  address_line1: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip: z.string().optional(),
  service_type: z.enum(['pickup_delivery', 'dropoff_only']),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  time_window: z.enum(['morning', 'afternoon', 'evening']).nullable(),
  bag_count: z.number().int().min(1, 'At least 1 bag required').max(100, 'Maximum 100 bags'),
  payment_method: z.enum(['stripe', 'offline']),
  notes: z.string().max(500, 'Notes are too long').optional(),
});

// Helper to format Zod errors into a user-friendly message
export function formatZodError(error: z.ZodError): string {
  const firstError = error.errors[0];
  if (firstError) {
    return firstError.message;
  }
  return 'Invalid input';
}

// Helper to format all Zod errors as a record
export function formatZodErrors(error: z.ZodError): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const err of error.errors) {
    const path = err.path.join('.');
    if (!errors[path]) {
      errors[path] = err.message;
    }
  }
  return errors;
}

export type AddressInput = z.infer<typeof addressSchema>;
export type CustomerInput = z.infer<typeof customerSchema>;
export type BookingInput = z.infer<typeof bookingSchema>;

