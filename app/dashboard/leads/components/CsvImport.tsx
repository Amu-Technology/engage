'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

interface CsvImportProps {
  onSuccess: () => void
}

export function CsvImport({ onSuccess }: CsvImportProps) {
  const [file, setFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleImport = async () => {
    if (!file) {
      toast.error('ファイルを選択してください')
      return
    }

    setIsLoading(true)
    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch('/api/leads/import', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('CSVのインポートに失敗しました')
      }

      toast.success('CSVのインポートが完了しました')
      onSuccess()
      setFile(null)
    } catch (error) {
      console.error('エラー:', error)
      toast.error('CSVのインポートに失敗しました')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex items-center space-x-2">
      <input
        type="file"
        accept=".csv"
        onChange={handleFileChange}
        className="hidden"
        id="csv-upload"
      />
      <Button
        variant="outline"
        onClick={() => document.getElementById('csv-upload')?.click()}
      >
        CSVインポート
      </Button>
      {file && (
        <Button onClick={handleImport} disabled={isLoading}>
          {isLoading ? 'インポート中...' : 'インポート実行'}
        </Button>
      )}
    </div>
  )
} 