'use client'

import { useState, useEffect } from 'react'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { toast } from 'sonner'
import { Plus, Pencil } from 'lucide-react'

const formSchema = z.object({
  type: z.string().min(1, 'アクティビティの種類を選択してください'),
  description: z.string().min(1, '詳細を入力してください'),
})

type FormValues = z.infer<typeof formSchema>

interface ActivityType {
  id: string
  name: string
  color: string | null
  point: number
}

interface Activity {
  id: string;
  leadId: string;
  type: string;
  typeId: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  lead: {
    name: string;
  };
}

interface ActivityFormProps {
  leadId: string
  onSuccess: () => void
  activity?: Activity
}

export function ActivityForm({ leadId, onSuccess, activity }: ActivityFormProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [activityTypes, setActivityTypes] = useState<ActivityType[]>([])

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: activity?.typeId || '',
      description: activity?.description || '',
    },
  })

  useEffect(() => {
    const fetchActivityTypes = async () => {
      try {
        const response = await fetch('/api/activity-types')
        if (!response.ok) throw new Error('アクティビティタイプの取得に失敗しました')
        const data = await response.json()
        setActivityTypes(data)
      } catch (error) {
        console.error('エラー:', error)
        toast.error('アクティビティタイプの取得に失敗しました')
      }
    }

    fetchActivityTypes()
  }, [])

  useEffect(() => {
    if (activity) {
      form.reset({
        type: activity.typeId,
        description: activity.description,
      })
    }
  }, [activity, form])

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true)
    try {
      const url = activity
        ? `/api/leads/${leadId}/activities/${activity.id}`
        : `/api/leads/${leadId}/activities`
      const method = activity ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          typeId: values.type,
          type: activityTypes.find(t => t.id === values.type)?.name || '',
          description: values.description,
        }),
      })

      if (!response.ok) {
        throw new Error('アクティビティの保存に失敗しました')
      }

      toast.success(
        activity
          ? 'アクティビティを更新しました'
          : 'アクティビティを記録しました'
      )
      setOpen(false)
      form.reset()
      onSuccess()
    } catch (error) {
      console.error('エラー:', error)
      toast.error('アクティビティの保存に失敗しました')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {activity ? (
          <Button variant="ghost" size="sm">
            <Pencil className="h-4 w-4" />
          </Button>
        ) : (
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            アクティビティを記録
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {activity ? 'アクティビティの編集' : 'アクティビティの記録'}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>アクティビティの種類</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="種類を選択" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {activityTypes.map((type) => (
                        <SelectItem key={type.id} value={type.id}>
                          <div className="flex items-center gap-2">
                            {type.color && (
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: type.color }}
                              />
                            )}
                            <span>{type.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>詳細</FormLabel>
                  <FormControl>
                    <Input {...field} />
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
                {isLoading
                  ? activity
                    ? '更新中...'
                    : '記録中...'
                  : activity
                    ? '更新'
                    : '記録'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
} 