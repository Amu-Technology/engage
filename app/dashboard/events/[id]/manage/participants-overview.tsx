'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircleIcon, XCircleIcon, ClockIcon, UsersIcon } from 'lucide-react';
import useSWR from 'swr';

interface ParticipantsOverviewProps {
  eventId: string;
}

interface ParticipationStats {
  total: number;
  confirmed: number;
  declined: number;
  waitlist: number;
  pending: number;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function ParticipantsOverview({ eventId }: ParticipantsOverviewProps) {
  const { data: stats, error, isLoading } = useSWR<ParticipationStats>(
    `/api/events/${eventId}/participations/stats`,
    fetcher,
    {
      refreshInterval: 30000, // 30秒ごとに更新
    }
  );

  // デバッグ情報を追加
  console.log('ParticipantsOverview Event ID:', eventId);
  console.log('ParticipantsOverview API Response:', stats);
  console.log('ParticipantsOverview Error:', error);
  console.log('ParticipantsOverview Loading:', isLoading);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">参加状況</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-16 bg-muted rounded-lg"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !stats) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-destructive">参加状況を取得できませんでした</p>
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
            データ: {stats ? '存在' : 'なし'}
          </p>
        </CardContent>
      </Card>
    );
  }

  const statusItems = [
    {
      key: 'confirmed',
      label: '参加確定',
      count: stats.confirmed,
      icon: CheckCircleIcon,
      color: 'bg-green-500',
      bgColor: 'bg-green-50 dark:bg-green-950/20',
      textColor: 'text-green-700 dark:text-green-300',
    },
    {
      key: 'waitlist',
      label: 'キャンセル待ち',
      count: stats.waitlist,
      icon: ClockIcon,
      color: 'bg-orange-500',
      bgColor: 'bg-orange-50 dark:bg-orange-950/20',
      textColor: 'text-orange-700 dark:text-orange-300',
    },
    {
      key: 'declined',
      label: '不参加',
      count: stats.declined,
      icon: XCircleIcon,
      color: 'bg-gray-500',
      bgColor: 'bg-gray-50 dark:bg-gray-950/20',
      textColor: 'text-gray-700 dark:text-gray-300',
    },
    {
      key: 'pending',
      label: '返信待ち',
      count: stats.pending,
      icon: UsersIcon,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50 dark:bg-blue-950/20',
      textColor: 'text-blue-700 dark:text-blue-300',
    },
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">参加状況サマリー</CardTitle>
          <Badge variant="outline" className="text-sm">
            合計 {stats.total}名
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {statusItems.map((item) => {
            const Icon = item.icon;
            const percentage = stats.total > 0 ? (item.count / stats.total) * 100 : 0;
            
            return (
              <div key={item.key} className={`p-4 rounded-lg ${item.bgColor} transition-all hover:shadow-sm`}>
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2 rounded-full ${item.color} bg-opacity-20`}>
                    <Icon className={`h-4 w-4 ${item.color.replace('bg-', 'text-')}`} />
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-foreground">
                      {item.count}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {percentage.toFixed(0)}%
                    </div>
                  </div>
                </div>
                <div>
                  <p className={`text-sm font-medium ${item.textColor}`}>
                    {item.label}
                  </p>
                  {/* プログレスバー */}
                  <div className="w-full bg-background/50 rounded-full h-1.5 mt-2">
                    <div 
                      className={`h-1.5 rounded-full transition-all ${item.color}`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* 参加率表示 */}
        {stats.total > 0 && (
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-blue-900 dark:text-blue-100">参加率</span>
              <span className="text-lg font-bold text-blue-900 dark:text-blue-100">
                {((stats.confirmed / (stats.confirmed + stats.declined)) * 100 || 0).toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-2">
              <div 
                className="bg-blue-600 dark:bg-blue-400 h-2 rounded-full transition-all"
                style={{ 
                  width: `${(stats.confirmed / (stats.confirmed + stats.declined)) * 100 || 0}%` 
                }}
              ></div>
            </div>
            <p className="text-xs text-blue-700 dark:text-blue-300 mt-2">
              参加確定 {stats.confirmed}名 / 回答済み {stats.confirmed + stats.declined}名
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}