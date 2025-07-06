'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CalendarIcon, MapPinIcon, UsersIcon, ExternalLinkIcon, ShareIcon, DownloadIcon } from 'lucide-react';
import Link from 'next/link';
import useSWR from 'swr';
import { toast } from 'sonner';

interface EventManagementDashboardProps {
  eventId: string;
}

interface Event {
  id: string;
  title: string;
  description?: string;
  date: string;
  location?: string;
  maxParticipants?: number;
  groupId?: string;
  accessToken?: string;
  group: {
    name: string;
  };
  _count: {
    participations: number;
  };
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function EventManagementDashboard({ eventId }: EventManagementDashboardProps) {
  const { data: event, error, isLoading } = useSWR<Event>(
    `/api/events/${eventId}`,
    fetcher
  );

  // デバッグ情報を追加
  console.log('EventManagementDashboard Event ID:', eventId);
  console.log('EventManagementDashboard API Response:', event);
  console.log('EventManagementDashboard Error:', error);
  console.log('EventManagementDashboard Loading:', isLoading);
  console.log('EventManagementDashboard Group Info:', {
    groupId: event?.groupId,
    groupName: event?.group?.name
  });

  const handleCopyRegistrationLink = async () => {
    // アクセストークンが設定されている場合は、そのトークンを含むURLを生成
    const registrationUrl = event?.accessToken 
      ? `${window.location.origin}/public/events/${event.accessToken}`
      : `${window.location.origin}/events/${eventId}/register`;
    
    try {
      await navigator.clipboard.writeText(registrationUrl);
      toast.success('参加申込URLをコピーしました');
    } catch {
      toast.error('URLのコピーに失敗しました');
    }
  };

  const handleExportParticipants = async () => {
    try {
      const response = await fetch(`/api/events/${eventId}/participants/export`);
      if (!response.ok) throw new Error('Export failed');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `event-${eventId}-participants.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success('参加者データをエクスポートしました');
    } catch {
      toast.error('エクスポートに失敗しました');
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="animate-pulse space-y-2">
            <div className="h-6 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-muted rounded"></div>
            <div className="h-4 bg-muted rounded w-5/6"></div>
            <div className="h-10 bg-muted rounded w-32"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !event) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-destructive">イベント情報を取得できませんでした</p>
          {error && (
            <p className="text-sm text-muted-foreground mt-2">
              エラー詳細: {error.message || 'データの読み込みに失敗しました'}
            </p>
          )}
          <p className="text-sm text-muted-foreground mt-1">
            イベントID: {eventId}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            ローディング状態: {isLoading ? '読み込み中' : '完了'}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            データ: {event ? '存在' : 'なし'}
          </p>
          <div className="mt-4">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.location.reload()}
            >
              ページを再読み込み
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const eventDate = new Date(event.date);
  const isEventPast = eventDate < new Date();
  const participantCount = event._count.participations;
  const isNearCapacity = event.maxParticipants && participantCount >= event.maxParticipants * 0.8;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <CardTitle className="text-2xl">{event.title}</CardTitle>
              {isEventPast && (
                <Badge variant="destructive">終了済み</Badge>
              )}
              {isNearCapacity && !isEventPast && (
                <Badge variant="secondary" className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
                  定員間近
                </Badge>
              )}
              {event.accessToken && (
                <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                  外部公開
                </Badge>
              )}
            </div>
            <Badge variant="outline" className="text-xs">
              {event.group.name}
            </Badge>
          </div>
          
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleCopyRegistrationLink}
            >
              <ShareIcon className="h-4 w-4 mr-2" />
              申込URL
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleExportParticipants}
            >
              <DownloadIcon className="h-4 w-4 mr-2" />
              エクスポート
            </Button>
            <Button asChild size="sm">
              <Link href={`/dashboard/events/${eventId}/manage#registration`}>
                <ExternalLinkIcon className="h-4 w-4 mr-2" />
                申込フォーム
              </Link>
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* イベント基本情報 */}
        {event.description && (
          <div>
            <h4 className="font-medium text-sm text-muted-foreground mb-2">概要</h4>
            <p className="text-sm text-foreground">{event.description}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 日時 */}
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-full">
              <CalendarIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">開催日時</p>
              <p className="text-sm font-medium text-foreground">
                {eventDate.toLocaleDateString('ja-JP', {
                  month: 'short',
                  day: 'numeric',
                  weekday: 'short',
                })}
              </p>
              <p className="text-xs text-muted-foreground">
                {eventDate.toLocaleTimeString('ja-JP', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          </div>

          {/* 場所 */}
          {event.location && (
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-full">
                <MapPinIcon className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">場所</p>
                <p className="text-sm font-medium text-foreground">{event.location}</p>
              </div>
            </div>
          )}

          {/* 参加者数 */}
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-full">
              <UsersIcon className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">参加者数</p>
              <p className="text-sm font-medium text-foreground">
                {participantCount}
                {event.maxParticipants && ` / ${event.maxParticipants}`}名
              </p>
              {event.maxParticipants && (
                <div className="w-20 bg-muted rounded-full h-1.5 mt-1">
                  <div 
                    className={`h-1.5 rounded-full transition-all ${
                      participantCount >= event.maxParticipants 
                        ? 'bg-red-500' 
                        : participantCount >= event.maxParticipants * 0.8 
                        ? 'bg-orange-500' 
                        : 'bg-green-500'
                    }`}
                    style={{ 
                      width: `${Math.min((participantCount / event.maxParticipants) * 100, 100)}%` 
                    }}
                  ></div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 参加申込URL */}
        <div className="p-4 bg-muted/50 rounded-lg">
          <h4 className="font-medium text-sm text-foreground mb-2">参加申込URL</h4>
          <div className="flex items-center space-x-2">
            <code className="flex-1 text-xs bg-background p-2 rounded border text-foreground overflow-x-auto">
              {typeof window !== 'undefined' && (
                event.accessToken 
                  ? `${window.location.origin}/public/events/${event.accessToken}`
                  : `${window.location.origin}/events/${eventId}/register`
              )}
            </code>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleCopyRegistrationLink}
            >
              コピー
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {event.accessToken 
              ? 'このURLを参加者に共有して申込を受け付けできます（外部公開）'
              : 'このURLを参加者に共有して申込を受け付けできます'
            }
          </p>
        </div>
      </CardContent>
    </Card>
  );
}