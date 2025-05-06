import { NextRequest, NextResponse } from 'next/server';
import stripe from '@/utils/stripe/client';
import { createClient } from '@/utils/supabase/server';
import { headers } from 'next/headers';

// This is your Stripe webhook secret for testing your endpoint locally.
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(request: NextRequest) {
  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get('stripe-signature');

  let event;

  try {
    if (!signature || !endpointSecret) {
      throw new Error('Missing signature or endpoint secret');
    }
    
    event = stripe.webhooks.constructEvent(body, signature, endpointSecret);
  } catch (err: any) {
    console.error(`Webhook Error: ${err.message}`);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      // Payment successful, complete the user registration
      const paymentIntent = event.data.object;
      
      // Access metadata from the payment intent
      const email = paymentIntent.metadata?.email;
      
      if (email) {
        const supabase = await createClient();
        
        // Record the payment in your database
        await supabase.from('payments').insert({
          payment_id: paymentIntent.id,
          email: email,
          amount: paymentIntent.amount,
          status: 'succeeded',
          created_at: new Date().toISOString(),
        });
      }
      break;
      
    case 'checkout.session.completed':
      const session = event.data.object;
      
      // Handle the checkout session completion
      // You can verify the payment and complete user registration here
      if (session.metadata?.email) {
        const supabase = await createClient();
        
        // Add any additional logic needed when a checkout session is completed
        console.log(`Checkout completed for ${session.metadata.email}`);
      }
      break;

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  return NextResponse.json({ received: true });
}