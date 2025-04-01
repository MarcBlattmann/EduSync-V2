"use client"

import { ChevronRight, type LucideIcon } from "lucide-react"
import Link from "next/link"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
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
    items?: {
      title: string
      url: string
    }[]
  }[]
}) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Home</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          if (item.noSubmenu) {
            return (
              <SidebarMenuItem key={item.title}>
                <Link href={item.url} className="w-full">
                  <SidebarMenuButton tooltip={item.title}>
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                    {item.url === "#" && (
                      <SidebarMenuBadge className="ml-1.5 bg-orange-100 text-orange-800 dark:bg-orange-800/30 dark:text-orange-300">
                        Soon
                      </SidebarMenuBadge>
                    )}
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            );
          }
          
          return (
            <Collapsible
              key={item.title}
              asChild
              defaultOpen={item.isActive}
              className="group/collapsible"
            >
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton tooltip={item.title}>
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                    <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {item.items?.map((subItem) => (
                      <SidebarMenuSubItem key={subItem.title}>
                        <Link href={subItem.url} legacyBehavior passHref>
                          <SidebarMenuSubButton>
                            <span>{subItem.title}</span>
                            {subItem.url === "#" && (
                              <span className="ml-1.5 rounded-sm bg-orange-100 px-1 py-0.5 text-[10px] font-medium text-orange-800 dark:bg-orange-800/30 dark:text-orange-300">
                                Soon
                              </span>
                            )}
                          </SidebarMenuSubButton>
                        </Link>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
