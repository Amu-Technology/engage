'use client'

import { useState, useEffect } from 'react'
import { Organization } from '@prisma/client'

export function OrganizationList() {
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingOrg, setEditingOrg] = useState<Organization | null>(null)
  const [newOrgName, setNewOrgName] = useState('')

  useEffect(() => {
    fetchOrganizations()
  }, [])

  const fetchOrganizations = async () => {
    try {
      const response = await fetch('/api/admin/organizations')
      if (!response.ok) throw new Error('組織一覧の取得に失敗しました')
      const data = await response.json()
      setOrganizations(data)
    } catch (error) {
      setError(error instanceof Error ? error.message : '予期せぬエラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div>読み込み中...</div>
  if (error) return <div className="text-red-500">{error}</div>

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <input
          type="text"
          value={newOrgName}
          onChange={e => setNewOrgName(e.target.value)}
          placeholder="新しい組織名"
          className="border rounded px-2 py-1"
        />
        <button
          onClick={async () => {
            try {
              const response = await fetch('/api/admin/organizations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newOrgName })
              })
              if (!response.ok) throw new Error('組織の作成に失敗しました')
              await fetchOrganizations()
              setNewOrgName('')
            } catch (error) {
              setError(error instanceof Error ? error.message : '予期せぬエラーが発生しました')
            }
          }}
          className="bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600"
        >
          追加
        </button>
      </div>
      <table className="min-w-full">
        <thead>
          <tr>
            <th className="text-left">組織名</th>
            <th className="text-left">操作</th>
          </tr>
        </thead>
        <tbody>
          {organizations.map(org => (
            <tr key={org.id}>
              <td className="py-2">
                {editingOrg?.id === org.id ? (
                  <input
                    type="text"
                    value={editingOrg.name}
                    onChange={e => setEditingOrg({ ...editingOrg, name: e.target.value })}
                    className="border rounded px-2 py-1"
                  />
                ) : (
                  org.name
                )}
              </td>
              <td className="py-2">
                {editingOrg?.id === org.id ? (
                  <div className="space-x-2">
                    <button
                      onClick={async () => {
                        try {
                          const response = await fetch('/api/admin/organizations', {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(editingOrg)
                          })
                          if (!response.ok) throw new Error('組織の更新に失敗しました')
                          await fetchOrganizations()
                          setEditingOrg(null)
                        } catch (error) {
                          setError(error instanceof Error ? error.message : '予期せぬエラーが発生しました')
                        }
                      }}
                      className="text-blue-500 hover:text-blue-600"
                    >
                      保存
                    </button>
                    <button
                      onClick={() => setEditingOrg(null)}
                      className="text-gray-500 hover:text-gray-600"
                    >
                      キャンセル
                    </button>
                  </div>
                ) : (
                  <div className="space-x-2">
                    <button
                      onClick={() => setEditingOrg(org)}
                      className="text-blue-500 hover:text-blue-600"
                    >
                      編集
                    </button>
                    <button
                      onClick={async () => {
                        if (!confirm('この組織を削除してもよろしいですか？')) return
                        try {
                          const response = await fetch('/api/admin/organizations', {
                            method: 'DELETE',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ id: org.id })
                          })
                          if (!response.ok) throw new Error('組織の削除に失敗しました')
                          await fetchOrganizations()
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