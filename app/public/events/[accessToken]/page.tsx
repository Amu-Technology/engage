'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { CalendarIcon, MapPinIcon, UsersIcon, ClockIcon, ShieldIcon } from 'lucide-react';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';

interface Event {
  id: string;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  location?: string;
  maxParticipants?: number;
  registrationStart?: string;
  registrationEnd?: string;
  isPublic: boolean;
  accessToken: string;
  _count: {
    participations: number;
  };
}

interface ParticipationFormData {
  participantName: string;
  participantEmail: string;
  participantPhone: string;
  participantAddress: string;
  note: string;
}

export default function PublicEventPage() {
  const params = useParams();
  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<ParticipationFormData>({
    participantName: '',
    participantEmail: '',
    participantPhone: '',
    participantAddress: '',
    note: '',
  });

  const accessToken = params.accessToken as string;

  // イベント情報を取得
  useEffect(() => {
    const fetchEvent = async () => {
      try {
        console.log('Fetching public event with accessToken:', accessToken);
        
        const response = await fetch(`/api/public/events/${accessToken}`);
        console.log('Response status:', response.status);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('API Error Response:', errorText);
          throw new Error('イベントが見つかりません');
        }
        
        const eventData = await response.json();
        console.log('Event data received:', eventData);
        setEvent(eventData);
      } catch (error) {
        console.error('イベント取得エラー:', error);
        toast.error('イベント情報の取得に失敗しました');
      } finally {
        setIsLoading(false);
      }
    };

    if (accessToken) {
      fetchEvent();
    }
  }, [accessToken]);

  // 参加申込の送信
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!event) {
      toast.error('イベント情報が取得できません');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/public/events/${accessToken}/participate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          isExternal: true,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        
        // 重複申込エラーの場合、ステータスページにリダイレクト
        if (response.status === 409 && errorData.participationId) {
          window.location.href = `/public/participation/${errorData.participationId}/status`;
          return;
        }
        
        throw new Error(errorData.error || '参加申込に失敗しました');
      }

      const result = await response.json();
      
      toast.success(result.message || '参加申込が完了しました！');
      
      // 申込完了後に公開ページにリダイレクト
      window.location.href = `/public/participation/${result.participation.id}/status`;
      
    } catch (error) {
      console.error('参加申込エラー:', error);
      toast.error(error instanceof Error ? error.message : '参加申込に失敗しました');
    } finally {
      setIsSubmitting(false);
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

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <p className="text-red-600 mb-4">イベントが見つかりません</p>
            <p className="text-sm text-gray-500">
              アクセストークンが正しくないか、イベントが存在しません。
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const eventDate = new Date(event.startDate);
  const now = new Date();
  const isRegistrationOpen = (!event.registrationStart || now >= new Date(event.registrationStart)) &&
                            (!event.registrationEnd || now <= new Date(event.registrationEnd));
  const isEventPast = eventDate < now;
  const participantCount = event._count.participations;
  const isNearCapacity = event.maxParticipants && participantCount >= event.maxParticipants * 0.8;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* ヘッダー */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            イベント参加申込
          </h1>
          <p className="text-gray-600 mb-4">
            外部ユーザー向けの参加申込フォームです
          </p>
          <div className="text-sm text-gray-500">
            <a href="/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
              プライバシーポリシー
            </a>
            をご確認ください
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* イベント情報 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">{event.title}</CardTitle>
              <div className="flex flex-wrap gap-2">
                {isEventPast && (
                  <Badge variant="destructive">終了済み</Badge>
                )}
                {isNearCapacity && !isEventPast && (
                  <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                    定員間近
                  </Badge>
                )}
                {!isRegistrationOpen && !isEventPast && (
                  <Badge variant="outline">申込期間外</Badge>
                )}
                <Badge variant="outline" className="bg-green-100 text-green-800">
                  外部公開
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {event.description && (
                <div>
                  <h4 className="font-medium text-sm text-gray-600 mb-2">概要</h4>
                  <p className="text-sm text-gray-900">{event.description}</p>
                </div>
              )}

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
                  <UsersIcon className="h-4 w-4 text-purple-600" />
                  <div>
                    <p className="text-xs text-gray-500 font-medium">参加者数</p>
                    <p className="text-sm font-medium">
                      {participantCount}
                      {event.maxParticipants && ` / ${event.maxParticipants}`}名
                    </p>
                    {event.maxParticipants && (
                      <div className="w-20 bg-gray-200 rounded-full h-1.5 mt-1">
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

                {(event.registrationStart || event.registrationEnd) && (
                  <div className="flex items-center space-x-3">
                    <ClockIcon className="h-4 w-4 text-orange-600" />
                    <div>
                      <p className="text-xs text-gray-500 font-medium">申込期間</p>
                      <p className="text-sm font-medium">
                        {event.registrationStart 
                          ? format(new Date(event.registrationStart), 'M/d HH:mm')
                          : '開始日時未定'
                        } - {event.registrationEnd 
                          ? format(new Date(event.registrationEnd), 'M/d HH:mm')
                          : '終了日時未定'
                        }
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* 参加申込フォーム */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">参加申込</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Alert>
                  <ShieldIcon className="h-4 w-4" />
                  <AlertDescription>
                    外部ユーザー向けの参加申込フォームです。
                  </AlertDescription>
                </Alert>

                {!isRegistrationOpen || isEventPast ? (
                  <div className="text-center py-4">
                    <p className="text-red-600 mb-2">
                      {isEventPast ? 'このイベントは終了しています' : '申込期間外です'}
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="participantName">お名前 *</Label>
                      <Input
                        id="participantName"
                        value={formData.participantName}
                        onChange={(e) => setFormData(prev => ({ ...prev, participantName: e.target.value }))}
                        required
                        placeholder="山田太郎"
                      />
                    </div>

                    <div>
                      <Label htmlFor="participantEmail">メールアドレス *</Label>
                      <Input
                        id="participantEmail"
                        type="email"
                        value={formData.participantEmail}
                        onChange={(e) => setFormData(prev => ({ ...prev, participantEmail: e.target.value }))}
                        required
                        placeholder="example@domain.com"
                      />
                    </div>

                    <div>
                      <Label htmlFor="participantPhone">電話番号</Label>
                      <Input
                        id="participantPhone"
                        value={formData.participantPhone}
                        onChange={(e) => setFormData(prev => ({ ...prev, participantPhone: e.target.value }))}
                        placeholder="090-1234-5678"
                      />
                    </div>

                    <div>
                      <Label htmlFor="participantAddress">住所</Label>
                      <Textarea
                        id="participantAddress"
                        value={formData.participantAddress}
                        onChange={(e) => setFormData(prev => ({ ...prev, participantAddress: e.target.value }))}
                        placeholder="東京都新宿区"
                        rows={3}
                      />
                    </div>

                    <div>
                      <Label htmlFor="note">メモ</Label>
                      <Textarea
                        id="note"
                        value={formData.note}
                        onChange={(e) => setFormData(prev => ({ ...prev, note: e.target.value }))}
                        placeholder="特記事項があればご記入ください"
                        rows={3}
                      />
                    </div>

                    <Separator />

                    <div className="text-center text-sm text-gray-600">
                      <a href="/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        プライバシーポリシー
                      </a>
                      に同意の上、申込を送信してください
                    </div>

                    <Button 
                      type="submit" 
                      disabled={isSubmitting}
                      className="w-full"
                    >
                      {isSubmitting ? '送信中...' : '参加申込を送信'}
                    </Button>
                  </form>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 