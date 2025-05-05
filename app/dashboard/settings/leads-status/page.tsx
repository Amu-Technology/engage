'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { toast } from 'sonner'

interface LeadsStatus {
  id: string
  name: string
  color: string | null
}

export default function LeadsStatusPage() {
  const [leadsStatuses, setLeadsStatuses] = useState<LeadsStatus[]>([])
  const [newStatusName, setNewStatusName] = useState('')
  const [newStatusColor, setNewStatusColor] = useState('#000000')
  const [loading, setLoading] = useState(false)

  const fetchLeadsStatuses = useCallback(async () => {
    try {
      const response = await fetch('/api/leads-status')
      if (!response.ok) throw new Error('ステータスの取得に失敗しました')
      const data = await response.json()
      setLeadsStatuses(data)
    } catch (err) {
      console.error('エラー:', err)
      toast.error('ステータスの取得に失敗しました')
    }
  }, [])

  useEffect(() => {
    fetchLeadsStatuses()
  }, [fetchLeadsStatuses])

  const handleCreateStatus = async () => {
    if (!newStatusName.trim()) {
      toast.error('ステータス名を入力してください')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/leads-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newStatusName,
          color: newStatusColor,
        }),
      })

      if (!response.ok) throw new Error('ステータスの作成に失敗しました')

      toast.success('ステータスを作成しました')
      setNewStatusName('')
      setNewStatusColor('#000000')
      fetchLeadsStatuses()
    } catch (err) {
      console.error('エラー:', err)
      toast.error('ステータスの作成に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteStatus = async (id: string) => {
    if (!confirm('このステータスを削除してもよろしいですか？')) return

    setLoading(true)
    try {
      const response = await fetch(`/api/leads-status/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('ステータスの削除に失敗しました')

      toast.success('ステータスを削除しました')
      fetchLeadsStatuses()
    } catch (err) {
      console.error('エラー:', err)
      toast.error('ステータスの削除に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">リードステータス設定</h1>

      <Card className="p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">新規ステータス追加</h2>
        <div className="flex gap-4">
          <Input
            placeholder="ステータス名"
            value={newStatusName}
            onChange={(e) => setNewStatusName(e.target.value)}
            className="max-w-xs"
          />
          <input
            type="color"
            value={newStatusColor}
            onChange={(e) => setNewStatusColor(e.target.value)}
            className="w-10 h-10 p-1 rounded border"
          />
          <Button
            onClick={handleCreateStatus}
            disabled={loading || !newStatusName.trim()}
          >
            追加
          </Button>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">ステータス一覧</h2>
        <div className="space-y-4">
          {leadsStatuses.map((status) => (
            <div
              key={status.id}
              className="flex items-center justify-between p-4 border rounded-lg"
            >
              <div className="flex items-center gap-4">
                {status.color && (
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: status.color }}
                  />
                )}
                <span>{status.name}</span>
              </div>
              <Button
                variant="destructive"
                onClick={() => handleDeleteStatus(status.id)}
                disabled={loading}
              >
                削除
              </Button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
} 