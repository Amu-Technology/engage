'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'

interface Group {
  id: string
  name: string
  createdAt: string
  updatedAt: string
}

interface ActivityType {
  id: string
  name: string
}

export function GroupActivityForm() {
  const [groups, setGroups] = useState<Group[]>([])
  const [selectedGroup, setSelectedGroup] = useState<string>('')
  const [selectedActivityType, setSelectedActivityType] = useState<ActivityType | null>(null)
  const [activityTypes, setActivityTypes] = useState<ActivityType[]>([])
  const [activityContent, setActivityContent] = useState('')
  const [scheduledAt, setScheduledAt] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const response = await fetch('/api/groups')
        if (!response.ok) {
          throw new Error('グループの取得に失敗しました')
        }
        const data = await response.json()
        setGroups(data)
      } catch (error) {
        console.error('エラー:', error)
        toast.error('グループの取得に失敗しました')
      }
    }

    fetchGroups()
  }, [])

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedGroup || !selectedActivityType || !activityContent || !scheduledAt) {
      toast.error('すべての項目を入力してください')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/group-activities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          groupId: selectedGroup,
          type: selectedActivityType.name,
          typeId: selectedActivityType.id,
          content: activityContent,
          scheduledAt,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'アクションの作成に失敗しました')
      }

      toast.success('アクションを作成しました')
      setSelectedActivityType(null)
      setActivityContent('')
      setScheduledAt('')
    } catch (error) {
      console.error('エラー:', error)
      toast.error(error instanceof Error ? error.message : 'アクションの作成に失敗しました')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Select value={selectedGroup} onValueChange={setSelectedGroup}>
          <SelectTrigger>
            <SelectValue placeholder="グループを選択" />
          </SelectTrigger>
          <SelectContent>
            {groups.map((group) => (
              <SelectItem key={group.id} value={group.id}>
                {group.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedActivityType?.id || ''} onValueChange={(value) => {
          const type = activityTypes.find(t => t.id === value)
          setSelectedActivityType(type || null)
        }}>
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

        <Button type="submit" disabled={isLoading}>
          アクションを設定
        </Button>
      </div>
    </form>
  )
} 