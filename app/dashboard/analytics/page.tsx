'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { format, subDays, subMonths } from 'date-fns'
import { toast } from 'sonner'
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts'
import { SectionCards } from '@/components/section-cards'
import { ChartAreaInteractive } from '@/components/chart-area-interactive'

interface Activity {
  id: string
  leadId: string
  type: string
  description: string
  createdAt: string
  updatedAt: string
  lead: {
    name: string
  }
}

interface ActivityStats {
  total: number
  byType: Record<string, number>
  byLead: Array<{
    leadId: string
    leadName: string
    count: number
  }>
  timeline: Array<{
    date: string
    count: number
  }>
}

export default function AnalyticsPage() {
  const [activities, setActivities] = useState<Activity[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [timeRange, setTimeRange] = useState<'week' | 'month'>('week')

  const fetchActivities = async () => {
    try {
      const response = await fetch('/api/activities')
      if (!response.ok) throw new Error('アクティビティの取得に失敗しました')
      const data = await response.json()
      setActivities(data)
    } catch (error) {
      console.error('エラー:', error)
      toast.error('アクティビティの取得に失敗しました')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchActivities()
  }, [])

  const getStats = (): ActivityStats => {
    const now = new Date()
    const startDate = timeRange === 'week' 
      ? subDays(now, 7)
      : subMonths(now, 1)

    const filteredActivities = activities.filter(
      activity => new Date(activity.createdAt) >= startDate
    )

    // 種類別集計
    const byType = filteredActivities.reduce((acc, activity) => {
      acc[activity.type] = (acc[activity.type] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // リード別集計
    const byLead = filteredActivities.reduce((acc, activity) => {
      const existing = acc.find(item => item.leadId === activity.leadId)
      if (existing) {
        existing.count++
      } else {
        acc.push({
          leadId: activity.leadId,
          leadName: activity.lead.name,
          count: 1
        })
      }
      return acc
    }, [] as Array<{ leadId: string; leadName: string; count: number }>)
    byLead.sort((a, b) => b.count - a.count)

    // 時系列データ
    const timeline = Array.from({ length: timeRange === 'week' ? 7 : 30 }, (_, i) => {
      const date = timeRange === 'week'
        ? subDays(now, 6 - i)
        : subDays(now, 29 - i)
      const count = filteredActivities.filter(
        activity => format(new Date(activity.createdAt), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
      ).length
      return {
        date: format(date, 'MM/dd'),
        count
      }
    })

    return {
      total: filteredActivities.length,
      byType,
      byLead: byLead.slice(0, 10), // 上位10件のみ表示
      timeline
    }
  }

  const stats = getStats()

  const activityTypeLabels: Record<string, string> = {
    meeting: '面談',
    call: '電話',
    email: 'メール',
    other: 'その他',
  }

  if (isLoading) {
    return <div className="p-4">読み込み中...</div>
  }

  const sectionCards = [
    {
      title: '総アクティビティ数',
      value: stats.total,
      description: '期間内の総アクティビティ数',
    },
    ...Object.entries(stats.byType).map(([type, count]) => ({
      title: activityTypeLabels[type] || type,
      value: count,
      description: `${activityTypeLabels[type] || type}のアクティビティ数`,
    })),
  ]

  return (
    <div className="container mx-auto p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">アクティビティ分析</h1>
        <Tabs value={timeRange} onValueChange={(value) => setTimeRange(value as 'week' | 'month')}>
          <TabsList>
            <TabsTrigger value="week">週間</TabsTrigger>
            <TabsTrigger value="month">月間</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <SectionCards cards={sectionCards} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>アクティビティ推移</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartAreaInteractive
              data={stats.timeline}
              xAxisKey="date"
              yAxisKey="count"
              title="アクティビティ推移"
              description="日別のアクティビティ数を表示"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>リード別アクティビティ数</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.byLead}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="leadName" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 