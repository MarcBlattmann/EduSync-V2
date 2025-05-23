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

// POST - Create a new note share
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  
  try {
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get request body
    const { noteId, name, expiration_days } = await request.json();
    
    if (!noteId) {
      return NextResponse.json({ error: 'Note ID is required' }, { status: 400 });
    }
    
    // Verify the note exists and belongs to the user
    const { data: noteData, error: noteError } = await supabase
      .from('notes')
      .select('id')
      .eq('id', noteId)
      .eq('user_id', user.id)
      .single();
    
    if (noteError || !noteData) {
      return NextResponse.json({ error: 'Note not found or unauthorized' }, { status: 404 });
    }
    
    // Generate a unique share code
    const shareCode = generateShareCode();
    
    // Calculate expiration date (if provided)
    let expiresAt = null;
    if (expiration_days && !isNaN(expiration_days)) {
      expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + parseInt(expiration_days));
    }
    
    // Create a new note share record
    const { data: shareData, error: shareError } = await supabase
      .from('note_shares')
      .insert({
        user_id: user.id,
        note_id: noteId,
        share_code: shareCode,
        name: name || 'My Note',
        expires_at: expiresAt,
        active: true
      })
      .select()
      .single();
      
    if (shareError) {
      console.error('Error creating note share:', shareError);
      return NextResponse.json({ error: 'Failed to create share' }, { status: 500 });
    }
    
    return NextResponse.json({ share: shareData });
  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET - List all note shares for a specific note
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);
  const noteId = searchParams.get('noteId');
  
  try {
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    if (!noteId) {
      return NextResponse.json({ error: 'Note ID is required' }, { status: 400 });
    }
    
    // Verify the note exists and belongs to the user
    const { data: noteData, error: noteError } = await supabase
      .from('notes')
      .select('id')
      .eq('id', noteId)
      .eq('user_id', user.id)
      .single();
    
    if (noteError) {
      return NextResponse.json({ error: 'Note not found or unauthorized' }, { status: 404 });
    }
    
    // Get all shares for this note
    const { data: shares, error: shareError } = await supabase
      .from('note_shares')
      .select('*')
      .eq('note_id', noteId)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
      
    if (shareError) {
      console.error('Error fetching note shares:', shareError);
      return NextResponse.json({ error: 'Failed to fetch shares' }, { status: 500 });
    }
    
    return NextResponse.json({ shares });
  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Remove a note share
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
      .from('note_shares')
      .select('id')
      .eq('id', shareId)
      .eq('user_id', user.id)
      .single();
    
    if (!shareCheck) {
      return NextResponse.json({ error: 'Share not found or unauthorized' }, { status: 404 });
    }
    
    const { error: deleteError } = await supabase
      .from('note_shares')
      .delete()
      .eq('id', shareId)
      .eq('user_id', user.id);
      
    if (deleteError) {
      console.error('Error deleting note share:', deleteError);
      return NextResponse.json({ error: 'Failed to delete share' }, { status: 500 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
