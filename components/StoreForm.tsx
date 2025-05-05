'use client'

import { useState } from 'react'
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

interface StoreFormProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  store?: {
    id: number
    name: string
    address: string
    phone: string
    email: string
    status: 'active' | 'inactive' | 'archived'
  }
}

export function StoreForm({ isOpen, onClose, onSuccess, store }: StoreFormProps) {
  const [name, setName] = useState(store?.name || '')
  const [address, setAddress] = useState(store?.address || '')
  const [phone, setPhone] = useState(store?.phone || '')
  const [email, setEmail] = useState(store?.email || '')
  const [status, setStatus] = useState<'active' | 'inactive' | 'archived'>(store?.status || 'active')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/stores', {
        method: store ? 'PATCH' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: store?.id,
          name,
          address,
          phone,
          email,
          status,
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
          <DialogTitle>{store ? '店舗情報の編集' : '新規店舗登録'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">店舗名</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="店舗名"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">住所</Label>
            <Input
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="住所"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">電話番号</Label>
            <Input
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="電話番号"
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
            <Label htmlFor="status">ステータス</Label>
            <Select value={status} onValueChange={(value: 'active' | 'inactive' | 'archived') => setStatus(value)}>
              <SelectTrigger>
                <SelectValue placeholder="ステータスを選択" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">営業中</SelectItem>
                <SelectItem value="inactive">休業中</SelectItem>
                <SelectItem value="archived">閉店</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              キャンセル
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? '処理中...' : store ? '更新' : '登録'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 