'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Activity } from '@/types/activity'

interface ActivityStatsProps {
  activities: Activity[]
}

export function ActivityStats({ activities }: ActivityStatsProps) {
  const stats = {
    total: activities.length,
    byType: activities.reduce((acc, activity) => {
      acc[activity.type] = (acc[activity.type] || 0) + 1
      return acc
    }, {} as Record<string, number>),
    lastWeek: activities.filter(
      (activity) =>
        new Date(activity.createdAt) >
        new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    ).length,
    lastMonth: activities.filter(
      (activity) =>
        new Date(activity.createdAt) >
        new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    ).length,
  }

  const activityTypeLabels: Record<string, string> = {
    meeting: '面談',
    call: '電話',
    email: 'メール',
    other: 'その他',
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">総アクティビティ数</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.total}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">過去7日間</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.lastWeek}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">過去30日間</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.lastMonth}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">種類別アクティビティ</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Object.entries(stats.byType).map(([type, count]) => (
              <div key={type} className="flex justify-between">
                <span className="text-sm text-gray-500">
                  {activityTypeLabels[type]}
                </span>
                <span className="font-medium">{count}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 