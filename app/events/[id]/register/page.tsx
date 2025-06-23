'use client';

import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { useSession, signIn, signOut } from 'next-auth/react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { CalendarIcon, MapPinIcon, UsersIcon, ClockIcon, ShieldIcon, InfoIcon, CheckCircleIcon } from 'lucide-react';
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

interface ExistingParticipation {
  id: string;
  status: string;
  registeredAt: string;
  participantName: string;
  participantEmail: string;
  participantPhone?: string;
  participantAddress?: string;
  note?: string;
}

export default function EventRegistrationPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingParticipation, setIsCheckingParticipation] = useState(false);
  const [existingParticipation, setExistingParticipation] = useState<ExistingParticipation | null>(null);
  const [formData, setFormData] = useState<ParticipationFormData>({
    participantName: '',
    participantEmail: '',
    participantPhone: '',
    participantAddress: '',
    note: '',
  });

  const eventId = params.id as string;
  const accessToken = searchParams.get('token');

  // イベント情報を取得
  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const url = accessToken 
          ? `/api/public/events/${accessToken}`
          : `/api/events/${eventId}`;
        
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error('イベントが見つかりません');
        }
        
        const eventData = await response.json();
        setEvent(eventData);
        
        // セッションからユーザー情報を自動入力
        if (session?.user) {
          setFormData(prev => ({
            ...prev,
            participantName: session.user.name || '',
            participantEmail: session.user.email || '',
          }));
        }
      } catch (error) {
        console.error('イベント取得エラー:', error);
        toast.error('イベント情報の取得に失敗しました');
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvent();
  }, [eventId, accessToken, session]);

  // 参加申込状況をチェック
  useEffect(() => {
    const checkParticipation = async () => {
      if (!session?.user?.email || !accessToken) return;

      setIsCheckingParticipation(true);
      try {
        const response = await fetch(`/api/public/events/${accessToken}/check-participation?email=${encodeURIComponent(session.user.email)}`);
        if (response.ok) {
          const data = await response.json();
          if (data.hasParticipated) {
            setExistingParticipation(data.participation);
          }
        }
      } catch (error) {
        console.error('参加申込状況チェックエラー:', error);
      } finally {
        setIsCheckingParticipation(false);
      }
    };

    if (session?.user?.email && accessToken) {
      checkParticipation();
    }
  }, [session?.user?.email, accessToken]);

  // 参加申込の送信
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!session) {
      toast.error('Googleアカウントでログインしてください');
      return;
    }

    if (!event) {
      toast.error('イベント情報が取得できません');
      return;
    }

    setIsSubmitting(true);

    try {
      const url = accessToken 
        ? `/api/public/events/${accessToken}/participate`
        : `/api/events/${eventId}/participations`;

      const response = await fetch(url, {
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
      
      // 申込完了後に確認ページにリダイレクト
      window.location.href = `/events/${eventId}/register/confirmation?participationId=${result.participation.id}`;
      
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

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return { label: '参加確定', color: 'bg-green-100 text-green-800' };
      case 'PENDING':
        return { label: '審査中', color: 'bg-yellow-100 text-yellow-800' };
      case 'WAITLIST':
        return { label: 'キャンセル待ち', color: 'bg-orange-100 text-orange-800' };
      case 'DECLINED':
        return { label: '不参加', color: 'bg-red-100 text-red-800' };
      default:
        return { label: '不明', color: 'bg-gray-100 text-gray-800' };
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* ヘッダー */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            イベント参加申込
          </h1>
          <p className="text-gray-600 mb-4">
            Googleアカウントでログインして参加申込を行ってください
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
              {/* 認証状況 */}
              {status === 'loading' ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                  <p className="text-sm text-gray-600">認証状況を確認中...</p>
                </div>
              ) : !session ? (
                <div className="space-y-4">
                  <Alert>
                    <ShieldIcon className="h-4 w-4" />
                    <AlertDescription>
                      参加申込にはGoogleアカウントでのログインが必要です。
                    </AlertDescription>
                  </Alert>
                  
                  <Button 
                    onClick={() => signIn('google', { callbackUrl: window.location.href })}
                    className="w-full"
                    size="lg"
                  >
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Googleでログイン
                  </Button>

                  <Alert>
                    <InfoIcon className="h-4 w-4" />
                    <AlertDescription className="text-sm">
                      <strong>認証情報の利用について</strong><br />
                      ・参加申込の本人確認のため、お名前とメールアドレスを使用します<br />
                      ・住所は任意入力項目です（入力しなくても申込可能）<br />
                      ・その他の個人情報は取得いたしません<br />
                      ・申込完了後はログアウトできます<br />
                      ・<a href="/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-medium">プライバシーポリシー</a>で詳細をご確認ください
                    </AlertDescription>
                  </Alert>
                </div>
              ) : (
                <div className="space-y-4">
                  <Alert>
                    <ShieldIcon className="h-4 w-4" />
                    <AlertDescription>
                      {session.user?.name}さんでログイン中
                    </AlertDescription>
                  </Alert>

                  {/* 参加申込状況チェック中 */}
                  {isCheckingParticipation && (
                    <div className="text-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
                      <p className="text-sm text-gray-600">参加申込状況を確認中...</p>
                    </div>
                  )}

                  {/* 既に参加申込済みの場合 */}
                  {existingParticipation && !isCheckingParticipation && (
                    <div className="space-y-4">
                      <Alert className="border-green-200 bg-green-50">
                        <CheckCircleIcon className="h-4 w-4 text-green-600" />
                        <AlertDescription className="text-green-800">
                          <strong>参加申込済みです</strong><br />
                          このイベントには既に参加申込されています。
                        </AlertDescription>
                      </Alert>

                      <div className="p-4 bg-gray-50 rounded-lg space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">申込状況</span>
                          <Badge className={getStatusInfo(existingParticipation.status).color}>
                            {getStatusInfo(existingParticipation.status).label}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">申込日時</span>
                          <span className="text-sm font-medium">
                            {format(new Date(existingParticipation.registeredAt), 'yyyy年M月d日 HH:mm', { locale: ja })}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">お名前</span>
                          <span className="text-sm font-medium">{existingParticipation.participantName}</span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">メールアドレス</span>
                          <span className="text-sm font-medium">{existingParticipation.participantEmail}</span>
                        </div>

                        {existingParticipation.participantPhone && (
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">電話番号</span>
                            <span className="text-sm font-medium">{existingParticipation.participantPhone}</span>
                          </div>
                        )}

                        {existingParticipation.participantAddress && (
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">住所</span>
                            <span className="text-sm font-medium">{existingParticipation.participantAddress}</span>
                          </div>
                        )}

                        {existingParticipation.note && (
                          <div>
                            <span className="text-sm text-gray-600">メモ</span>
                            <p className="text-sm font-medium mt-1">{existingParticipation.note}</p>
                          </div>
                        )}
                      </div>

                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          onClick={() => signOut()}
                          className="flex-1"
                        >
                          ログアウト
                        </Button>
                        <Button 
                          onClick={() => window.location.href = `/public/participation/${existingParticipation.id}/status`}
                          className="flex-1"
                        >
                          申込状況を確認
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* 新規参加申込フォーム */}
                  {!existingParticipation && !isCheckingParticipation && (
                    <>
                      {!isRegistrationOpen || isEventPast ? (
                        <div className="text-center py-4">
                          <p className="text-red-600 mb-2">
                            {isEventPast ? 'このイベントは終了しています' : '申込期間外です'}
                          </p>
                          <Button 
                            variant="outline" 
                            onClick={() => signOut()}
                            size="sm"
                          >
                            ログアウト
                          </Button>
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

                          <div className="flex space-x-2">
                            <Button 
                              type="button" 
                              variant="outline" 
                              onClick={() => signOut()}
                              className="flex-1"
                            >
                              ログアウト
                            </Button>
                            <Button 
                              type="submit" 
                              disabled={isSubmitting}
                              className="flex-1"
                            >
                              {isSubmitting ? '送信中...' : '参加申込を送信'}
                            </Button>
                          </div>
                        </form>
                      )}
                    </>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 