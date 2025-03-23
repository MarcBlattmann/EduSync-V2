"use client"

import * as React from "react"
import {
  AudioWaveform,
  BookOpen,
  Bot,
  Command,
  Frame,
  GalleryVerticalEnd,
  Map,
  PieChart,
  Settings2,
  SquareTerminal,
} from "lucide-react"

import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { NavMain } from "./nav-main"
import { NavUser } from "./nav-user"

// This is sample data.
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "Math",
      logo: GalleryVerticalEnd,
      plan: "Tomas",
    },
    {
        name: "German",
        logo: GalleryVerticalEnd,
        plan: "Johann",
      }
  ],
  navMain: [
    {
      title: "Activity",
      url: "#",
      icon: Map,
      isActive: true,
      items: [
        {
          title: "Calendar",
          url: "#",
        },
        {
          title: "Exams",
          url: "#",
        },
        {
          title: "Tasks",
          url: "#",
        },
      ],
    },
    {
        title: "Info",
        url: "#",
        icon: BookOpen,
        isActive: true,
        items: [
          {
            title: "Grades",
            url: "#",
          },
          {
            title: "Classes",
            url: "#",
          },
          {
            title: "Absences",
            url: "#",
          },
        ],
      }
]
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
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
