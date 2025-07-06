'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CheckCircleIcon, XCircleIcon, ClockIcon, UsersIcon, SettingsIcon } from 'lucide-react';
import Link from 'next/link';
import useSWR from 'swr';

interface QuickParticipationOverviewProps {
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

export function QuickParticipationOverview({ eventId }: QuickParticipationOverviewProps) {
  const { data: stats, error, isLoading } = useSWR<ParticipationStats>(
    `/api/events/${eventId}/participants/stats`,
    fetcher
  );

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <UsersIcon className="h-5 w-5 mr-2" />
            参加状況
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-2 bg-gray-200 rounded"></div>
            <div className="flex gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-12 bg-gray-200 rounded flex-1"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !stats) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-red-600">参加状況を取得できませんでした</p>
        </CardContent>
      </Card>
    );
  }

  const participationRate = stats.confirmed + stats.declined > 0 
    ? (stats.confirmed / (stats.confirmed + stats.declined)) * 100 
    : 0;

  const statusItems = [
    {
      key: 'confirmed',
      label: '参加確定',
      count: stats.confirmed,
      icon: CheckCircleIcon,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      key: 'waitlist',
      label: 'キャンセル待ち',
      count: stats.waitlist,
      icon: ClockIcon,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
    {
      key: 'declined',
      label: '不参加',
      count: stats.declined,
      icon: XCircleIcon,
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
    },
    {
      key: 'pending',
      label: '返信待ち',
      count: stats.pending,
      icon: UsersIcon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center">
            <UsersIcon className="h-5 w-5 mr-2" />
            参加状況
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="text-sm">
              合計 {stats.total}名申込
            </Badge>
            <Button asChild variant="outline" size="sm">
              <Link href={`/events/${eventId}/manage`}>
                <SettingsIcon className="h-4 w-4 mr-2" />
                管理画面
              </Link>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 参加率 */}
        {stats.confirmed + stats.declined > 0 && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">参加率</span>
              <span className="text-lg font-bold text-gray-900">
                {participationRate.toFixed(1)}%
              </span>
            </div>
            <Progress 
              value={participationRate} 
              className="h-2"
            />
            <p className="text-xs text-gray-500 mt-1">
              参加確定 {stats.confirmed}名 / 回答済み {stats.confirmed + stats.declined}名
            </p>
          </div>
        )}

        {/* ステータス別サマリー */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {statusItems.map((item) => {
            const Icon = item.icon;
            
            return (
              <div key={item.key} className={`p-3 rounded-lg ${item.bgColor} text-center`}>
                <div className="flex items-center justify-center mb-2">
                  <Icon className={`h-5 w-5 ${item.color}`} />
                </div>
                <div className="text-xl font-bold text-gray-900 mb-1">
                  {item.count}
                </div>
                <div className={`text-xs font-medium ${item.color}`}>
                  {item.label}
                </div>
              </div>
            );
          })}
        </div>

        {/* クイックアクション */}
        {stats.total === 0 ? (
          <div className="text-center py-4">
            <p className="text-gray-500 text-sm mb-4">まだ参加申込がありません</p>
            <Button asChild variant="outline">
              <Link href={`/events/${eventId}/register`}>
                参加申込ページを見る
              </Link>
            </Button>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row gap-2">
            <Button asChild className="flex-1">
              <Link href={`/events/${eventId}/manage`}>
                詳細管理画面を開く
              </Link>
            </Button>
            <Button asChild variant="outline" className="flex-1">
              <Link href={`/events/${eventId}/register`}>
                参加申込ページ
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}