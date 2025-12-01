import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createAdminClient, supabase } from '@/lib/supabase';

const COOKIE_NAME = 'admin_session';

// Verify admin session
async function isAuthenticated(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get(COOKIE_NAME);
    
    if (!session?.value) return false;
    
    const decoded = Buffer.from(session.value, 'base64').toString();
    return decoded.includes(process.env.ADMIN_PASSWORD || '');
  } catch {
    return false;
  }
}

// GET - Check if bookings are enabled (public)
export async function GET() {
  try {
    
    const { data, error } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'bookings_enabled')
      .single();

    if (error) {
      // If table doesn't exist or no row, default to enabled
      console.warn('Could not fetch booking status, defaulting to enabled:', error.message);
      return NextResponse.json({ enabled: true });
    }

    const enabled = data?.value === true || data?.value === 'true';
    return NextResponse.json({ enabled });
  } catch (error) {
    console.error('Settings fetch error:', error);
    return NextResponse.json({ enabled: true }); // Default to enabled on error
  }
}

// POST - Toggle bookings (admin only)
export async function POST(request: NextRequest) {
  try {
    if (!(await isAuthenticated())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { enabled } = body;

    if (typeof enabled !== 'boolean') {
      return NextResponse.json(
        { error: 'Invalid value for enabled' },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    const { error } = await supabase
      .from('site_settings')
      .upsert({
        key: 'bookings_enabled',
        value: enabled,
        updated_at: new Date().toISOString(),
      });

    if (error) {
      console.error('Settings update error:', error);
      return NextResponse.json(
        { error: 'Failed to update settings' },
        { status: 500 }
      );
    }

    return NextResponse.json({ enabled });
  } catch (error) {
    console.error('Settings POST error:', error);
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500 }
    );
  }
}

