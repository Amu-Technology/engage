'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { MemoForm } from '@/components/memo-form'
import { MemoList } from '@/components/memo-list'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { ArrowLeft } from 'lucide-react'

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

export default function LeadDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [lead, setLead] = useState<Lead | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchLead = useCallback(async () => {
    try {
      const response = await fetch(`/api/leads/${params.id}`)
      if (!response.ok) {
        throw new Error('リードの取得に失敗しました')
      }
      const data = await response.json()
      setLead(data)
    } catch (error) {
      console.error('エラー:', error)
      toast.error('リードの取得に失敗しました')
    } finally {
      setIsLoading(false)
    }
  }, [params.id])

  useEffect(() => {
    fetchLead()
  }, [fetchLead])

  if (isLoading) {
    return <div>読み込み中...</div>
  }

  if (!lead) {
    return <div>リードが見つかりません</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push('/dashboard/leads')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          ダッシュボードに戻る
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>{lead.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">読み仮名</p>
              <p>{lead.nameReading || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">ニックネーム</p>
              <p>{lead.nickname || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">タイプ</p>
              <p>{lead.type}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">地区</p>
              <p>{lead.district || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">自宅電話</p>
              <p>{lead.homePhone || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">携帯電話</p>
              <p>{lead.mobilePhone || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">会社</p>
              <p>{lead.company || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">役職</p>
              <p>{lead.position || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">郵便番号</p>
              <p>{lead.postalCode || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">住所</p>
              <p>{lead.address || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">メールアドレス</p>
              <p>{lead.email || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">紹介者</p>
              <p>{lead.referrer || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">評価</p>
              <p>{lead.evaluation || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">ステータス</p>
              <p>{lead.status}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">有料会員</p>
              <p>{lead.isPaid ? 'はい' : 'いいえ'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>メモ</CardTitle>
            <MemoForm leadId={lead.id} onSuccess={fetchLead} />
          </div>
        </CardHeader>
        <CardContent>
          <MemoList leadId={lead.id} />
        </CardContent>
      </Card>
    </div>
  )
} 