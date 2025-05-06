'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { toast } from 'sonner'
import { Trash2 } from 'lucide-react'

interface ActivityActionsProps {
  leadId: string
  activityId: string
  onSuccess: () => void
}

export function ActivityActions({ leadId, activityId, onSuccess }: ActivityActionsProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleDelete = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/leads/${leadId}/activities/${activityId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('アクティビティの削除に失敗しました')
      }

      toast.success('アクティビティを削除しました')
      onSuccess()
    } catch (error) {
      console.error('エラー:', error)
      toast.error('アクティビティの削除に失敗しました')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Trash2 className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>アクティビティの削除</AlertDialogTitle>
          <AlertDialogDescription>
            このアクティビティを削除してもよろしいですか？
            この操作は取り消すことができません。
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>キャンセル</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isLoading}
            className="bg-red-500 hover:bg-red-600"
          >
            {isLoading ? '削除中...' : '削除'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
} 