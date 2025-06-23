'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  CalendarIcon, 
  MapPinIcon, 
  UsersIcon, 
  SettingsIcon,
  ExternalLinkIcon,
  ShareIcon,
  PlusIcon,
  EditIcon
} from 'lucide-react';
import Link from 'next/link';
import useSWR from 'swr';
import { toast } from 'sonner';

interface Event {
  id: string;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  location?: string;
  maxParticipants?: number;
  relatedGroups?: Array<{ id: string; name: string }>;
  relatedLeads?: Array<{ id: string; name: string; email: string | null }>;
  participationStats: {
    totalParticipants: number;
    confirmedParticipants: number;
    availableSpots: number | null;
  };
  recentParticipants?: Array<{
    id: string;
    name: string;
    email: string | null;
    isExternal: boolean;
  }>;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function EventsList() {
  const { data: events, error, isLoading } = useSWR<Event[]>(
    '/api/events',
    fetcher
  );

  const handleCopyRegistrationLink = async (eventId: string) => {
    const registrationUrl = `${window.location.origin}/events/${eventId}/register`;
    
    try {
      await navigator.clipboard.writeText(registrationUrl);
      toast.success('参加申込URLをコピーしました');
    } catch {
      toast.error('URLのコピーに失敗しました');
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-6 bg-muted rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="h-4 bg-muted rounded"></div>
                <div className="h-4 bg-muted rounded w-4/5"></div>
                <div className="h-10 bg-muted rounded"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error || !events) {
    console.error('Events API Error:', error);
    console.log('Events data:', events);
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-destructive">イベント一覧を取得できませんでした</p>
          <p className="text-sm text-muted-foreground mt-2">
            エラー詳細: {error?.message || 'データの読み込みに失敗しました'}
          </p>
        </CardContent>
      </Card>
    );
  }

  // 配列チェックを追加
  if (!Array.isArray(events)) {
    console.error('Events is not an array:', events);
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-destructive">データ形式エラー</p>
          <p className="text-sm text-muted-foreground mt-2">
            APIから配列以外のデータが返却されました
          </p>
        </CardContent>
      </Card>
    );
  }

  if (events.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <h3 className="text-lg font-medium text-foreground mb-2">
            まだイベントがありません
          </h3>
          <p className="text-muted-foreground mb-6">
            新しいイベントを作成して参加者の管理を始めましょう
          </p>
          <Button asChild>
            <Link href="/dashboard/events/create">
              <PlusIcon className="h-4 w-4 mr-2" />
              最初のイベントを作成
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {events.map((event) => {
        const eventDate = new Date(event.startDate);
        const isEventPast = eventDate < new Date();
        const isEventFull = event.maxParticipants && 
          event.participationStats.confirmedParticipants >= event.maxParticipants;
        
        const participationRate = event.participationStats.totalParticipants > 0
          ? (event.participationStats.confirmedParticipants / event.participationStats.totalParticipants) * 100
          : 0;

        const capacityPercentage = event.maxParticipants
          ? (event.participationStats.confirmedParticipants / event.maxParticipants) * 100
          : 0;

        return (
          <Card key={event.id} className="transition-all hover:shadow-lg">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg text-foreground line-clamp-2 mb-2">
                    {event.title}
                  </h3>
                  <div className="flex items-center gap-2">
                    {event.relatedGroups && event.relatedGroups.length > 0 && (
                      <Badge variant="outline" className="text-xs">
                        {event.relatedGroups[0].name}
                      </Badge>
                    )}
                    {isEventPast && (
                      <Badge variant="destructive" className="text-xs">終了済み</Badge>
                    )}
                    {isEventFull && !isEventPast && (
                      <Badge variant="secondary" className="text-xs">
                        満員
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* イベント基本情報 */}
              <div className="space-y-2 text-sm">
                <div className="flex items-center text-muted-foreground">
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  <span>
                    {eventDate.toLocaleDateString('ja-JP', {
                      month: 'short',
                      day: 'numeric',
                      weekday: 'short',
                    })}
                    {' '}
                    {eventDate.toLocaleTimeString('ja-JP', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>

                {event.location && (
                  <div className="flex items-center text-muted-foreground">
                    <MapPinIcon className="h-4 w-4 mr-2" />
                    <span className="truncate">{event.location}</span>
                  </div>
                )}

                <div className="flex items-center text-muted-foreground">
                  <UsersIcon className="h-4 w-4 mr-2" />
                  <span>
                    参加者: {event.participationStats.confirmedParticipants}
                    {event.maxParticipants && ` / ${event.maxParticipants}`}名
                  </span>
                </div>
              </div>

              {/* 参加状況 */}
              <div className="space-y-3">
                {/* 定員状況 */}
                {event.maxParticipants && (
                  <div>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-muted-foreground">定員充足率</span>
                      <span className="font-medium">
                        {Math.round(capacityPercentage)}%
                      </span>
                    </div>
                    <Progress value={capacityPercentage} className="h-2" />
                  </div>
                )}

                {/* 参加確定率 */}
                {event.participationStats.totalParticipants > 0 && (
                  <div>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-muted-foreground">参加確定率</span>
                      <span className="font-medium">
                        {Math.round(participationRate)}%
                      </span>
                    </div>
                    <Progress value={participationRate} className="h-2" />
                  </div>
                )}

                {/* 参加状況サマリー */}
                <div className="grid grid-cols-2 gap-1 text-xs">
                  <div className="text-center p-2 bg-green-50 dark:bg-green-950 rounded">
                    <div className="font-bold text-green-700 dark:text-green-300">
                      {event.participationStats.confirmedParticipants}
                    </div>
                    <div className="text-green-600 dark:text-green-400">参加確定</div>
                  </div>
                  <div className="text-center p-2 bg-blue-50 dark:bg-blue-950 rounded">
                    <div className="font-bold text-blue-700 dark:text-blue-300">
                      {event.participationStats.totalParticipants - event.participationStats.confirmedParticipants}
                    </div>
                    <div className="text-blue-600 dark:text-blue-400">その他</div>
                  </div>
                </div>
              </div>

              {/* アクションボタン */}
              <div className="flex gap-2 pt-2">
                <Button asChild className="flex-1" size="sm">
                  <Link href={`/dashboard/events/${event.id}/manage`}>
                    <SettingsIcon className="h-4 w-4 mr-2" />
                    管理
                  </Link>
                </Button>
                
                <Button asChild variant="outline" size="sm" className="flex-1">
                  <Link href={`/dashboard/events/${event.id}/edit`}>
                    <EditIcon className="h-4 w-4 mr-2" />
                    編集
                  </Link>
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleCopyRegistrationLink(event.id)}
                  className="flex-1"
                >
                  <ShareIcon className="h-4 w-4 mr-2" />
                  共有
                </Button>
              </div>

              <Button asChild variant="outline" size="sm" className="w-full">
                <Link href={`/dashboard/events/${event.id}`}>
                  <ExternalLinkIcon className="h-4 w-4 mr-2" />
                  詳細表示
                </Link>
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}