import Link from "next/link";
import { Button } from "./ui/button";
import { ThemeSwitcher } from "./theme-switcher";

export default function NavBar() {
    return(
        <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
            <div className="w-full flex justify-between items-center p-3 px-5 text-sm">
            <div className="flex gap-5 text-lg items-center font-semibold">
                <Link href="/">EduSync</Link>
            </div>            <div className="flex gap-5 items-center">
                <ThemeSwitcher/>
                <Button asChild size="sm" variant={"default"}>
                <Link href="/sign-in">Sign in with Google</Link>
                </Button>
            </div>
            </div>
        </nav>
    );
}