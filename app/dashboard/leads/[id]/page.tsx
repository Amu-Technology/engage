'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import { toast } from 'sonner'
import { ActivityForm } from './components/ActivityForm'
import { ActivityActions } from './components/ActivityActions'
import { ActivityFilters } from './components/ActivityFilters'
import { ActivityStats } from './components/ActivityStats'
import { ActivityNotifications } from './components/ActivityNotifications'
import { Activity } from '@/types/activity'

interface Lead {
  id: string
  name: string
  nameReading: string | null
  email: string | null
  phone: string | null
  status: string
  statusId: string | null
  leadsStatus: {
    id: string
    name: string
    color: string | null
  } | null
}

interface StatusHistory {
  id: string
  oldStatus: {
    id: string
    name: string
    color: string | null
  } | null
  newStatus: {
    id: string
    name: string
    color: string | null
  }
  changedAt: string
}

export default function LeadDetailPage() {
  const params = useParams()
  const [lead, setLead] = useState<Lead | null>(null)
  const [activities, setActivities] = useState<Activity[]>([])
  const [statusHistory, setStatusHistory] = useState<StatusHistory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [activityType, setActivityType] = useState('all')

  const fetchActivities = useCallback(async () => {
    try {
      const response = await fetch(`/api/leads/${params.id}/activities`)
      if (!response.ok) throw new Error('アクティビティの取得に失敗しました')
      const data = await response.json()
      setActivities(data)
    } catch (error) {
      console.error('エラー:', error)
      toast.error('アクティビティの取得に失敗しました')
    }
  }, [params.id])

  useEffect(() => {
    const fetchLeadData = async () => {
      try {
        const response = await fetch(`/api/leads/${params.id}`)
        if (!response.ok) throw new Error('リード情報の取得に失敗しました')
        const data = await response.json()
        setLead(data)
      } catch (error) {
        console.error('エラー:', error)
        toast.error('リード情報の取得に失敗しました')
      }
    }

    const fetchStatusHistory = async () => {
      try {
        const response = await fetch(`/api/leads/${params.id}/status-history`)
        if (!response.ok) throw new Error('ステータス履歴の取得に失敗しました')
        const data = await response.json()
        setStatusHistory(data)
      } catch (error) {
        console.error('エラー:', error)
        toast.error('ステータス履歴の取得に失敗しました')
      } finally {
        setIsLoading(false)
      }
    }

    fetchLeadData()
    fetchActivities()
    fetchStatusHistory()
  }, [params.id, fetchActivities])

  const filteredActivities = activities.filter((activity) => {
    const matchesSearch = activity.description
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
    const matchesType = activityType === 'all' || activity.type === activityType
    return matchesSearch && matchesType
  })

  if (isLoading) {
    return <div className="p-4">読み込み中...</div>
  }

  if (!lead) {
    return <div className="p-4">リードが見つかりません</div>
  }

  return (
    <div className="container mx-auto p-4 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>リード情報</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">名前</p>
              <p className="font-medium">{lead.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">読み仮名</p>
              <p className="font-medium">{lead.nameReading || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">メールアドレス</p>
              <p className="font-medium">{lead.email || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">電話番号</p>
              <p className="font-medium">{lead.phone || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">ステータス</p>
              <div className="flex items-center gap-2">
                {lead.leadsStatus?.color && (
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: lead.leadsStatus.color }}
                  />
                )}
                <p className="font-medium">{lead.leadsStatus?.name || '-'}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="activities">
        <TabsList>
          <TabsTrigger value="activities">アクティビティ</TabsTrigger>
          <TabsTrigger value="status-history">ステータス履歴</TabsTrigger>
        </TabsList>
        <TabsContent value="activities">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>アクティビティ履歴</CardTitle>
              <div className="flex gap-2">
                <ActivityNotifications leadId={lead.id} />
                <ActivityForm leadId={lead.id} onSuccess={fetchActivities} />
              </div>
            </CardHeader>
            <CardContent>
              <ActivityStats activities={activities} />
              <ActivityFilters
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                activityType={activityType}
                onActivityTypeChange={setActivityType}
              />
              <div className="space-y-4">
                {filteredActivities.map((activity) => (
                  <div key={activity.id} className="border-l-2 border-gray-200 pl-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{activity.type}</p>
                        <ActivityForm
                          leadId={lead.id}
                          activity={activity}
                          onSuccess={fetchActivities}
                        />
                        <ActivityActions
                          leadId={lead.id}
                          activityId={activity.id}
                          onSuccess={fetchActivities}
                        />
                      </div>
                      <p className="text-sm text-gray-500">
                        {format(new Date(activity.createdAt), 'yyyy年MM月dd日 HH:mm', {
                          locale: ja,
                        })}
                      </p>
                    </div>
                    <p className="mt-1 text-gray-600">{activity.description}</p>
                  </div>
                ))}
                {filteredActivities.length === 0 && (
                  <p className="text-center text-gray-500">アクティビティはありません</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="status-history">
          <Card>
            <CardHeader>
              <CardTitle>ステータス変更履歴</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {statusHistory.map((history) => (
                  <div key={history.id} className="border-l-2 border-gray-200 pl-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {history.oldStatus ? (
                          <>
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: history.oldStatus.color || '#808080' }}
                            />
                            <span>{history.oldStatus.name}</span>
                          </>
                        ) : (
                          <span>未設定</span>
                        )}
                        <span>→</span>
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: history.newStatus.color || '#808080' }}
                        />
                        <span>{history.newStatus.name}</span>
                      </div>
                      <p className="text-sm text-gray-500">
                        {format(new Date(history.changedAt), 'yyyy年MM月dd日 HH:mm', {
                          locale: ja,
                        })}
                      </p>
                    </div>
                  </div>
                ))}
                {statusHistory.length === 0 && (
                  <p className="text-center text-gray-500">ステータス変更履歴はありません</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 