import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <main className="h-screen flex flex-col">
                {children}
                </main>
            </SidebarInset>
        </SidebarProvider>
    </>
  );
}
