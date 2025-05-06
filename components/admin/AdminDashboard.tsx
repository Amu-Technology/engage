'use client'

import { UserList } from './UserList'
import { OrganizationList } from './OrganizationList'

export function AdminDashboard() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">管理者ページ</h1>
      <div className="grid gap-4">
        <div className="p-4 border rounded-lg">
          <h2 className="text-xl font-semibold mb-2">ユーザー管理</h2>
          <UserList />
        </div>
        <div className="p-4 border rounded-lg">
          <h2 className="text-xl font-semibold mb-2">組織管理</h2>
          <OrganizationList />
        </div>
      </div>
    </div>
  )
} 