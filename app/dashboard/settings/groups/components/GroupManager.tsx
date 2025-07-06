'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { Plus, Trash2 } from 'lucide-react'

interface Group {
  id: string
  name: string
  createdAt: string
  updatedAt: string
}

export function GroupManager() {
  const [groups, setGroups] = useState<Group[]>([])
  const [newGroupName, setNewGroupName] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const fetchGroups = useCallback(async () => {
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
  }, [])

  useEffect(() => {
    fetchGroups()
  }, [fetchGroups])

  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) return

    setIsLoading(true)
    try {
      const response = await fetch('/api/groups', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newGroupName }),
      })

      if (!response.ok) {
        throw new Error('グループの作成に失敗しました')
      }

      toast.success('グループを作成しました')
      setNewGroupName('')
      fetchGroups()
    } catch (error) {
      console.error('エラー:', error)
      toast.error('グループの作成に失敗しました')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteGroup = async (groupId: string) => {
    if (!confirm('このグループを削除してもよろしいですか？')) return

    try {
      const response = await fetch(`/api/groups/${groupId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('グループの削除に失敗しました')
      }

      toast.success('グループを削除しました')
      fetchGroups()
    } catch (error) {
      console.error('エラー:', error)
      toast.error('グループの削除に失敗しました')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          placeholder="新しいグループ名"
          value={newGroupName}
          onChange={(e) => setNewGroupName(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleCreateGroup()
            }
          }}
        />
        <Button onClick={handleCreateGroup} disabled={isLoading}>
          <Plus className="mr-2 h-4 w-4" />
          追加
        </Button>
      </div>

      <div className="space-y-2">
        <h3 className="leading-none font-semibold">グループ一覧</h3>
        <div className="grid gap-2">
          {groups.map((group) => (
            <div
              key={group.id}
              className="flex items-center justify-between p-4 border rounded-lg"
            >
              <div>{group.name}</div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDeleteGroup(group.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
} 