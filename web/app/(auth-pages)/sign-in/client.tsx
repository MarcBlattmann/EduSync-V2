"use client";

import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";
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
      <div className="w-full max-w-sm mx-auto bg-background p-6 rounded-lg shadow-sm">
        <h1 className="text-2xl font-medium mb-2">Sign in with Google</h1>
        <p className="text-sm text-foreground mb-6">
          Use your Google account to sign in to EduSync
        </p>
        
        <div className="flex flex-col gap-3">
          <GoogleSignInButton />
          
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
      </div>
    </div>
  );
}