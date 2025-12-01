import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { startOfDay, endOfDay, startOfWeek, endOfWeek } from 'date-fns';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const filter = searchParams.get('filter') || 'all';

    const supabase = createAdminClient();

    let query = supabase
      .from('bookings')
      .select('*')
      .order('date', { ascending: true })
      .order('created_at', { ascending: false });

    const today = new Date();

    // Apply date filters
    switch (filter) {
      case 'today':
        query = query
          .gte('date', startOfDay(today).toISOString().split('T')[0])
          .lte('date', endOfDay(today).toISOString().split('T')[0]);
        break;
      case 'week':
        query = query
          .gte('date', startOfWeek(today, { weekStartsOn: 0 }).toISOString().split('T')[0])
          .lte('date', endOfWeek(today, { weekStartsOn: 0 }).toISOString().split('T')[0]);
        break;
      case 'upcoming':
        query = query.gte('date', today.toISOString().split('T')[0]);
        break;
      case 'past':
        query = query.lt('date', today.toISOString().split('T')[0]);
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

