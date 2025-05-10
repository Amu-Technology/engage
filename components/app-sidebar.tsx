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
  IconChartBar,
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

const baseNavItems = [
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
        title: "リード管理",
        url: "/dashboard/leads",
        icon: IconUserCheck,
      },
      {
        title: "カレンダー",
        url: "/dashboard/calendar",
        icon: IconUserCheck,
      },
      {
        title: "マップ表示",
        url: "/dashboard/leads",
        icon: IconUserCheck,
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
      {
        title: "アクティビティ分析",
        url: "/dashboard/analytics",
        icon: IconChartBar,
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
      {
        title: "アクティビティタイプ設定",
        url: "/dashboard/settings/activity-types",
        icon: IconFolder,
      },
    ],
  },
];

const adminNavItem = {
  title: "システム管理",
  icon: IconUsers,
  children: [
    {
      title: "ユーザー管理",
      url: "/dashboard/admin",
      icon: IconUsers,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: session } = useSession();
  const { user } = useUser();

  const userData = {
    name: session?.user?.name || "",
    email: session?.user?.email || "",
    avatar: session?.user?.image || "",
    role: user?.role || "",
    organization: user?.organization,
  };

  const navItems = React.useMemo(() => {
    if (user?.role === "admin") {
      return [...baseNavItems, adminNavItem];
    }
    return baseNavItems;
  }, [user?.role]);

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
        <NavMain items={navItems} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
    </Sidebar>
  );
}
