"use client";

import { Separator } from "@/components/ui/separator"
import { Sidebar, SidebarTrigger } from "@/components/ui/sidebar"
import { ThemeToggle } from "@/components/theme-toggle"
import { usePathname } from "next/navigation"

type NavItem = {
  title: string
  url?: string
  iconKey?: string
  children?: NavItem[]
}

type AppSidebarProps = React.ComponentProps<typeof Sidebar> & {
  baseNavItems: NavItem[]
  adminNavItem: NavItem
}

function findTitleByUrl(allNavItems: NavItem[], targetUrl: string): string | null {
  for (const item of allNavItems) {
    if (item.url !== undefined && item.url === targetUrl) {
      return item.title;
    }

    if (item.children && item.children.length > 0) {
      const foundTitle = findTitleByUrl(item.children, targetUrl);
      if (foundTitle) {
        return item.title + " > " + foundTitle;
      }
    }
  }
  return null;
}

export function SiteHeader({
  baseNavItems,
  adminNavItem,
}: AppSidebarProps) {
  const url = usePathname();
  const allNavItems: NavItem[] = [ ...baseNavItems, adminNavItem ];
  const headerTitle = findTitleByUrl(allNavItems, url);

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <h1 className="text-base font-medium">{headerTitle}</h1>
        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />

        </div>
      </div>
    </header>
  )
}
