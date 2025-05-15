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
  }

  // URL to redirect to after sign in process completes
  return NextResponse.redirect(`${origin}/protected`);
}
