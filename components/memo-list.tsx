'use client'

import { useEffect, useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'

interface MemoType {
  id: string
  name: string
  color: string | null
}

interface Memo {
  id: string
  note: string
  type: string
  timestamp: string
  memoType?: MemoType
}

interface MemoListProps {
  leadId: string
}

export function MemoList({ leadId }: MemoListProps) {
  const [memos, setMemos] = useState<Memo[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchMemos = useCallback(async () => {
    try {
      const response = await fetch(`/api/memos?leadId=${leadId}`)
      if (!response.ok) {
        throw new Error('メモの取得に失敗しました')
      }
      const data = await response.json()
      setMemos(data)
    } catch (error) {
      console.error('エラー:', error)
    } finally {
      setIsLoading(false)
    }
  }, [leadId])

  useEffect(() => {
    fetchMemos()
  }, [fetchMemos])

  if (isLoading) {
    return <div>読み込み中...</div>
  }

  return (
    <div className="space-y-4">
      {memos.map((memo) => (
        <Card key={memo.id}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm text-muted-foreground">
                {format(new Date(memo.timestamp), 'yyyy年MM月dd日 HH:mm', {
                  locale: ja,
                })}
              </CardTitle>
              {memo.memoType && (
                <div className="flex items-center">
                  {memo.memoType.color && (
                    <div
                      className="w-3 h-3 rounded-full mr-2"
                      style={{ backgroundColor: memo.memoType.color }}
                    />
                  )}
                  <span className="text-sm text-muted-foreground">
                    {memo.memoType.name}
                  </span>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap">{memo.note}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
} 