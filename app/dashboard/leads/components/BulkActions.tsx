'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'

interface Group {
  id: string
  name: string
}

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
  groupId: string | null
  group: {
    id: string
    name: string
  } | null
  statusId: string | null
  leadsStatus: {
    id: string
    name: string
    color: string | null
  } | null
  groups?: {
    id: string
    groupId: string
  }[]
}

interface BulkActionsProps {
  selectedRows: { original: Lead }[]
  groups: Group[]
  leadsStatuses: { id: string; name: string; color: string | null }[]
  onGroupChange: (leadId: string, groupIds: string[]) => void
  onStatusChange: (leadId: string, statusId: string) => void
  onPaymentStatusChange: (leadId: string, isPaid: boolean) => void
  onLeadsUpdate: (leads: Lead[]) => void
}

export function BulkActions({
  selectedRows,
  groups,
  leadsStatuses,
  onGroupChange,
  onStatusChange,
  onPaymentStatusChange,
  onLeadsUpdate
}: BulkActionsProps) {
  const [selectedGroup, setSelectedGroup] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)

  const handleBulkGroupChange = async (groupId: string) => {
    if (!groupId) return
    setIsLoading(true)
    try {
      const selectedLeadIds = selectedRows.map(row => row.original.id)
      
      const response = await fetch(`/api/groups/${groupId}/leads`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadIds: selectedLeadIds }),
      })

      if (!response.ok) throw new Error('グループの更新に失敗しました')

      // 更新されたリードの情報を取得して状態を更新
      const updatedLeads = await fetch('/api/leads').then(res => res.json())
      onLeadsUpdate(updatedLeads)
      
      // 各リードに対してグループ変更を通知
      selectedLeadIds.forEach(leadId => {
        onGroupChange(leadId, [groupId])
      })
      
      toast.success(`${selectedLeadIds.length}件のリードのグループを更新しました`)
      setSelectedGroup('')
    } catch (err) {
      console.error('エラー:', err)
      toast.error('グループの更新に失敗しました')
    } finally {
      setIsLoading(false)
    }
  }

  const handleStatusChange = async () => {
    if (!selectedStatus) return
    setIsLoading(true)
    try {
      await Promise.all(
        selectedRows.map(row => 
          onStatusChange(row.original.id, selectedStatus)
        )
      )
      toast.success(`${selectedRows.length}件のリードのステータスを更新しました`)
      setSelectedStatus('')
    } catch (error) {
      console.error('エラー:', error)
      toast.error('ステータスの更新に失敗しました')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePaymentStatusChange = async () => {
    if (!selectedPaymentStatus) return
    setIsLoading(true)
    try {
      const isPaid = selectedPaymentStatus === 'paid'
      await Promise.all(
        selectedRows.map(row => 
          onPaymentStatusChange(row.original.id, isPaid)
        )
      )
      toast.success(`${selectedRows.length}件のリードの入金状況を更新しました`)
      setSelectedPaymentStatus('')
    } catch (error) {
      console.error('エラー:', error)
      toast.error('入金状況の更新に失敗しました')
    } finally {
      setIsLoading(false)
    }
  }

  if (selectedRows.length === 0) return null

  return (
    <div className="flex items-center gap-4 p-4 border rounded-lg bg-muted/50">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">選択中: {selectedRows.length}件</span>
      </div>

      <div className="flex items-center gap-2">
        <Select
          value={selectedGroup}
          onValueChange={setSelectedGroup}
          disabled={isLoading}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="グループを選択" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">グループなし</SelectItem>
            {groups.map((group) => (
              <SelectItem key={group.id} value={group.id}>
                {group.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          onClick={() => handleBulkGroupChange(selectedGroup)}
          disabled={!selectedGroup || isLoading}
          size="sm"
        >
          グループを設定
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <Select
          value={selectedStatus}
          onValueChange={setSelectedStatus}
          disabled={isLoading}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="ステータスを選択" />
          </SelectTrigger>
          <SelectContent>
            {leadsStatuses.map((status) => (
              <SelectItem key={status.id} value={status.id}>
                <div className="flex items-center gap-2">
                  {status.color && (
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: status.color }}
                    />
                  )}
                  <span>{status.name}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          onClick={handleStatusChange}
          disabled={!selectedStatus || isLoading}
          size="sm"
        >
          ステータスを設定
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <Select
          value={selectedPaymentStatus}
          onValueChange={setSelectedPaymentStatus}
          disabled={isLoading}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="入金状況を選択" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="paid">入金済み</SelectItem>
            <SelectItem value="unpaid">未入金</SelectItem>
          </SelectContent>
        </Select>
        <Button
          onClick={handlePaymentStatusChange}
          disabled={!selectedPaymentStatus || isLoading}
          size="sm"
        >
          入金状況を設定
        </Button>
      </div>
    </div>
  )
} 