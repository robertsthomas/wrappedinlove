import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { stripe, PRICE_PER_BAG, requiresPickupDelivery } from '@/lib/stripe';
import type { BookingFormSubmission, BookingStatus } from '@/types/booking';

export async function POST(request: NextRequest) {
  try {
    const body: BookingFormSubmission = await request.json();

    // Validate required fields
    if (!body.customer_name || !body.phone || !body.date || !body.bag_count) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }


    // Check for required environment variables
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('Missing Supabase environment variables');
      return NextResponse.json(
        { error: 'Server configuration error: Supabase not configured' },
        { status: 500 }
      );
    }

    // Calculate estimated total
    const pickupDeliveryFee = Number(process.env.PICKUP_DELIVERY_FEE || 15);
    const includesPickup = requiresPickupDelivery(body.service_type);
    const bagTotal = body.bag_count * PRICE_PER_BAG;
    const estimatedTotal = bagTotal + (includesPickup ? pickupDeliveryFee : 0);

    // Determine initial status based on payment method
    const status: BookingStatus =
      body.payment_method === 'stripe' ? 'pending_payment' : 'awaiting_offline_payment';

    // Create booking in Supabase
    const supabase = createAdminClient();
    const { data: booking, error: dbError } = await supabase
      .from('bookings')
      .insert({
        customer_name: body.customer_name,
        email: null,
        phone: body.phone,
        address_line1: body.address_line1 || null,
        city: body.city || null,
        state: body.state || null,
        zip: body.zip || null,
        service_type: body.service_type,
        date: body.date,
        time_window: body.time_window || null,
        bag_count: body.bag_count,
        estimated_total: estimatedTotal,
        payment_method: body.payment_method,
        status,
        notes: body.notes || null,
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json(
        { error: `Database error: ${dbError.message}` },
        { status: 500 }
      );
    }

    // If paying with Stripe, create checkout session
    if (body.payment_method === 'stripe') {
      if (!process.env.STRIPE_SECRET_KEY) {
        console.error('Missing Stripe secret key');
        return NextResponse.json(
          { error: 'Server configuration error: Stripe not configured' },
          { status: 500 }
        );
      }

      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

      const session = await stripe.checkout.sessions.create({
        mode: 'payment',
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'usd',
              unit_amount: PRICE_PER_BAG * 100, // Stripe uses cents
              product_data: {
                name: 'Gift Wrapping Service',
                description: `Gift wrapping for ${body.bag_count} bag(s)`,
              },
            },
            quantity: body.bag_count,
          },
          ...(includesPickup
            ? [
                {
                  price_data: {
                    currency: 'usd',
                    unit_amount: pickupDeliveryFee * 100,
                    product_data: {
                      name: 'Pickup/Delivery Fee',
                      description: 'Pickup and delivery service',
                    },
                  },
                  quantity: 1,
                },
              ]
            : []),
        ],
        metadata: {
          booking_id: booking.id,
        },
        success_url: `${siteUrl}/success?session_id={CHECKOUT_SESSION_ID}&booking=${booking.id}`,
        cancel_url: `${siteUrl}/cancel?booking=${booking.id}`,
      });

      // Update booking with Stripe session ID
      await supabase
        .from('bookings')
        .update({ stripe_checkout_session_id: session.id })
        .eq('id', booking.id);

      return NextResponse.json({
        booking,
        checkoutUrl: session.url,
      });
    }

    // Offline payment - just return the booking
    return NextResponse.json({ booking });
  } catch (error) {
    console.error('Booking error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

