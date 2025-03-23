import Footer from "@/components/footer";
import NavBar from "@/components/navBar";
import ConnectSupabaseSteps from "@/components/tutorial/connect-supabase-steps";
import SignUpUserSteps from "@/components/tutorial/sign-up-user-steps";
import { Button } from "@/components/ui/button";
import { hasEnvVars } from "@/utils/supabase/check-env-vars";
import Link from "next/link";

export default async function Home() {
  return (
    <>
      <NavBar/>
      <main className="flex-1 flex flex-col gap-6 px-4">
        Main Page
      </main>
      <Footer/>
    </>
  );
}
