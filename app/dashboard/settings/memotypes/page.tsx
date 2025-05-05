'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { Plus, Trash2 } from 'lucide-react'

interface MemoType {
  id: string
  name: string
  color: string | null
}

export default function MemoTypesPage() {
  const [memoTypes, setMemoTypes] = useState<MemoType[]>([])
  const [newName, setNewName] = useState('')
  const [newColor, setNewColor] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  const fetchMemoTypes = async () => {
    try {
      const response = await fetch('/api/memotypes')
      if (!response.ok) {
        throw new Error('メモタイプの取得に失敗しました')
      }
      const data = await response.json()
      setMemoTypes(data)
    } catch (error) {
      console.error('エラー:', error)
      toast.error('メモタイプの取得に失敗しました')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchMemoTypes()
  }, [])

  const handleAdd = async () => {
    if (!newName) {
      toast.error('名前を入力してください')
      return
    }

    try {
      const response = await fetch('/api/memotypes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newName,
          color: newColor || null,
        }),
      })

      if (!response.ok) {
        throw new Error('メモタイプの追加に失敗しました')
      }

      toast.success('メモタイプを追加しました')
      setNewName('')
      setNewColor('')
      fetchMemoTypes()
    } catch (error) {
      console.error('エラー:', error)
      toast.error('メモタイプの追加に失敗しました')
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/memotypes/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('メモタイプの削除に失敗しました')
      }

      toast.success('メモタイプを削除しました')
      fetchMemoTypes()
    } catch (error) {
      console.error('エラー:', error)
      toast.error('メモタイプの削除に失敗しました')
    }
  }

  if (isLoading) {
    return <div>読み込み中...</div>
  }

  return (
    <div className="py-2 px-4">
      <div className="flex justify-between items-center py-2">
        <h1 className="text-2xl font-bold">メモタイプ設定</h1>
      </div>
      <div className="flex space-x-2 py-4">
        <Input
          placeholder="新しいメモタイプ名"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
        />
        <Input
          type="color"
          value={newColor}
          onChange={(e) => setNewColor(e.target.value)}
          className="w-12"
        />
        <Button onClick={handleAdd}>
          <Plus className="h-4 w-4 mr-2" />
          追加
        </Button>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>名前</TableHead>
              <TableHead>色</TableHead>
              <TableHead>操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {memoTypes.map((type) => (
              <TableRow key={type.id}>
                <TableCell>{type.name}</TableCell>
                <TableCell>
                  {type.color && (
                    <div
                      className="w-6 h-6 rounded-full"
                      style={{ backgroundColor: type.color }}
                    />
                  )}
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(type.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
} 