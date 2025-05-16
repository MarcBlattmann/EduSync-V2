"use client"

import { type LucideIcon } from "lucide-react"
import Link from "next/link"

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon?: LucideIcon
    isActive?: boolean
    noSubmenu?: boolean
    isHome?: boolean
    badge?: {
      text: string
      className: string
    }
  }[]
}){
  // Separate home item and regular items
  const homeItem = items.find(item => item.title === "Home");
  const regularItems = items.filter(item => item.title !== "Home");

  return (
    <>
      {homeItem && (
        <SidebarMenu className="px-2">
          <SidebarMenuItem key={homeItem.title}>
            <Link href={homeItem.url} className="w-full">
              <SidebarMenuButton tooltip={homeItem.title}>
                {homeItem.icon && <homeItem.icon />}                <span>{homeItem.title}</span>
                {homeItem.url === "#" && (
                  <SidebarMenuBadge className="ml-1.5 bg-orange-100 text-orange-800 dark:bg-orange-800/30 dark:text-orange-300">
                    Soon
                  </SidebarMenuBadge>
                )}
                {homeItem.badge && (
                  <SidebarMenuBadge className={`ml-1.5 ${homeItem.badge.className}`}>
                    {homeItem.badge.text}
                  </SidebarMenuBadge>
                )}
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
        </SidebarMenu>
      )}
      
      <SidebarGroup>
        <SidebarGroupLabel>Tools</SidebarGroupLabel>
        <SidebarMenu>
          {regularItems.map((item) => (
            <SidebarMenuItem key={item.title}>              <Link href={item.url} className="w-full">
                <SidebarMenuButton tooltip={item.title}>
                  {item.icon && <item.icon />}
                  <span>{item.title}</span>
                  {item.url === "#" && (
                    <SidebarMenuBadge className="ml-1.5 bg-orange-100 text-orange-800 dark:bg-orange-800/30 dark:text-orange-300">
                      Soon
                    </SidebarMenuBadge>
                  )}
                  {item.badge && (
                    <SidebarMenuBadge className={`ml-1.5 ${item.badge.className}`}>
                      {item.badge.text}
                    </SidebarMenuBadge>
                  )}
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroup>
    </>
  );
}
