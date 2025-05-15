"use client";

import { FormMessage } from "@/components/form-message";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { SubmitButton } from "@/components/submit-button";
import { signUpAction } from "@/app/actions";

export default function SignupClient() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validateForm = (): boolean => {
    const newErrors: { email?: string; password?: string } = {};
    
    if (!email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Email is invalid";
    }
    
    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    validateForm();
    // Form will be submitted by SubmitButton
  };
  const message = searchParams.get('message');
  const error = searchParams.get('error');

  if (message) {
    return (
      <div className="w-full flex-1 flex items-center h-screen sm:max-w-md justify-center gap-2 p-4">
        <FormMessage message={{ message }} />
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center w-full px-4 py-6">
      <form className="w-full max-w-sm mx-auto bg-background p-6 rounded-lg shadow-sm" onSubmit={handleSubmit} suppressHydrationWarning>
        <h1 className="text-2xl font-medium mb-2">Sign up</h1>
        <p className="text-sm text-foreground mb-6">
          Already have an account?{" "}
          <Link className="text-primary font-medium underline" href="/sign-in">
            Sign in
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
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            suppressHydrationWarning
          />
          {errors.email && <p className="text-destructive text-sm mt-1">{errors.email}</p>}
          
          <Label htmlFor="password">Password</Label>
          <Input
            type="password"
            name="password"
            placeholder="Your password"
            minLength={6}
            required
            className="mb-4"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            suppressHydrationWarning
          />          {errors.password && <p className="text-destructive text-sm mt-1">{errors.password}</p>}
            <SubmitButton 
            pendingText="Signing up..." 
            formAction={signUpAction}
            className="w-full"
          >
            Sign up
          </SubmitButton>
          
          {error && (
            <div className="mt-4 p-2 border border-red-200 bg-red-50 rounded text-sm text-red-800">
              {error}
            </div>
          )}
        </div>
      </form>
    </div>
  );
}