import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createAdminClient } from '@/lib/supabase';
import { startOfDay, endOfDay } from 'date-fns';

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

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    if (!(await isAuthenticated())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const filter = searchParams.get('filter') || 'all';

    const supabase = createAdminClient();

    let query = supabase
      .from('bookings')
      .select('*')
      .order('date', { ascending: true })
      .order('created_at', { ascending: false });

    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    // Apply filters
    switch (filter) {
      case 'today':
        query = query
          .gte('date', startOfDay(today).toISOString().split('T')[0])
          .lte('date', endOfDay(today).toISOString().split('T')[0]);
        break;
      case 'upcoming':
        query = query.gte('date', todayStr);
        break;
      case 'past':
        query = query.lt('date', todayStr);
        break;
      case 'pending':
        query = query.in('status', ['pending_payment', 'awaiting_offline_payment']);
        break;
      case 'paid':
        query = query.eq('status', 'paid');
        break;
      case 'canceled':
        query = query.eq('status', 'canceled');
        break;
      // 'all' returns everything
    }

    const { data: bookings, error } = await query;

    if (error) {
      console.error('Error fetching bookings:', error);
      return NextResponse.json(
        { error: 'Failed to fetch bookings' },
        { status: 500 }
      );
    }

    return NextResponse.json({ bookings: bookings || [] });
  } catch (error) {
    console.error('Admin bookings error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
