import { NextRequest, NextResponse } from 'next/server';
import stripe from '@/utils/stripe/client';
import { createClient } from '@/utils/supabase/server';

// Handle GET requests for redirects from sign-in/sign-up
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const password = searchParams.get('password');
    
    if (!email || !password) {
      return NextResponse.redirect(
        new URL('/sign-up?error=Missing email or password', request.url)
      );
    }

    // Create a Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: process.env.REGISTRATION_PRICE_ID,
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${request.headers.get('origin')}/auth/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${request.headers.get('origin')}/sign-up?cancelled=true`,
      metadata: {
        email,
        password, // Note: Storing password in metadata is not recommended for production
      },
    });

    if (session.url) {
      return NextResponse.redirect(new URL(session.url));
    } else {
      return NextResponse.redirect(
        new URL('/sign-up?error=Failed to create payment session', request.url)
      );
    }
  } catch (error) {
    console.error('Error creating payment session:', error);
    return NextResponse.redirect(
      new URL('/sign-up?error=An error occurred', request.url)
    );
  }
}

// Handle POST requests from the PaymentButton component
export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Store the signup credentials temporarily in the session
    const supabase = await createClient();
    const { data: sessionData, error: sessionError } = await supabase.auth.admin.createSession({
      email: email,
      password: password,
      properties: {
        pending_registration: true,
      },
    });

    if (sessionError) {
      return NextResponse.json(
        { error: sessionError.message },
        { status: 400 }
      );
    }

    // Create a Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: process.env.REGISTRATION_PRICE_ID,
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${request.headers.get('origin')}/auth/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${request.headers.get('origin')}/sign-up?cancelled=true`,
      metadata: {
        email,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Error creating payment session:', error);
    return NextResponse.json(
      { error: 'An error occurred while creating the payment session' },
      { status: 500 }
    );
  }
}