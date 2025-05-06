"use client";

import { signInAction } from "@/app/actions";
import { SubmitButton } from "@/components/submit-button";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function SignInClient() {
  const searchParams = useSearchParams();
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<string | null>(null);

  useEffect(() => {
    const msg = searchParams.get('message');
    const type = searchParams.get('type');
    
    if (msg) {
      setMessage(msg);
      setMessageType(type || 'error');
    }
  }, [searchParams]);

  return (
    <div className="flex justify-center items-center w-full h-full min-h-[calc(100vh-10rem)] px-4 py-6">
      <form 
        className="w-full max-w-sm mx-auto bg-background p-6 rounded-lg shadow-sm"
        suppressHydrationWarning
      >
        <h1 className="text-2xl font-medium mb-2">Sign in</h1>
        <p className="text-sm text-foreground mb-6">
          Don't have an account?{" "}
          <Link className="text-primary font-medium underline" href="/sign-up">
            Sign up
          </Link>
        </p>
        
        <div className="flex flex-col gap-3">
          <GoogleSignInButton />
          
          <div className="flex items-center my-3">
            <Separator className="w-16 flex-grow-0" />
            <span className="px-3 text-xs text-muted-foreground mx-auto">OR</span>
            <Separator className="w-16 flex-grow-0" />
          </div>
          
          <Label htmlFor="email">Email</Label>
          <Input 
            name="email" 
            placeholder="you@example.com" 
            required 
            className="mb-2"
            suppressHydrationWarning
          />
          
          <div className="flex justify-between items-center">
            <Label htmlFor="password">Password</Label>
            <Link
              className="text-xs text-foreground underline"
              href="/forgot-password"
            >
              Forgot Password?
            </Link>
          </div>
          
          <Input
            type="password"
            name="password"
            placeholder="Your password"
            required
            className="mb-4"
            suppressHydrationWarning
          />
          
          <SubmitButton 
            pendingText="Signing In..." 
            formAction={signInAction}
            className="w-full"
          >
            Sign in
          </SubmitButton>
          
          {message && (
            <div className={`mt-4 p-2 border rounded text-sm ${
              messageType === 'success' 
                ? 'border-green-200 bg-green-50 text-green-800' 
                : 'border-red-200 bg-red-50 text-red-800'
            }`}>
              {message}
            </div>
          )}
        </div>
      </form>
    </div>
  );
}