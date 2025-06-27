"use client"

import Image from 'next/image'
import * as React from "react"
import { memo, useMemo } from "react"
import {
  Home,
  Settings2,
  BookOpen,
  FileText,
  Calendar as CalendarIcon,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarMenu,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { NavMain } from "./nav-main"
import { NavUser } from "./nav-user"
import Link from "next/link"

// Move the data outside of the component to prevent recreation on each render
const navigationData = {
  user: {
    name: "Max Mustermann",
    email: "m@mustermann.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Home",
      url: "/protected",
      icon: Home,
      noSubmenu: true, 
      isHome: true 
    },
    {
      title: "Calendar",
      url: "/protected/calendar",
      icon: CalendarIcon,
      noSubmenu: true,
    },
    {
      title: "Grades",
      url: "/protected/grades",
      icon: BookOpen,
      noSubmenu: true,
    },    {
      title: "Notes",
      url: "/protected/notes",
      icon: FileText,
      noSubmenu: true,
    }
  ]
};

// Memoized header component
const SidebarHeaderContent = memo(function SidebarHeaderContent({ isCollapsed }: { isCollapsed: boolean }) {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <Link href="/" className="w-full">
          <div className="flex items-center px-2 pt-3">
            <div className="font-semibold text-xl">
              {isCollapsed ? "E" : "EduSync"}
            </div>
          </div>
        </Link>
      </SidebarMenuItem>
    </SidebarMenu>
  );
});

// Memoized navigation items
const NavigationItems = memo(function NavigationItems() {
  return <NavMain items={navigationData.navMain} />;
});

// Memoized user information
const UserInformation = memo(function UserInformation() {
  return <NavUser user={navigationData.user} />;
});

// Main sidebar component with memoization
function AppSidebarBase({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";
  
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarHeaderContent isCollapsed={isCollapsed} />
      </SidebarHeader>
      <SidebarContent>
        <NavigationItems />
      </SidebarContent>
      <SidebarFooter> 
        <UserInformation />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}

export const AppSidebar = memo(AppSidebarBase);