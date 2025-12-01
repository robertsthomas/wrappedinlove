export type ServiceType = 'pickup_delivery' | 'dropoff_pickup';
export type TimeWindow = 'morning' | 'afternoon' | 'evening' | null;
export type PaymentMethod = 'stripe' | 'offline';
export type BookingStatus = 'pending_payment' | 'awaiting_offline_payment' | 'paid' | 'canceled';

export interface Booking {
  id: string;
  created_at: string;
  updated_at: string;
  customer_name: string;
  email: string;
  phone: string;
  address_line1?: string | null;
  city?: string | null;
  state?: string | null;
  zip?: string | null;
  service_type: ServiceType;
  date: string; // 'YYYY-MM-DD'
  time_window?: TimeWindow;
  bag_count: number;
  estimated_total: number;
  payment_method: PaymentMethod;
  status: BookingStatus;
  notes?: string | null;
  stripe_checkout_session_id?: string | null;
}

export interface BookingFormSubmission {
  customer_name: string;
  email: string;
  phone: string;
  address_line1?: string;
  city?: string;
  state?: string;
  zip?: string;
  service_type: ServiceType;
  date: string; // 'YYYY-MM-DD'
  time_window?: TimeWindow;
  bag_count: number;
  payment_method: PaymentMethod;
  notes?: string;
}

export const SERVICE_TYPE_LABELS: Record<ServiceType, string> = {
  pickup_delivery: 'Pickup & Delivery',
  dropoff_pickup: 'Drop-off & Pick-up',
};

export const TIME_WINDOW_LABELS: Record<NonNullable<TimeWindow>, string> = {
  morning: 'Morning (9am - 12pm)',
  afternoon: 'Afternoon (12pm - 5pm)',
  evening: 'Evening (5pm - 8pm)',
};

export const STATUS_LABELS: Record<BookingStatus, string> = {
  pending_payment: 'Pending Payment',
  awaiting_offline_payment: 'Awaiting Offline Payment',
  paid: 'Paid',
  canceled: 'Canceled',
};

