import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

type RouteContext = {
  params: {
    code: string;
  };
};

export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  const code = context.params.code;
  const supabase = await createClient();
  
  try {
    // Find the calendar share by code
    const { data: shareData, error: shareError } = await supabase
      .from('calendar_shares')
      .select('*')
      .eq('share_code', code)
      .eq('active', true)
      .single();
      
    if (shareError || !shareData) {
      return NextResponse.json({ error: 'Share not found or inactive' }, { status: 404 });
    }
    
    // Check if the share has expired
    if (shareData.expires_at && new Date(shareData.expires_at) < new Date()) {
      return NextResponse.json({ error: 'This share has expired' }, { status: 403 });
    }
    
    // Get the calendar events for this user
    const { data: events, error: eventsError } = await supabase
      .from('calendar_events')
      .select('*')
      .eq('user_id', shareData.user_id)
      .order('start_date', { ascending: true });
      
    if (eventsError) {
      console.error('Error fetching calendar events:', eventsError);
      return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
    }
    
    // Get user's display name or email
    const { data: userData } = await supabase
      .from('profiles')
      .select('full_name, email')
      .eq('id', shareData.user_id)
      .single();
    
    const ownerName = (userData?.full_name || 'User') + "'s Calendar";
    
    return NextResponse.json({
      share: {
        ...shareData,
        owner_name: ownerName
      },
      events
    });
    
  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}