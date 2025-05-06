import React, { useState } from 'react'

interface ActivityTypeFormProps {
  organizationId: number
  onSuccess?: () => void
  initialData?: {
    id: string
    name: string
    color: string
    point: number
  }
}

export function ActivityTypeForm({ organizationId, onSuccess, initialData }: ActivityTypeFormProps) {
  const [name, setName] = useState(initialData?.name || '')
  const [color, setColor] = useState(initialData?.color || '#000000')
  const [point, setPoint] = useState(initialData?.point || 0)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/activity-types', {
        method: initialData ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: initialData?.id,
          name,
          color,
          point,
          organizationId
        })
      })

      if (!response.ok) {
        throw new Error('アクティビティタイプの保存に失敗しました')
      }

      setName('')
      setColor('#000000')
      setPoint(0)
      onSuccess?.()
    } catch (error) {
      setError(error instanceof Error ? error.message : '予期せぬエラーが発生しました')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="text-red-500">{error}</div>}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          名前
        </label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={e => setName(e.target.value)}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>
      <div>
        <label htmlFor="color" className="block text-sm font-medium text-gray-700">
          色
        </label>
        <input
          type="color"
          id="color"
          value={color}
          onChange={e => setColor(e.target.value)}
          className="mt-1 block w-full h-10 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>
      <div>
        <label htmlFor="point" className="block text-sm font-medium text-gray-700">
          ポイント
        </label>
        <input
          type="number"
          id="point"
          value={point}
          onChange={e => setPoint(parseInt(e.target.value) || 0)}
          min="0"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
      >
        {isSubmitting ? '保存中...' : initialData ? '更新' : '作成'}
      </button>
    </form>
  )
} 