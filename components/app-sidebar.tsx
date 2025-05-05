"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import * as React from "react";
import {
  IconCompass,
  IconDashboard,
  IconFolder,
  IconListDetails,
  IconUsers,
  IconUserCheck,
  IconSettings,
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
    title: "名簿管理",
    icon: IconUserCheck,
    children: [
      {
        title: "有権者名簿",
        url: "/dashboard/leads",
        icon: IconUserCheck,
      },
      {
        title: "団体名簿",
        url: "/dashboard/organizations",
        icon: IconListDetails,
      },
    ],
  },
  {
    title: "実績管理",
    icon: IconListDetails,
    children: [
      {
        title: "実績記録",
        url: "/dashboard/actions",
        icon: IconListDetails,
      },
    ],
  },
  {
    title: "設定",
    icon: IconSettings,
    children: [
      {
        title: "リードグループ設定",
        url: "/dashboard/settings/groups",
        icon: IconFolder,
      },
      {
        title: "メモタイプ設定",
        url: "/dashboard/settings/memotypes",
        icon: IconFolder,
      },
    ],
  },
  {
    title: "システム管理",
    icon: IconUsers,
    children: [
      {
        title: "ユーザー管理",
        url: "/",
        icon: IconUsers,
      },
    ],
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
                <span className="text-base font-semibold">Engage</span>
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
