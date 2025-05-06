import SignupClient from "./client";
import { Suspense } from "react";

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center w-full h-full">Loading...</div>}>
      <SignupClient />
    </Suspense>
  );
}
