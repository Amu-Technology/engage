'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MemoForm } from '@/components/memo-form'
import { MemoList } from '@/components/memo-list'
import { toast } from 'sonner'
import { Search } from 'lucide-react'

interface Lead {
  id: string
  name: string
  nameReading: string | null
  nickname: string | null
  type: string
  district: string | null
  homePhone: string | null
  mobilePhone: string | null
  company: string | null
  position: string | null
  postalCode: string | null
  address: string | null
  email: string | null
  referrer: string | null
  evaluation: number | null
  status: string
  isPaid: boolean
}

export default function ActionsPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [leads, setLeads] = useState<Lead[]>([])
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const searchLeads = useCallback(async () => {
    if (!searchQuery.trim()) return

    setIsLoading(true)
    try {
      const response = await fetch(`/api/leads/search?q=${encodeURIComponent(searchQuery)}`)
      if (!response.ok) {
        throw new Error('リードの検索に失敗しました')
      }
      const data = await response.json()
      setLeads(data)
    } catch (error) {
      console.error('エラー:', error)
      toast.error('リードの検索に失敗しました')
    } finally {
      setIsLoading(false)
    }
  }, [searchQuery])

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      searchLeads()
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push('/dashboard/leads')}
        >
          ダッシュボードに戻る
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>アクション</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="リードを検索..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
              />
              <Button onClick={searchLeads} disabled={isLoading}>
                <Search className="mr-2 h-4 w-4" />
                検索
              </Button>
            </div>

            {isLoading && <div>検索中...</div>}

            {leads.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-medium">検索結果</h3>
                <div className="grid gap-2">
                  {leads.map((lead) => (
                    <div
                      key={lead.id}
                      className="p-4 border rounded-lg hover:bg-accent cursor-pointer"
                      onClick={() => setSelectedLead(lead)}
                    >
                      <div className="font-medium">{lead.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {lead.company || lead.email || lead.mobilePhone || '情報なし'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedLead && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">{selectedLead.name}のメモ</h3>
                  <MemoForm leadId={selectedLead.id} onSuccess={() => {}} />
                </div>
                <MemoList leadId={selectedLead.id} />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 