import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const origin = requestUrl.origin;
  
  if (code) {
    const supabase = await createClient();
    // Exchange the code for a session
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (error) {
      console.error("Error exchanging code for session:", error.message);
      return NextResponse.redirect(`${origin}/sign-in?error=${encodeURIComponent("Authentication failed")}`);
    }

    // Get the user's email to check if they've paid
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user?.email) {
      // Check if the user has a payment record
      const { data: paymentData } = await supabase.from('payments')
        .select('*')
        .eq('email', user.email)
        .eq('status', 'succeeded')
        .maybeSingle();

      // If no payment record found, sign them out and redirect to payment
      if (!paymentData) {
        // Sign out the user
        await supabase.auth.signOut();
        
        // Redirect to payment page
        return NextResponse.redirect(
          `${origin}/api/payment/registration?email=${encodeURIComponent(user.email)}`
        );
      }
    }
  }

  // URL to redirect to after sign in process completes if payment exists
  return NextResponse.redirect(`${origin}/protected`);
}
