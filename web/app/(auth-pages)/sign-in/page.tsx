import { signInAction } from "@/app/actions";
import { FormMessage, Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";

export default async function Login(props: { searchParams: Promise<Message> }) {
  const searchParams = await props.searchParams;
  return (
    <div className="flex justify-center items-center w-full px-4 py-6">
      <form className="w-full max-w-sm mx-auto bg-background p-6 rounded-lg shadow-sm">
        <h1 className="text-2xl font-medium mb-2">Sign in</h1>
        <p className="text-sm text-foreground mb-6">
          Don't have an account?{" "}
          <Link className="text-foreground font-medium underline" href="/sign-up">
            Sign up
          </Link>
        </p>
        
        <div className="flex flex-col gap-3">
          <GoogleSignInButton />
          
          <div className="my-4">
            <Separator>
              <span className="mx-2 text-xs text-muted-foreground">OR</span>
            </Separator>
          </div>
          
          <Label htmlFor="email">Email</Label>
          <Input name="email" placeholder="you@example.com" required className="mb-2" />
          
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
          />
          
          <SubmitButton 
            pendingText="Signing In..." 
            formAction={signInAction}
            className="w-full"
          >
            Sign in
          </SubmitButton>
          
          <FormMessage message={searchParams} />
        </div>
      </form>
    </div>
  );
}
