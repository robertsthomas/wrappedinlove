import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  typescript: true,
});

export const PRICE_PER_BAG = 35;

export function calculateTotal(bagCount: number, includesPickupDelivery: boolean): number {
  const bagTotal = bagCount * PRICE_PER_BAG;
  const fee = includesPickupDelivery ? Number(process.env.PICKUP_DELIVERY_FEE || 10) : 0;
  return bagTotal + fee;
}

export function requiresPickupDelivery(serviceType: string): boolean {
  // Only pickup_delivery (we pick up and deliver back) requires the $15 fee
  // dropoff_pickup (they drop off and pick up) is free
  return serviceType === 'pickup_delivery';
}

