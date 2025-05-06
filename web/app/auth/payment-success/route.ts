import { NextRequest, NextResponse } from 'next/server';
import stripe from '@/utils/stripe/client';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
      return NextResponse.redirect(new URL('/sign-up?error=missing-session-id', request.url));
    }

    // Retrieve the checkout session to verify payment
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    if (session.payment_status !== 'paid') {
      return NextResponse.redirect(new URL('/sign-up?error=payment-failed', request.url));
    }

    // Extract the email from the session metadata
    const email = session.metadata?.email;
    
    if (!email) {
      return NextResponse.redirect(new URL('/sign-up?error=missing-email', request.url));
    }

    // Complete the registration by creating the user account
    const supabase = await createClient();
    const origin = request.headers.get('origin');
    
    const { error } = await supabase.auth.signUp({
      email,
      password: "", // We'll handle this differently for paid registrations
      options: {
        emailRedirectTo: `${origin}/auth/callback`,
        data: {
          paid_user: true,
          payment_id: session.id,
        },
      },
    });

    if (error) {
      console.error('Error completing registration:', error);
      return NextResponse.redirect(new URL(`/sign-up?error=${error.message}`, request.url));
    }

    return NextResponse.redirect(new URL('/sign-up?success=payment-completed', request.url));
  } catch (error) {
    console.error('Error handling payment success:', error);
    return NextResponse.redirect(new URL('/sign-up?error=processing-error', request.url));
  }
}