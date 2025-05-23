import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: NextRequest) {
  // Extract the code param from the URL
  const url = new URL(request.url);
  const segments = url.pathname.split('/');
  const shareCode = segments[segments.length - 1];
  console.log(`Processing note share request for code: ${shareCode}`);
  const supabase = await createClient();
  
  if (!shareCode) {
    return NextResponse.json({ error: 'Share code is required' }, { status: 400 });
  }
  
  try {
    // Get the note share by code and check if it's active and not expired
    const { data: shareData, error: shareError } = await supabase
      .from('note_shares')
      .select(`
        id,
        user_id,
        note_id,
        share_code,
        name,
        expires_at,
        created_at,
        active
      `)
      .eq('share_code', shareCode)
      .eq('active', true)
      .single();
    
    console.log(`Share lookup result: ${JSON.stringify({ shareData, error: shareError?.message })}`);
    
    if (shareError || !shareData) {
      return NextResponse.json({ error: 'Shared note not found' }, { status: 404 });
    }
    
    // Check if the share has expired
    if (shareData.expires_at && new Date(shareData.expires_at) < new Date()) {
      return NextResponse.json({ error: 'This share link has expired' }, { status: 403 });
    }
    
    // Get user info
    const { data: userData } = await supabase
      .from('profiles')
      .select('full_name, email')
      .eq('id', shareData.user_id)
      .single();
    
    // Get the note content
        const { data: noteData, error: noteError } = await supabase
      .from('notes')
      .select('id, title, content, created_at, updated_at')
      .eq('id', shareData.note_id)
      .single();
    
    if (noteError || !noteData) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    }
    
    // Extract owner email or name to show who shared it
    const ownerName = userData?.full_name || (userData?.email ? userData.email.split('@')[0] : 'Unknown');
    
    // Return the share and note data
    return NextResponse.json({
      share: {
        ...shareData,
        owner_name: ownerName
      },
      note: noteData
    });
  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
