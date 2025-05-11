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
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { toast } from 'sonner'
import { Pencil } from 'lucide-react'
import { ControllerRenderProps } from 'react-hook-form'

const formSchema = z.object({
  name: z.string().min(1, '名前は必須です'),
  nameReading: z.string().optional(),
  nickname: z.string().optional(),
  type: z.string().optional(),
  district: z.string().optional(),
  homePhone: z.string().optional(),
  mobilePhone: z.string().optional(),
  company: z.string().optional(),
  position: z.string().optional(),
  postalCode: z.string().optional(),
  address: z.string().optional(),
  email: z.string().email('有効なメールアドレスを入力してください').optional(),
  referrer: z.string().optional(),
  evaluation: z.number().min(0).max(5).optional(),
  status: z.string().optional(),
  isPaid: z.boolean().optional(),
})

type FormValues = z.infer<typeof formSchema>

interface LeadFormProps {
  lead?: {
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
  onSuccess: () => void
  type: 'individual' | 'organization'
}

export function LeadForm({ lead, onSuccess, type }: LeadFormProps) {


  console.log(type);
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  console.log('lead', lead);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      nameReading: '',
      nickname: '',
      type: type,
      district: '',
      homePhone: '',
      mobilePhone: '',
      company: '',
      position: '',
      postalCode: '',
      address: '',
      email: '',
      referrer: '',
      evaluation: 0,
      status: 'potential',
      isPaid: false,
    },
  });
  
  // ✅ leadが存在する場合はformをリセットして上書きする
  useEffect(() => {
    if (lead) {
      form.reset({
        name: lead.name || '',
        nameReading: lead.nameReading || '',
        nickname: lead.nickname || '',
        type: lead.type || type,
        district: lead.district || '',
        homePhone: lead.homePhone || '',
        mobilePhone: lead.mobilePhone || '',
        company: lead.company || '',
        position: lead.position || '',
        postalCode: lead.postalCode || '',
        address: lead.address || '',
        email: lead.email || '',
        referrer: lead.referrer || '',
        evaluation: lead.evaluation ?? 0,
        status: lead.status || 'potential',
        isPaid: lead.isPaid ?? false,
      });
    }
  }, [lead, type, form]); // type も依存に含めることで切り替え対応
  
  useEffect(() => {
    if (lead?.type) {
      form.setValue('type', lead.type);
    } else {
      form.setValue('type', type); // propsから渡された "individual" or "organization"
    }
  }, [lead, type, form]);
  


  console.log(form.getValues());

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true)
    try {
      const url = lead ? `/api/leads/${lead.id}` : '/api/leads'
      const method = lead ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      })

      if (!response.ok) {
        throw new Error('リードの保存に失敗しました')
      }

      toast.success(lead ? 'リードを更新しました' : 'リードを追加しました')
      setOpen(false)
      onSuccess()
    } catch (error) {
      console.error('エラー:', error)
      toast.error('リードの保存に失敗しました')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {lead ? (
          <Button variant="ghost" size="sm">
            <Pencil className="h-4 w-4" />
          </Button>
        ) : (
          <Button>新規リード追加</Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {lead
              ? "リードの編集" + (type === "individual" ? "（個人）" : "（組織）")
              : "新規リード追加" + (type === "individual" ? "（個人）" : "（組織）")}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4"
          >
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }: { field: ControllerRenderProps<FormValues, 'name'> }) => (
                  <FormItem>
                    <FormLabel>名前 *</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="nameReading"
                render={({ field }: { field: ControllerRenderProps<FormValues, 'nameReading'> }) => (
                  <FormItem>
                    <FormLabel>読み仮名</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="nickname"
                render={({ field }: { field: ControllerRenderProps<FormValues, 'nickname'> }) => (
                  <FormItem>
                    <FormLabel>ニックネーム</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="type"
                render={({ field }: { field: ControllerRenderProps<FormValues, 'type'> }) => (
                  <FormItem>
                    <FormLabel>タイプ</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="district"
                render={({ field }: { field: ControllerRenderProps<FormValues, 'district'> }) => (
                  <FormItem>
                    <FormLabel>地区</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="homePhone"
                render={({ field }: { field: ControllerRenderProps<FormValues, 'homePhone'> }) => (
                  <FormItem>
                    <FormLabel>自宅電話</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="mobilePhone"
                render={({ field }: { field: ControllerRenderProps<FormValues, 'mobilePhone'> }) => (
                  <FormItem>
                    <FormLabel>携帯電話</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="company"
                render={({ field }: { field: ControllerRenderProps<FormValues, 'company'> }) => (
                  <FormItem>
                    <FormLabel>会社</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="position"
                render={({ field }: { field: ControllerRenderProps<FormValues, 'position'> }) => (
                  <FormItem>
                    <FormLabel>役職</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="postalCode"
                render={({ field }: { field: ControllerRenderProps<FormValues, 'postalCode'> }) => (
                  <FormItem>
                    <FormLabel>郵便番号</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="address"
                render={({ field }: { field: ControllerRenderProps<FormValues, 'address'> }) => (
                  <FormItem>
                    <FormLabel>住所</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }: { field: ControllerRenderProps<FormValues, 'email'> }) => (
                  <FormItem>
                    <FormLabel>メールアドレス</FormLabel>
                    <FormControl>
                      <Input {...field} type="email" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="referrer"
                render={({ field }: { field: ControllerRenderProps<FormValues, 'referrer'> }) => (
                  <FormItem>
                    <FormLabel>紹介者</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="evaluation"
                render={({ field }: { field: ControllerRenderProps<FormValues, 'evaluation'> }) => (
                  <FormItem>
                    <FormLabel>評価</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        min="0"
                        max="5"
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="status"
                render={({ field }: { field: ControllerRenderProps<FormValues, 'status'> }) => (
                  <FormItem>
                    <FormLabel>ステータス</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="isPaid"
                render={({ field }: { field: ControllerRenderProps<FormValues, 'isPaid'> }) => (
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={(e) => field.onChange(e.target.checked)}
                      />
                    </FormControl>
                    <FormLabel>有料会員</FormLabel>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                キャンセル
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? '保存中...' : lead ? '更新' : '追加'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
} 