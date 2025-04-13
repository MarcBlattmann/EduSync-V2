"use client"

import Image from 'next/image'
import * as React from "react"
import {
  AudioWaveform,
  BookOpen,
  Bot,
  Command,
  Frame,
  GalleryVerticalEnd,
  Home,
  Map,
  PieChart,
  Settings2,
  SquareTerminal,
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

// This is sample data.
const data = {
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
    }
  ]
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";
  
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <Link href="/" className="w-full">
              <div className="flex items-center px-2 pt-3">
                <div className="font-semibold text-xl">
                  {isCollapsed ? 
                    "E"
                    : 
                    "EduSync"
                  }
                </div>
              </div>
            </Link>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter> 
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}