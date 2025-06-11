import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"

type NavItem = {
  title: string
  url?: string
  iconKey?: string
  children?: NavItem[]
}

const baseNavItems: NavItem[] = [
  {
    title: "ダッシュボード",
    url: "/dashboard",
    iconKey: "dashboard",
  },
  {
    title: "名簿管理",
    iconKey: "userCheck",
    children: [
      { title: "リード管理", url: "/dashboard/leads", iconKey: "userCheck" },
      { title: "カレンダー", url: "/dashboard/calendar", iconKey: "userCheck" },
      { title: "マップ表示", url: "/dashboard/map", iconKey: "userCheck" },
    ],
  },
  {
    title: "実績管理",
    iconKey: "listDetails",
    children: [
      { title: "実績記録", url: "/dashboard/actions", iconKey: "listDetails" },
      { title: "アクティビティ分析", url: "/dashboard/analytics", iconKey: "chartBar" },
    ],
  },
  {
    title: "設定",
    iconKey: "settings",
    children: [
      { title: "リードグループ設定", url: "/dashboard/settings/groups", iconKey: "folder" },
      { title: "メモタイプ設定", url: "/dashboard/settings/memotypes", iconKey: "folder" },
      { title: "アクティビティタイプ設定", url: "/dashboard/settings/activity-types", iconKey: "folder" },
    ],
  },
];

const adminNavItem: NavItem = {
  title: "システム管理",
  iconKey: "users",
  children: [
    { title: "ユーザー管理", url: "/dashboard/admin", iconKey: "users" },
  ],
};


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
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
        <SiteHeader
          baseNavItems={baseNavItems}
          adminNavItem={adminNavItem}
        />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            {children}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
} 