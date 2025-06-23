'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CalendarIcon, MapPinIcon, CheckCircleIcon, ClockIcon, XCircleIcon, AlertTriangleIcon } from 'lucide-react';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { toast } from 'sonner';

interface Participation {
  id: string;
  status: string;
  registeredAt: string;
  responseDate?: string;
  note?: string;
  participant: {
    name: string;
    email: string;
    phone?: string;
    address?: string;
  };
  waitlistPosition?: number;
}

interface Event {
  id: string;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  location?: string;
  maxParticipants?: number;
  currentConfirmedParticipants: number;
  availableSpots?: number;
}

interface StatusData {
  participation: Participation;
  event: Event;
  message: string;
  statusInfo: {
    isPending: boolean;
    isConfirmed: boolean;
    isDeclined: boolean;
    isCancelled: boolean;
    isWaitlist: boolean;
  };
}

export default function ParticipationStatusPage() {
  const params = useParams();
  const [statusData, setStatusData] = useState<StatusData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCancelling, setIsCancelling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const participationId = params.participationId as string;

  useEffect(() => {
    const fetchStatusData = async () => {
      try {
        const response = await fetch(`/api/public/participation/${participationId}/status`);
        if (!response.ok) {
          throw new Error('参加申込情報の取得に失敗しました');
        }

        const data = await response.json();
        setStatusData(data);
      } catch (error) {
        console.error('ステータス取得エラー:', error);
        setError('参加申込情報の取得に失敗しました');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStatusData();
  }, [participationId]);

  const handleCancel = async () => {
    if (!confirm('本当に参加申込をキャンセルしますか？\nこの操作は取り消せません。')) {
      return;
    }

    setIsCancelling(true);
    try {
      const response = await fetch(`/api/public/participation/${participationId}/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'キャンセルに失敗しました');
      }

      const result = await response.json();
      toast.success(result.message);
      
      // ページを再読み込みして最新のステータスを表示
      window.location.reload();
      
    } catch (error) {
      console.error('キャンセルエラー:', error);
      toast.error(error instanceof Error ? error.message : 'キャンセルに失敗しました');
    } finally {
      setIsCancelling(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  if (error || !statusData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <p className="text-red-600 mb-4">エラーが発生しました</p>
            <p className="text-sm text-gray-500 mb-4">{error}</p>
            <Button onClick={() => window.history.back()}>
              前のページに戻る
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { participation, event, message } = statusData;
  const eventDate = new Date(event.startDate);
  const registrationDate = new Date(participation.registeredAt);

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return { 
          label: '参加確定', 
          color: 'bg-green-100 text-green-800', 
          icon: CheckCircleIcon
        };
      case 'PENDING':
        return { 
          label: '審査中', 
          color: 'bg-yellow-100 text-yellow-800', 
          icon: ClockIcon
        };
      case 'WAITLIST':
        return { 
          label: 'キャンセル待ち', 
          color: 'bg-orange-100 text-orange-800', 
          icon: ClockIcon
        };
      case 'DECLINED':
        return { 
          label: '不参加', 
          color: 'bg-red-100 text-red-800', 
          icon: XCircleIcon
        };
      case 'CANCELLED':
        return { 
          label: 'キャンセル', 
          color: 'bg-gray-100 text-gray-800', 
          icon: XCircleIcon
        };
      default:
        return { 
          label: '不明', 
          color: 'bg-gray-100 text-gray-800', 
          icon: ClockIcon
        };
    }
  };

  const statusInfo = getStatusInfo(participation.status);
  const StatusIcon = statusInfo.icon;

  // キャンセル可能なステータスかチェック
  const canCancel = participation.status === 'PENDING' || participation.status === 'WAITLIST';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* ヘッダー */}
        <div className="text-center mb-8">
          <div className="mb-4">
            <StatusIcon className="h-16 w-16 text-blue-600 mx-auto" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            参加申込状況
          </h1>
          <p className="text-gray-600">
            イベント参加の申込状況をご確認いただけます
          </p>
        </div>

        <div className="space-y-6">
          {/* 申込状況 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">申込状況</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">参加状況</span>
                <Badge className={statusInfo.color}>
                  <StatusIcon className="h-3 w-3 mr-1" />
                  {statusInfo.label}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">申込日時</span>
                <span className="text-sm font-medium">
                  {format(registrationDate, 'yyyy年M月d日 HH:mm', { locale: ja })}
                </span>
              </div>

              {participation.responseDate && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">更新日時</span>
                  <span className="text-sm font-medium">
                    {format(new Date(participation.responseDate), 'yyyy年M月d日 HH:mm', { locale: ja })}
                  </span>
                </div>
              )}

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  {message}
                </p>
              </div>

              {/* キャンセルボタン */}
              {canCancel && (
                <div className="pt-4 border-t">
                  <Alert className="border-orange-200 bg-orange-50">
                    <AlertTriangleIcon className="h-4 w-4 text-orange-600" />
                    <AlertDescription className="text-orange-800">
                      参加申込をキャンセルできます
                    </AlertDescription>
                  </Alert>
                  <Button 
                    onClick={handleCancel}
                    disabled={isCancelling}
                    variant="destructive"
                    className="w-full mt-3"
                  >
                    {isCancelling ? 'キャンセル中...' : '参加申込をキャンセル'}
                  </Button>
                </div>
              )}

              {/* キャンセル済みの場合 */}
              {participation.status === 'CANCELLED' && (
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <p className="text-sm text-gray-700">
                    この参加申込はキャンセルされました。
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 参加者情報 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">参加者情報</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">お名前</span>
                <span className="text-sm font-medium">{participation.participant.name}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">メールアドレス</span>
                <span className="text-sm font-medium">{participation.participant.email}</span>
              </div>
              
              {participation.participant.phone && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">電話番号</span>
                  <span className="text-sm font-medium">{participation.participant.phone}</span>
                </div>
              )}

              {participation.participant.address && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">住所</span>
                  <span className="text-sm font-medium">{participation.participant.address}</span>
                </div>
              )}

              {participation.note && (
                <div className="pt-4 border-t">
                  <span className="text-sm text-gray-600 block mb-2">メモ</span>
                  <p className="text-sm text-gray-900">{participation.note}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* イベント情報 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">イベント情報</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium text-lg mb-2">{event.title}</h3>
                {event.description && (
                  <p className="text-sm text-gray-600 mb-4">{event.description}</p>
                )}
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <CalendarIcon className="h-4 w-4 text-blue-600" />
                  <div>
                    <p className="text-xs text-gray-500 font-medium">開催日時</p>
                    <p className="text-sm font-medium">
                      {format(eventDate, 'yyyy年M月d日 (EEEE)', { locale: ja })}
                    </p>
                    <p className="text-xs text-gray-600">
                      {format(eventDate, 'HH:mm')} - {format(new Date(event.endDate), 'HH:mm')}
                    </p>
                  </div>
                </div>

                {event.location && (
                  <div className="flex items-center space-x-3">
                    <MapPinIcon className="h-4 w-4 text-green-600" />
                    <div>
                      <p className="text-xs text-gray-500 font-medium">場所</p>
                      <p className="text-sm font-medium">{event.location}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center space-x-3">
                  <div className="h-4 w-4 text-purple-600 flex items-center justify-center">
                    <span className="text-xs">👥</span>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">参加者数</p>
                    <p className="text-sm font-medium">
                      {event.currentConfirmedParticipants}
                      {event.maxParticipants && ` / ${event.maxParticipants}`}名
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* アクション */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              onClick={() => window.history.back()}
              variant="outline"
              className="flex-1"
            >
              前のページに戻る
            </Button>
            <Button 
              onClick={() => window.location.href = `/events/${event.id}/register`}
              className="flex-1"
            >
              申込ページに戻る
            </Button>
          </div>

          <div className="text-center">
            <p className="text-xs text-gray-500">
              ご不明な点がございましたら、イベント主催者までお問い合わせください。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 