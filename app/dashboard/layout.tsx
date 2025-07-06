"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Icon, IconChartBar, IconDashboard, IconFolder, IconListDetails, IconSettings, IconUserCheck, IconUsers } from "@tabler/icons-react";

type NavItem = {
  title: string;
  url?: string;
  icon?: Icon;
  children?: NavItem[];
};

const baseNavItems: NavItem[] = [
  {
    title: "ダッシュボード",
    url: "/dashboard",
    icon: IconDashboard,
  },
  {
    title: "名簿管理",
    icon: IconUserCheck,
    children: [
      { title: "リード管理", url: "/dashboard/leads", icon: IconUserCheck },
      { title: "カレンダー", url: "/dashboard/calendar", icon: IconUserCheck },
      { title: "マップ表示", url: "/dashboard/map", icon: IconUserCheck },
    ],
  },
  {
    title: "実績管理",
    icon: IconListDetails,
    children: [
      { title: "実績記録", url: "/dashboard/actions", icon: IconListDetails },
      { title: "入金管理", url: "/dashboard/payments", icon: IconListDetails },
      {
        title: "イベント管理",
        url: "/dashboard/events",
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
      {
        title: "入金タイプ設定",
        url: "/dashboard/settings/payment-types",
        icon: IconFolder,
      },
    ],
  },
];

const adminNavItem: NavItem = {
  title: "システム管理",
  icon: IconUsers,
  children: [
    { title: "ユーザー管理", url: "/dashboard/admin", icon: IconUsers },
  ],
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar
        baseNavItems={baseNavItems}
        adminNavItem={adminNavItem}
        variant="inset"
      />
      <SidebarInset>
        <SiteHeader baseNavItems={baseNavItems} adminNavItem={adminNavItem} />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            {children}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
