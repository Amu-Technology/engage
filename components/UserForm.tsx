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

interface User {
  id: string;
  name: string | null;
  email: string;
  role: string | null;
  org_id: number | null;
  created_at: Date | null;
  updated_at: Date | null;
  googleId: string | null;
}

interface Organization {
  id: number;
  name: string;
  users: User[];
  created_at: Date;
  updated_at: Date;
}

interface UserFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  user?: User;
}

export function UserForm({ isOpen, onClose, onSuccess, user }: UserFormProps) {
  const [name, setName] = useState(user?.name || '')
  const [email, setEmail] = useState(user?.email || '')
  const [role, setRole] = useState<'admin' | 'store_manager' | 'store_staff' | null>(user?.role as 'admin' | 'store_manager' | 'store_staff' | null || null)
  const [orgId, setOrgId] = useState<string>(user?.org_id?.toString() || '0')
  const [googleId, setGoogleId] = useState(user?.googleId || '')
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchOrganizations() {
      try {
        const response = await fetch('/api/organizations')
        if (!response.ok) {
          throw new Error('組織一覧の取得に失敗しました')
        }
        const data = await response.json()
        setOrganizations(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : '予期せぬエラーが発生しました')
      }
    }

    fetchOrganizations()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/users', {
        method: user ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: user?.id,
          name,
          email,
          role,
          org_id: orgId === '0' ? null : parseInt(orgId),
          googleId: googleId || null,
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
            <Label htmlFor="organization">所属組織</Label>
            <Select value={orgId} onValueChange={setOrgId}>
              <SelectTrigger>
                <SelectValue placeholder="組織を選択" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">未選択</SelectItem>
                {organizations.map((org) => (
                  <SelectItem key={org.id} value={org.id.toString()}>
                    {org.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="googleId">Google ID</Label>
            <Input
              id="googleId"
              value={googleId}
              onChange={(e) => setGoogleId(e.target.value)}
              placeholder="Google ID"
              disabled
              className="bg-gray-100"
            />
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