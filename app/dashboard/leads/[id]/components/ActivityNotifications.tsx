'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { toast } from 'sonner'
import { Bell } from 'lucide-react'

const formSchema = z.object({
  email: z.string().email('有効なメールアドレスを入力してください'),
  days: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: '1以上の数値を入力してください',
  }),
})

type FormValues = z.infer<typeof formSchema>

interface ActivityNotificationsProps {
  leadId: string
}

export function ActivityNotifications({ leadId }: ActivityNotificationsProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      days: '7',
    },
  })

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/leads/${leadId}/notifications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      })

      if (!response.ok) {
        throw new Error('通知設定の保存に失敗しました')
      }

      toast.success('通知設定を保存しました')
      setOpen(false)
      form.reset()
    } catch (error) {
      console.error('エラー:', error)
      toast.error('通知設定の保存に失敗しました')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Bell className="mr-2 h-4 w-4" />
          通知設定
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>アクティビティ通知設定</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>通知先メールアドレス</FormLabel>
                  <FormControl>
                    <Input {...field} type="email" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="days"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>通知間隔（日数）</FormLabel>
                  <FormControl>
                    <Input {...field} type="number" min="1" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                キャンセル
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? '保存中...' : '保存'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
} 