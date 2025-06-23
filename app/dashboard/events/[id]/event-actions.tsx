'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  ExternalLinkIcon, 
  ShareIcon, 
  SettingsIcon, 
  UserPlusIcon, 
  DownloadIcon,
  CalendarIcon 
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

interface EventActionsProps {
  eventId: string;
}

export function EventActions({ eventId }: EventActionsProps) {
  const handleCopyRegistrationLink = async () => {
    const registrationUrl = `${window.location.origin}/events/${eventId}/register`;
    
    try {
      await navigator.clipboard.writeText(registrationUrl);
      toast.success('参加申込URLをコピーしました');
    } catch (error) {
      toast.error('URLのコピーに失敗しました');
    }
  };

  const handleAddToCalendar = () => {
    // カレンダー追加機能の実装
    toast.info('カレンダー追加機能は今後実装予定です');
  };

  const handleExportData = async () => {
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
    } catch (error) {
      toast.error('エクスポートに失敗しました');
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {/* 参加申込ページ */}
          <Button asChild className="h-auto p-4">
            <Link href={`/events/${eventId}/register`}>
              <div className="flex items-center space-x-3">
                <ExternalLinkIcon className="h-5 w-5" />
                <div className="text-left">
                  <div className="font-medium">参加申込ページ</div>
                  <div className="text-xs opacity-90">外部ユーザー向け</div>
                </div>
              </div>
            </Link>
          </Button>

          {/* 管理画面 */}
          <Button asChild variant="outline" className="h-auto p-4">
            <Link href={`/events/${eventId}/manage`}>
              <div className="flex items-center space-x-3">
                <SettingsIcon className="h-5 w-5" />
                <div className="text-left">
                  <div className="font-medium">参加者管理</div>
                  <div className="text-xs opacity-70">管理者向け</div>
                </div>
              </div>
            </Link>
          </Button>

          {/* URL共有 */}
          <Button 
            variant="outline" 
            className="h-auto p-4"
            onClick={handleCopyRegistrationLink}
          >
            <div className="flex items-center space-x-3">
              <ShareIcon className="h-5 w-5" />
              <div className="text-left">
                <div className="font-medium">URL共有</div>
                <div className="text-xs opacity-70">申込URLコピー</div>
              </div>
            </div>
          </Button>

          {/* 新規参加者追加 */}
          <Button asChild variant="outline" className="h-auto p-4">
            <Link href={`/events/${eventId}/manage#add-participant`}>
              <div className="flex items-center space-x-3">
                <UserPlusIcon className="h-5 w-5" />
                <div className="text-left">
                  <div className="font-medium">参加者追加</div>
                  <div className="text-xs opacity-70">手動登録</div>
                </div>
              </div>
            </Link>
          </Button>

          {/* データエクスポート */}
          <Button 
            variant="outline" 
            className="h-auto p-4"
            onClick={handleExportData}
          >
            <div className="flex items-center space-x-3">
              <DownloadIcon className="h-5 w-5" />
              <div className="text-left">
                <div className="font-medium">データ出力</div>
                <div className="text-xs opacity-70">CSV形式</div>
              </div>
            </div>
          </Button>

          {/* カレンダー追加 */}
          <Button 
            variant="outline" 
            className="h-auto p-4"
            onClick={handleAddToCalendar}
          >
            <div className="flex items-center space-x-3">
              <CalendarIcon className="h-5 w-5" />
              <div className="text-left">
                <div className="font-medium">カレンダー</div>
                <div className="text-xs opacity-70">予定追加</div>
              </div>
            </div>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}