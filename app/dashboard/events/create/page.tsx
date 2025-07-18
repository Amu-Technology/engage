'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import useSWR from 'swr';

const formSchema = z.object({
  title: z.string().min(1, 'タイトルは必須です'),
  description: z.string().optional(),
  startDate: z.string().min(1, '開始日時は必須です'),
  endDate: z.string().min(1, '終了日時は必須です'),
  location: z.string().optional(),
  maxParticipants: z.string().optional(),
  registrationStart: z.string().optional(),
  registrationEnd: z.string().optional(),
  groupId: z.string().optional(),
  isPublic: z.boolean(),
  accessToken: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const fetcher = (url: string) => fetch(url).then(res => res.json());

interface Group {
  id: string;
  name: string;
}

export default function CreateEventPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { data: groups } = useSWR<Group[]>('/api/groups', fetcher);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      startDate: '',
      endDate: '',
      location: '',
      maxParticipants: '',
      registrationStart: '',
      registrationEnd: '',
      groupId: '',
      isPublic: false,
      accessToken: '',
    },
  });

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          maxParticipants: data.maxParticipants ? parseInt(data.maxParticipants) : null,
          registrationStart: data.registrationStart || null,
          registrationEnd: data.registrationEnd || null,
          accessToken: data.isPublic && data.accessToken ? data.accessToken : null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'イベントの作成に失敗しました');
      }

      toast.success('イベントを作成しました');
      router.push('/dashboard/events');
    } catch (error) {
      console.error('Error creating event:', error);
      toast.error(error instanceof Error ? error.message : 'イベントの作成に失敗しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/dashboard/events">
            <ArrowLeft className="h-4 w-4 mr-2" />
            イベント一覧に戻る
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">新しいイベントを作成</h1>
        <p className="text-gray-600 mt-2">
          イベントの詳細情報を入力してください
        </p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>基本情報</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">イベントタイトル *</Label>
              <Input
                id="title"
                {...form.register('title')}
                placeholder="イベントのタイトルを入力"
              />
              {form.formState.errors.title && (
                <p className="text-red-500 text-sm mt-1">
                  {form.formState.errors.title.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="description">説明</Label>
              <Textarea
                id="description"
                {...form.register('description')}
                placeholder="イベントの詳細説明を入力"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startDate">開始日時 *</Label>
                <Input
                  id="startDate"
                  type="datetime-local"
                  {...form.register('startDate')}
                />
                {form.formState.errors.startDate && (
                  <p className="text-red-500 text-sm mt-1">
                    {form.formState.errors.startDate.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="endDate">終了日時 *</Label>
                <Input
                  id="endDate"
                  type="datetime-local"
                  {...form.register('endDate')}
                />
                {form.formState.errors.endDate && (
                  <p className="text-red-500 text-sm mt-1">
                    {form.formState.errors.endDate.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="location">開催場所</Label>
              <Input
                id="location"
                {...form.register('location')}
                placeholder="開催場所を入力"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>参加者設定</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="maxParticipants">最大参加者数</Label>
              <Input
                id="maxParticipants"
                type="number"
                {...form.register('maxParticipants')}
                placeholder="制限なしの場合は空欄"
                min="1"
              />
            </div>

            <div>
              <Label htmlFor="groupId">対象グループ</Label>
              <Select onValueChange={(value) => form.setValue('groupId', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="グループを選択（任意）" />
                </SelectTrigger>
                <SelectContent>
                  {groups?.map((group: Group) => (
                    <SelectItem key={group.id} value={group.id}>
                      {group.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="registrationStart">申込開始日時</Label>
                <Input
                  id="registrationStart"
                  type="datetime-local"
                  {...form.register('registrationStart')}
                />
              </div>

              <div>
                <Label htmlFor="registrationEnd">申込終了日時</Label>
                <Input
                  id="registrationEnd"
                  type="datetime-local"
                  {...form.register('registrationEnd')}
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="isPublic"
                checked={form.watch('isPublic')}
                onCheckedChange={(checked) => form.setValue('isPublic', checked as boolean)}
              />
              <Label htmlFor="isPublic">外部公開する</Label>
            </div>

            {form.watch('isPublic') && (
              <div>
                <Label htmlFor="accessToken">外部アクセス用トークン</Label>
                <div className="flex space-x-2">
                  <Input
                    id="accessToken"
                    {...form.register('accessToken')}
                    placeholder="自動生成されたトークンまたは任意のトークン"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
                      form.setValue('accessToken', token);
                    }}
                  >
                    自動生成
                  </Button>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  外部ユーザーがイベントにアクセスするためのトークンです。
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/dashboard/events')}
          >
            キャンセル
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? '作成中...' : 'イベントを作成'}
          </Button>
        </div>
      </form>
    </div>
  );
} 