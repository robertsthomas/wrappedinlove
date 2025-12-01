# Wrapped in Love Co.

A professional gift wrapping service web application built with Next.js, Supabase, and Stripe.

## Features

- 📦 **Simple Booking**: Easy-to-use booking form with date selection and bag count
- 💳 **Flexible Payments**: Online payments via Stripe or pay later (Cash App/Venmo/cash)
- 📱 **Mobile-First**: Responsive design optimized for mobile users
- 🎁 **Beautiful UI**: Cozy, holiday-themed design with professional aesthetics
- 📊 **Admin Dashboard**: View and manage all bookings with filtering options

## Tech Stack

- **Framework**: Next.js 15 (App Router, TypeScript)
- **Styling**: Tailwind CSS v4 + shadcn/ui components
- **Database**: Supabase (PostgreSQL)
- **Payments**: Stripe Checkout
- **Deployment**: Vercel-ready

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm
- Supabase account
- Stripe account

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd wrapped-in-love
pnpm install
```

### 2. Environment Setup

Copy `env.example` to `.env.local` and fill in your values:

```bash
cp env.example .env.local
```

Required environment variables:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Stripe
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Site Configuration
NEXT_PUBLIC_SITE_URL=http://localhost:3000
PICKUP_DELIVERY_FEE=10
NEXT_PUBLIC_PICKUP_DELIVERY_FEE=10
NEXT_PUBLIC_BUSINESS_CITY=Your City
NEXT_PUBLIC_CASHAPP_HANDLE=$YourHandle
NEXT_PUBLIC_VENMO_HANDLE=@YourHandle
```

### 3. Database Setup

Run the following SQL in your Supabase SQL Editor to create the bookings table:

```sql
-- Create bookings table
CREATE TABLE bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  customer_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  address_line1 TEXT,
  city TEXT,
  state TEXT,
  zip TEXT,
  service_type TEXT NOT NULL CHECK (service_type IN ('pickup_delivery', 'dropoff_pickup', 'dropoff_only', 'pickup_only')),
  date DATE NOT NULL,
  time_window TEXT CHECK (time_window IN ('morning', 'afternoon', 'evening') OR time_window IS NULL),
  bag_count INTEGER NOT NULL CHECK (bag_count > 0),
  estimated_total NUMERIC(10, 2) NOT NULL,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('stripe', 'offline')),
  status TEXT NOT NULL DEFAULT 'pending_payment' CHECK (status IN ('pending_payment', 'awaiting_offline_payment', 'paid', 'canceled')),
  notes TEXT,
  stripe_checkout_session_id TEXT
);

-- Create indexes for common queries
CREATE INDEX idx_bookings_date ON bookings(date);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_email ON bookings(email);

-- Enable Row Level Security (RLS)
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Create policy for service role access (admin operations)
CREATE POLICY "Service role can do everything" ON bookings
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Optional: Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

### 4. Stripe Webhook Setup

For local development, use Stripe CLI:

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

For production, add the webhook endpoint in your Stripe Dashboard:
- URL: `https://your-domain.com/api/webhooks/stripe`
- Events: `checkout.session.completed`, `checkout.session.expired`

### 5. Run Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the site.

## Configuration

### Pricing

- **Per Bag Price**: $35 (hardcoded in `src/lib/stripe.ts`)
- **Pickup/Delivery Fee**: Set via `PICKUP_DELIVERY_FEE` env var (default: $15)

### Business Info

Update these environment variables for your business:

- `NEXT_PUBLIC_BUSINESS_CITY`: Your service area
- `NEXT_PUBLIC_CASHAPP_HANDLE`: Your Cash App handle
- `NEXT_PUBLIC_VENMO_HANDLE`: Your Venmo handle

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Add all environment variables
4. Deploy!

### Environment Variables for Production

Make sure to update:
- `NEXT_PUBLIC_SITE_URL` to your production URL
- Use production Stripe keys (`sk_live_...`, `pk_live_...`)
- Set up production webhook in Stripe Dashboard

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── bookings/       # Booking CRUD endpoints
│   │   ├── admin/          # Admin endpoints
│   │   └── webhooks/       # Stripe webhooks
│   ├── admin/              # Admin dashboard
│   ├── book/               # Booking form page
│   ├── success/            # Payment success page
│   ├── cancel/             # Payment cancel page
│   └── page.tsx            # Landing page
├── components/
│   ├── ui/                 # shadcn/ui components
│   ├── BookingForm.tsx     # Main booking form
│   ├── Header.tsx          # Site header
│   └── Footer.tsx          # Site footer
├── lib/
│   ├── supabase.ts         # Supabase client
│   ├── stripe.ts           # Stripe client & helpers
│   └── utils.ts            # Utility functions
└── types/
    └── booking.ts          # TypeScript types
```

## License

MIT
