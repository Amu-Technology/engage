'use client'

import { useEffect, useState } from 'react'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Search } from 'lucide-react'
import { toast } from 'sonner'

interface ActivityType {
  id: string
  name: string
  color: string | null
}

interface ActivityFiltersProps {
  searchQuery: string
  onSearchChange: (value: string) => void
  activityType: string
  onActivityTypeChange: (value: string) => void
}

export function ActivityFilters({
  searchQuery,
  onSearchChange,
  activityType,
  onActivityTypeChange,
}: ActivityFiltersProps) {
  const [activityTypes, setActivityTypes] = useState<ActivityType[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchActivityTypes = async () => {
      try {
        const response = await fetch('/api/activity-types')
        if (!response.ok) throw new Error('アクティビティタイプの取得に失敗しました')
        const data = await response.json()
        setActivityTypes(data)
      } catch (error) {
        console.error('エラー:', error)
        toast.error('アクティビティタイプの取得に失敗しました')
      } finally {
        setIsLoading(false)
      }
    }

    fetchActivityTypes()
  }, [])

  return (
    <div className="flex gap-4 mb-4">
      <div className="relative flex-1">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
        <Input
          placeholder="アクティビティを検索..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-8"
        />
      </div>
      <Select value={activityType} onValueChange={onActivityTypeChange} disabled={isLoading}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder={isLoading ? "読み込み中..." : "種類でフィルター"} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">すべて</SelectItem>
          {activityTypes.map((type) => (
            <SelectItem key={type.id} value={type.id}>
              <div className="flex items-center gap-2">
                {type.color && (
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: type.color }}
                  />
                )}
                <span>{type.name}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
} 