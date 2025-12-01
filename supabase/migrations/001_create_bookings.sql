-- Create bookings table for Wrapped in Love Co.
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

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to bookings table
CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

