'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Loader2, Plus } from 'lucide-react';

interface EventRegistrationFormProps {
  eventId: string;
}

const registrationSchema = z.object({
  participantName: z.string().min(1, '名前は必須です'),
  participantEmail: z.string().email('有効なメールアドレスを入力してください'),
  participantPhone: z.string().optional(),
  status: z.enum(['CONFIRMED', 'DECLINED', 'WAITLIST'], {
    required_error: '参加状況を選択してください',
  }),
  notes: z.string().optional(),
});

type RegistrationFormData = z.infer<typeof registrationSchema>;

export function EventRegistrationForm({ eventId }: EventRegistrationFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      participantName: '',
      participantEmail: '',
      participantPhone: '',
      status: undefined,
      notes: '',
    },
  });

  const onSubmit = async (data: RegistrationFormData) => {
    setIsSubmitting(true);
    
    try {
      const response = await fetch(`/api/events/${eventId}/participations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          participantName: data.participantName,
          participantEmail: data.participantEmail,
          participantPhone: data.participantPhone,
          status: data.status,
          notes: data.notes,
          isExternal: true,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '登録に失敗しました');
      }

      await response.json();
      
      toast.success('参加申込が完了しました！');
      
      // フォームをリセット
      form.reset();
      
      // ページをリロードして参加者一覧を更新
      window.location.reload();
      
    } catch (error) {
      console.error('Registration error:', error);
      toast.error(error instanceof Error ? error.message : '登録に失敗しました。もう一度お試しください。');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          <Plus className="h-5 w-5 mr-2" />
          参加申込フォーム
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* 基本情報 */}
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="participantName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>お名前 *</FormLabel>
                    <FormControl>
                      <Input placeholder="山田太郎" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="participantEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>メールアドレス *</FormLabel>
                    <FormControl>
                      <Input 
                        type="email" 
                        placeholder="example@domain.com" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="participantPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>電話番号</FormLabel>
                    <FormControl>
                      <Input placeholder="090-1234-5678" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* 参加状況 */}
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>参加状況 *</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="参加状況を選択" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CONFIRMED">🎉 参加します</SelectItem>
                        <SelectItem value="WAITLIST">⏳ キャンセル待ちで参加したい</SelectItem>
                        <SelectItem value="DECLINED">❌ 参加できません</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* メモ */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>メモ</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="特記事項があればご記入ください"
                      className="resize-none"
                      rows={3}
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 送信ボタン */}
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  送信中...
                </>
              ) : (
                '参加申込を送信'
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
} 