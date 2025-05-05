'use client'

import { useState, useEffect } from 'react'
import { StoreForm } from '@/components/StoreForm'
import { Button } from '@/components/ui/button'

interface Store {
  id: number
  name: string
  address: string
  phone: string
  email: string
  status: 'active' | 'inactive' | 'archived'
  created_at: Date
  updated_at: Date
}

export default function StoresPage() {
  const [stores, setStores] = useState<Store[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedStore, setSelectedStore] = useState<Store | undefined>()

  const fetchStores = async () => {
    try {
      const response = await fetch('/api/stores')
      if (!response.ok) {
        throw new Error('店舗一覧の取得に失敗しました')
      }
      const data = await response.json()
      setStores(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : '予期せぬエラーが発生しました')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchStores()
  }, [])

  const handleEdit = (store: Store) => {
    setSelectedStore(store)
    setIsFormOpen(true)
  }

  const handleRegister = () => {
    setSelectedStore(undefined)
    setIsFormOpen(true)
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return '営業中'
      case 'inactive':
        return '休業中'
      case 'archived':
        return '閉店'
      default:
        return status
    }
  }

  return (
    <main className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">店舗一覧</h1>
        <Button onClick={handleRegister} className="bg-green-500 hover:bg-green-600">
          新規店舗登録
        </Button>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        {isLoading ? (
          <div className="p-4 text-center">読み込み中...</div>
        ) : error ? (
          <div className="p-4 text-red-500">{error}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    店舗名
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    住所
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    電話番号
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    メールアドレス
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ステータス
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    更新日
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {stores.map((store) => (
                  <tr key={store.id}>
                    <td className="px-6 py-4 whitespace-nowrap">{store.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{store.address}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{store.phone}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{store.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          store.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : store.status === 'inactive'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {getStatusLabel(store.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {new Date(store.updated_at).toLocaleDateString('ja-JP')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(store)}
                      >
                        編集
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <StoreForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSuccess={fetchStores}
        store={selectedStore}
      />
    </main>
  )
} 