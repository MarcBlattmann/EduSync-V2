import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@/utils/supabase/server';

// Generate a unique 6-character share code
function generateShareCode(): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

// POST - Create a new calendar share
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  
  try {
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get request body
    const { name, expiration_days } = await request.json();
    
    // Generate a unique share code
    const shareCode = generateShareCode();
    
    // Calculate expiration date (if provided)
    let expiresAt = null;
    if (expiration_days && !isNaN(expiration_days)) {
      expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + parseInt(expiration_days));
    }
    
    // Create a new calendar share record
    const { data: shareData, error: shareError } = await supabase
      .from('calendar_shares')
      .insert({
        user_id: user.id,
        share_code: shareCode,
        name: name || 'My Calendar',
        expires_at: expiresAt,
        active: true
      })
      .select()
      .single();
      
    if (shareError) {
      console.error('Error creating calendar share:', shareError);
      return NextResponse.json({ error: 'Failed to create share' }, { status: 500 });
    }
    
    return NextResponse.json({ share: shareData });
  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET - List all calendar shares for current user
export async function GET() {
  const supabase = await createClient();
  
  try {
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get all shares for this user
    const { data: shares, error: shareError } = await supabase
      .from('calendar_shares')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
      
    if (shareError) {
      console.error('Error fetching calendar shares:', shareError);
      return NextResponse.json({ error: 'Failed to fetch shares' }, { status: 500 });
    }
    
    return NextResponse.json({ shares });
  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Remove a calendar share
export async function DELETE(request: NextRequest) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);
  const shareId = searchParams.get('id');
  
  if (!shareId) {
    return NextResponse.json({ error: 'Share ID is required' }, { status: 400 });
  }
  
  try {
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Delete the share (but first check if it belongs to the user)
    const { data: shareCheck } = await supabase
      .from('calendar_shares')
      .select('id')
      .eq('id', shareId)
      .eq('user_id', user.id)
      .single();
    
    if (!shareCheck) {
      return NextResponse.json({ error: 'Share not found or unauthorized' }, { status: 404 });
    }
    
    const { error: deleteError } = await supabase
      .from('calendar_shares')
      .delete()
      .eq('id', shareId)
      .eq('user_id', user.id);
      
    if (deleteError) {
      console.error('Error deleting calendar share:', deleteError);
      return NextResponse.json({ error: 'Failed to delete share' }, { status: 500 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}