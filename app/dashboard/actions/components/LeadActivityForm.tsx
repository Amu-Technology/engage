'use client'

import { useState, useCallback, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { Search } from 'lucide-react'

interface Lead {
  id: string
  name: string
  nameReading: string | null
  nickname: string | null
  type: string
  district: string | null
  homePhone: string | null
  mobilePhone: string | null
  company: string | null
  position: string | null
  postalCode: string | null
  address: string | null
  email: string | null
  referrer: string | null
  evaluation: number | null
  status: string
  isPaid: boolean
}

interface ActivityType {
  id: string
  name: string
  color: string | null
  point: number
}

export function LeadActivityForm() {
  const [searchQuery, setSearchQuery] = useState('')
  const [leads, setLeads] = useState<Lead[]>([])
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [activityTypes, setActivityTypes] = useState<ActivityType[]>([])
  const [selectedActivityType, setSelectedActivityType] = useState<ActivityType | null>(null)
  const [activityContent, setActivityContent] = useState('')
  const [scheduledAt, setScheduledAt] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const fetchActivityTypes = async () => {
      try {
        const response = await fetch('/api/activity-types')
        if (!response.ok) {
          throw new Error('アクティビティタイプの取得に失敗しました')
        }
        const data = await response.json()
        setActivityTypes(data)
      } catch (error) {
        console.error('エラー:', error)
        toast.error('アクティビティタイプの取得に失敗しました')
      }
    }

    fetchActivityTypes()
  }, [])

  const searchLeads = useCallback(async () => {
    if (!searchQuery.trim()) return

    setIsLoading(true)
    try {
      const response = await fetch(`/api/leads/search?q=${encodeURIComponent(searchQuery)}`)
      if (!response.ok) {
        throw new Error('リードの検索に失敗しました')
      }
      const data = await response.json()
      setLeads(data)
    } catch (error) {
      console.error('エラー:', error)
      toast.error('リードの検索に失敗しました')
    } finally {
      setIsLoading(false)
    }
  }, [searchQuery])

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      searchLeads()
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedLead || !selectedActivityType || !activityContent) {
      toast.error('すべての項目を入力してください')
      return
    }

    const requestData = {
      leadId: selectedLead.id,
      typeId: selectedActivityType.id,
      type: selectedActivityType.name,
      description: activityContent,
      scheduledAt: scheduledAt || undefined
    }

    console.log('送信データ:', requestData)

    try {
      const response = await fetch('/api/lead-activities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      })

      let errorMessage = 'アクションの作成に失敗しました'
      try {
        const data = await response.json()
        if (!response.ok) {
          errorMessage = data.error || errorMessage
          throw new Error(errorMessage)
        }
        toast.success('アクションを作成しました')
        setSelectedActivityType(null)
        setActivityContent('')
        setScheduledAt('')
        setSelectedLead(null)
        setSearchQuery('')
        setLeads([])
      } catch (parseError) {
        console.error('レスポンスの解析エラー:', parseError)
        throw new Error(errorMessage)
      }
    } catch (error) {
      console.error('エラー:', error)
      toast.error(error instanceof Error ? error.message : 'アクションの作成に失敗しました')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          placeholder="リードを検索..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <Button onClick={searchLeads} disabled={isLoading}>
          <Search className="mr-2 h-4 w-4" />
          検索
        </Button>
      </div>

      {isLoading && <div>検索中...</div>}

      {leads.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-medium">検索結果</h3>
          <div className="grid gap-2">
            {leads.map((lead) => (
              <div
                key={lead.id}
                className="p-4 border rounded-lg hover:bg-accent cursor-pointer"
                onClick={() => setSelectedLead(lead)}
              >
                <div className="font-medium">{lead.name}</div>
                <div className="text-sm text-muted-foreground">
                  {lead.company || lead.email || lead.mobilePhone || '情報なし'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedLead && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <h3 className="font-medium">{selectedLead.name}のアクション設定</h3>
            <Select
              value={selectedActivityType?.id || ''}
              onValueChange={(value) => {
                const type = activityTypes.find(t => t.id === value)
                setSelectedActivityType(type || null)
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="アクションタイプを選択" />
              </SelectTrigger>
              <SelectContent>
                {activityTypes.map((type) => (
                  <SelectItem key={type.id} value={type.id}>
                    {type.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              placeholder="アクション内容"
              value={activityContent}
              onChange={(e) => setActivityContent(e.target.value)}
            />
            <Input
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
            />
            <Button type="submit">アクションを設定</Button>
          </div>
        </form>
      )}
    </div>
  )
} 