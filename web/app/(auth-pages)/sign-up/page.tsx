import { signUpAction } from "@/app/actions";
import { FormMessage, Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";

export default async function Signup(props: {
  searchParams: Promise<Message>;
}) {
  const searchParams = await props.searchParams;
  if ("message" in searchParams) {
    return (
      <div className="w-full flex-1 flex items-center h-screen sm:max-w-md justify-center gap-2 p-4">
        <FormMessage message={searchParams} />
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center w-full px-4 py-6">
      <form className="w-full max-w-sm mx-auto bg-background p-6 rounded-lg shadow-sm">
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
          <Input name="email" placeholder="you@example.com" required className="mb-2" />
          <Label htmlFor="password">Password</Label>
          <Input
            type="password"
            name="password"
            placeholder="Your password"
            minLength={6}
            required
            className="mb-4"
          />
          <SubmitButton 
            formAction={signUpAction} 
            pendingText="Signing up..."
            className="w-full"
          >
            Sign up
          </SubmitButton>
          <FormMessage message={searchParams} />
        </div>
      </form>
    </div>
  );
}
