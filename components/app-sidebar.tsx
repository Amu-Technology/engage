"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import * as React from "react";
import {
  IconChartBar,
  IconCompass,
  IconDashboard,
  IconFolder,
  IconListDetails,
  IconUsers,
} from "@tabler/icons-react";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import { useUser } from "@/app/providers/UserProvider";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const navMain = [
  {
    title: "ダッシュボード",
    url: "/dashboard",
    icon: IconDashboard,
  },
  {
    title: "売上目標",
    url: "/sales-target",
    icon: IconListDetails,
  },
  {
    title: "発注管理",
    url: "/order",
    icon: IconChartBar,
  },
  {
    title: "設定",
    url: "/settings",
    icon: IconFolder,
  },
  {
    title: "ユーザー管理",
    url: "/",
    icon: IconUsers,
  },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: session } = useSession();
  const { user } = useUser();

  const userData = {
    name: session?.user?.name || "",
    email: session?.user?.email || "",
    avatar: session?.user?.image || "",
    role: user?.role || "",
    store: user?.store?.name || "",
  };

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <Link href="/">
                <IconCompass className="!size-5" />
                <span className="text-base font-semibold">Qompass</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
    </Sidebar>
  );
}
