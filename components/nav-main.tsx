"use client"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Icon } from "@tabler/icons-react"
import { ChevronDown } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

interface MenuItem {
  title: string
  url?: string
  icon?: Icon
  children?: MenuItem[]
}

interface NavMainProps {
  items: MenuItem[]
}

export function NavMain({ items }: NavMainProps) {
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({})

  const toggleMenu = (title: string) => {
    setExpandedMenus(prev => ({
      ...prev,
      [title]: !prev[title]
    }))
  }

  const renderMenuItem = (item: MenuItem) => {
    if (item.children) {
      return (
        <SidebarMenuItem key={item.title}>
          <SidebarMenuButton
            onClick={() => toggleMenu(item.title)}
            className="flex items-center justify-between w-full"
          >
            <div className="flex items-center gap-2">
              {item.icon && <item.icon size={20} />}
              <span>{item.title}</span>
            </div>
            <ChevronDown
              size={16}
              className={`transition-transform ${
                expandedMenus[item.title] ? "rotate-180" : ""
              }`}
            />
          </SidebarMenuButton>
          {expandedMenus[item.title] && (
            <div className="pl-8 mt-1 space-y-1">
              {item.children.map(child => (
                <div key={child.title} className="py-1">
                  <Link
                    href={child.url || "#"}
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                  >
                    {child.icon && <child.icon size={16} />}
                    <span>{child.title}</span>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </SidebarMenuItem>
      )
    }

    return (
      <SidebarMenuItem key={item.title}>
        <SidebarMenuButton asChild tooltip={item.title}>
          <Link href={item.url || "#"} className="flex items-center gap-2">
            {item.icon && <item.icon size={20} />}
            <span>{item.title}</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    )
  }

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          {items.map(item => renderMenuItem(item))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
