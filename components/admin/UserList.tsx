'use client'

import { useState, useEffect } from 'react'
import { User, Organization } from '@prisma/client'

export function UserList() {
  const [users, setUsers] = useState<User[]>([])
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingUser, setEditingUser] = useState<User | null>(null)

  useEffect(() => {
    fetchUsers()
    fetchOrganizations()
  }, [])

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users')
      if (!response.ok) throw new Error('ユーザー一覧の取得に失敗しました')
      const data = await response.json()
      setUsers(data)
    } catch (error) {
      setError(error instanceof Error ? error.message : '予期せぬエラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  const fetchOrganizations = async () => {
    try {
      const response = await fetch('/api/admin/organizations')
      if (!response.ok) throw new Error('組織一覧の取得に失敗しました')
      const data = await response.json()
      setOrganizations(data)
    } catch (error) {
      setError(error instanceof Error ? error.message : '予期せぬエラーが発生しました')
    }
  }

  if (loading) return <div>読み込み中...</div>
  if (error) return <div className="text-red-500">{error}</div>

  return (
    <div>
      <table className="min-w-full">
        <thead>
          <tr>
            <th className="text-left">名前</th>
            <th className="text-left">メールアドレス</th>
            <th className="text-left">権限</th>
            <th className="text-left">組織</th>
            <th className="text-left">操作</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id}>
              <td className="py-2">
                {editingUser?.id === user.id ? (
                  <input
                    type="text"
                    value={editingUser.name ?? ''}
                    onChange={e => setEditingUser({ ...editingUser, name: e.target.value })}
                    className="border rounded px-2 py-1"
                  />
                ) : (
                  user.name
                )}
              </td>
              <td className="py-2">
                {editingUser?.id === user.id ? (
                  <input
                    type="email"
                    value={editingUser.email}
                    onChange={e => setEditingUser({ ...editingUser, email: e.target.value })}
                    className="border rounded px-2 py-1"
                  />
                ) : (
                  user.email
                )}
              </td>
              <td className="py-2">
                {editingUser?.id === user.id ? (
                  <select
                    value={editingUser.role ?? 'user'}
                    onChange={e => setEditingUser({ ...editingUser, role: e.target.value })}
                    className="border rounded px-2 py-1"
                  >
                    <option value="user">一般ユーザー</option>
                    <option value="admin">管理者</option>
                  </select>
                ) : (
                  user.role === 'admin' ? '管理者' : '一般ユーザー'
                )}
              </td>
              <td className="py-2">
                {editingUser?.id === user.id ? (
                  <select
                    value={editingUser.org_id?.toString() ?? ''}
                    onChange={e => setEditingUser({ ...editingUser, org_id: e.target.value ? parseInt(e.target.value) : null })}
                    className="border rounded px-2 py-1"
                  >
                    <option value="">組織なし</option>
                    {organizations.map(org => (
                      <option key={org.id} value={org.id}>
                        {org.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  organizations.find(org => org.id === user.org_id)?.name ?? '組織なし'
                )}
              </td>
              <td className="py-2">
                {editingUser?.id === user.id ? (
                  <div className="space-x-2">
                    <button
                      onClick={async () => {
                        try {
                          const response = await fetch('/api/admin/users', {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(editingUser)
                          })
                          if (!response.ok) throw new Error('ユーザーの更新に失敗しました')
                          await fetchUsers()
                          setEditingUser(null)
                        } catch (error) {
                          setError(error instanceof Error ? error.message : '予期せぬエラーが発生しました')
                        }
                      }}
                      className="text-blue-500 hover:text-blue-600"
                    >
                      保存
                    </button>
                    <button
                      onClick={() => setEditingUser(null)}
                      className="text-gray-500 hover:text-gray-600"
                    >
                      キャンセル
                    </button>
                  </div>
                ) : (
                  <div className="space-x-2">
                    <button
                      onClick={() => setEditingUser(user)}
                      className="text-blue-500 hover:text-blue-600"
                    >
                      編集
                    </button>
                    <button
                      onClick={async () => {
                        if (!confirm('このユーザーを削除してもよろしいですか？')) return
                        try {
                          const response = await fetch('/api/admin/users', {
                            method: 'DELETE',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ id: user.id })
                          })
                          if (!response.ok) throw new Error('ユーザーの削除に失敗しました')
                          await fetchUsers()
                        } catch (error) {
                          setError(error instanceof Error ? error.message : '予期せぬエラーが発生しました')
                        }
                      }}
                      className="text-red-500 hover:text-red-600"
                    >
                      削除
                    </button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
} 