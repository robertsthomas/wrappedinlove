import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createAdminClient } from '@/lib/supabase';
import { z } from 'zod';

const COOKIE_NAME = 'admin_session';

const waitlistSchema = z.object({
  email: z.string().email().optional(),
  phone: z.string().min(10).optional(),
}).refine(data => data.email || data.phone, {
  message: 'Please provide an email or phone number',
});

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

// POST - Add to waitlist (public)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const parseResult = waitlistSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: parseResult.error.errors[0]?.message || 'Invalid input' },
        { status: 400 }
      );
    }

    const { email, phone } = parseResult.data;
    const supabase = createAdminClient();

    // Check if already on waitlist
    let existingQuery = supabase.from('waitlist').select('id');
    
    if (email) {
      existingQuery = existingQuery.eq('email', email.toLowerCase());
    } else if (phone) {
      existingQuery = existingQuery.eq('phone', phone);
    }

    const { data: existing } = await existingQuery.maybeSingle();

    if (existing) {
      return NextResponse.json({ 
        success: true, 
        message: "You're already on our waitlist! We'll notify you when spots open up." 
      });
    }

    // Add to waitlist
    const { error } = await supabase
      .from('waitlist')
      .insert({
        email: email?.toLowerCase(),
        phone,
      });

    if (error) {
      console.error('Waitlist insert error:', error);
      return NextResponse.json(
        { error: 'Failed to join waitlist' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true,
      message: "You're on the list! We'll notify you when spots open up."
    });
  } catch (error) {
    console.error('Waitlist POST error:', error);
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500 }
    );
  }
}

// GET - Get waitlist entries (admin only)
export async function GET() {
  try {
    if (!(await isAuthenticated())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from('waitlist')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Waitlist fetch error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch waitlist' },
        { status: 500 }
      );
    }

    return NextResponse.json({ waitlist: data || [] });
  } catch (error) {
    console.error('Waitlist GET error:', error);
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500 }
    );
  }
}

