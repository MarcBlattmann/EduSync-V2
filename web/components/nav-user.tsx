"use client"

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

import {
  BadgeCheck,
  Bell,
  ChevronsUpDown,
  CreditCard,
  LogOut,
  MoonIcon,
  Settings,
  Sparkles,
  Sun,
  MessageSquarePlus,
} from "lucide-react"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

export function NavUser({
  user: initialUser,
}: {
  user?: {
    name?: string
    email?: string
    avatar?: string
  }
}) {
  const { isMobile } = useSidebar()
  const { theme, setTheme } = useTheme()
  const router = useRouter()
  const supabase = createClient()
  const [user, setUser] = useState(initialUser || { name: "", email: "", avatar: "" })
  const [loading, setLoading] = useState(true)
  
  const isDark = theme === "dark"
  
  const toggleTheme = () => {
    setTheme(isDark ? "light" : "dark")
  }

  useEffect(() => {
    async function fetchUserData() {
      try {
        const { data: { user: authUser }, error } = await supabase.auth.getUser()
        
        if (error) {
          console.error("Error fetching user:", error)
          return
        }

        if (authUser) {
          setUser({
            name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || "User",
            email: authUser.email || "",
            avatar: authUser.user_metadata?.avatar_url || "",
          })
        }
      } catch (error) {
        console.error("Error in fetching user data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [supabase])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.refresh()
    router.push('/sign-in')
  }

  // Display initials for avatar fallback
  const initials = user.name
    ? user.name
        .split(' ')
        .map(name => name[0])
        .join('')
        .toUpperCase()
    : "U";

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="rounded-lg">{initials}</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{user.name}</span>
                <span className="truncate text-xs">{user.email}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="rounded-lg">{initials}</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{user.name}</span>
                  <span className="truncate text-xs">{user.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <a href="https://edu-sync.supahub.com/b/feature-requests" target="_blank" rel="noopener noreferrer" className="flex items-center cursor-pointer">
                  <MessageSquarePlus className="size-4 mr-2" />
                  Request Feature
                </a>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={toggleTheme}>
                {isDark ? (
                  <Sun className="size-4 mr-2" />
                ) : (
                  <MoonIcon className="size-4 mr-2" />
                )}
                {isDark ? "Light" : "Dark"} Mode
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="size-4 mr-2" />
                Settings
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="size-4 mr-2" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
