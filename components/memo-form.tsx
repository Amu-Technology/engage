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
import { Plus } from 'lucide-react'

const formSchema = z.object({
  note: z.string().min(1, 'メモを入力してください'),
  type: z.string().min(1, 'メモタイプを選択してください'),
})

type FormValues = z.infer<typeof formSchema>

interface MemoType {
  id: string
  name: string
  color: string | null
}

interface MemoFormProps {
  leadId: string
  onSuccess: () => void
}

export function MemoForm({ leadId, onSuccess }: MemoFormProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [memoTypes, setMemoTypes] = useState<MemoType[]>([])

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      note: '',
      type: '',
    },
  })

  useEffect(() => {
    const fetchMemoTypes = async () => {
      try {
        const response = await fetch('/api/memotypes')
        
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'メモタイプの取得に失敗しました')
        }
        
        const data = await response.json()
        setMemoTypes(data)
      } catch (error) {
        console.error('メモタイプ取得エラー:', error)
        toast.error(error instanceof Error ? error.message : 'メモタイプの取得に失敗しました')
      }
    }

    fetchMemoTypes()
  }, [])

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/memos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          leadId,
          ...values,
        }),
      })

      if (!response.ok) {
        throw new Error('メモの保存に失敗しました')
      }

      toast.success('メモを追加しました')
      setOpen(false)
      form.reset()
      onSuccess()
    } catch (error) {
      console.error('エラー:', error)
      toast.error('メモの保存に失敗しました')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-2" />
          メモを追加
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>メモを追加</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>メモタイプ</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="メモタイプを選択" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {memoTypes.map((type) => (
                        <SelectItem key={type.id} value={type.id}>
                          <div className="flex items-center">
                            {type.color && (
                              <div
                                className="w-3 h-3 rounded-full mr-2"
                                style={{ backgroundColor: type.color }}
                              />
                            )}
                            {type.name}
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
              name="note"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>メモ</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="メモを入力してください"
                      className="min-h-[100px]"
                      {...field}
                    />
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