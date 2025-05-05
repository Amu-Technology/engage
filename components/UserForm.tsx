'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface Store {
  id: number
  name: string
}

interface UserFormProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  user?: {
    id: string
    name: string | null
    email: string
    role: string | null
    store_id: number | null
  }
}

export function UserForm({ isOpen, onClose, onSuccess, user }: UserFormProps) {
  const [name, setName] = useState(user?.name || '')
  const [email, setEmail] = useState(user?.email || '')
  const [role, setRole] = useState<'admin' | 'store_manager' | 'store_staff' | null>(user?.role as 'admin' | 'store_manager' | 'store_staff' | null || null)
  const [storeId, setStoreId] = useState<string>(user?.store_id?.toString() || '0')
  const [stores, setStores] = useState<Store[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchStores() {
      try {
        const response = await fetch('/api/stores')
        if (!response.ok) {
          throw new Error('店舗一覧の取得に失敗しました')
        }
        const data = await response.json()
        setStores(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : '予期せぬエラーが発生しました')
      }
    }

    fetchStores()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/users', {
        method: user ? 'PATCH' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: user?.id,
          name,
          email,
          role,
          store_id: storeId === '0' ? null : parseInt(storeId),
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || '操作に失敗しました')
      }

      onSuccess()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : '予期せぬエラーが発生しました')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{user ? 'ユーザー情報の編集' : '新規ユーザー登録'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">名前</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="名前"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">メールアドレス</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="メールアドレス"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">権限</Label>
            <Select value={role || ''} onValueChange={(value: 'admin' | 'store_manager' | 'store_staff') => setRole(value)}>
              <SelectTrigger>
                <SelectValue placeholder="権限を選択" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">管理者</SelectItem>
                <SelectItem value="store_manager">店舗管理者</SelectItem>
                <SelectItem value="store_staff">店舗スタッフ</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="store">店舗</Label>
            <Select value={storeId} onValueChange={setStoreId}>
              <SelectTrigger>
                <SelectValue placeholder="店舗を選択" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">未選択</SelectItem>
                {stores.map((store) => (
                  <SelectItem key={store.id} value={store.id.toString()}>
                    {store.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              キャンセル
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? '処理中...' : user ? '更新' : '登録'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 