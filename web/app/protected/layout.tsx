'use client';

import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { usePathname } from "next/navigation";
import { memo, useMemo } from "react";
import dynamic from "next/dynamic";

// Load the sidebar lazily only when needed, with no server-side rendering
const DynamicAppSidebar = dynamic(
  () => import('@/components/app-sidebar').then(mod => ({ 
    default: mod.AppSidebar 
  })),
  { ssr: false, loading: () => <div className="w-14 md:w-[240px] h-full" /> }
);

// Memoize the sidebar to prevent unnecessary re-renders
const MemoizedAppSidebar = memo(DynamicAppSidebar);

function ProtectedLayoutBase({
  children,
}: {
  children: React.ReactNode;
}) {
  // Use pathname to help with memoization
  const pathname = usePathname();
  
  // Use memoization to avoid unnecessary re-renders of children content
  const memoizedChildren = useMemo(() => children, [pathname]);

  return (
    <SidebarProvider>
      {/* Only load sidebar when needed with dynamic import */}
      <MemoizedAppSidebar />
      <SidebarInset>
        <main className="h-screen flex flex-col">
          {memoizedChildren}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

// Export memoized layout component to prevent unnecessary re-renders
export default memo(ProtectedLayoutBase);
