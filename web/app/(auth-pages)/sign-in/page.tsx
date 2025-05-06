import SignInClient from "./client";
import { Suspense } from "react";

export default function SignInPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center w-full h-full">Loading...</div>}>
      <SignInClient />
    </Suspense>
  );
}
