'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  SearchIcon, 
  MailIcon, 
  PhoneIcon, 
  MoreHorizontalIcon,
  FilterIcon,
  UsersIcon 
} from 'lucide-react';
import useSWR from 'swr';
import { toast } from 'sonner';

interface ParticipantsSectionProps {
  eventId: string;
}

interface Participant {
  id: string;
  status: string;
  registeredAt: string;
  responseDate?: string;
  note?: string;
  isExternal: boolean;
  participant?: {
    id?: string;
    name: string;
    email?: string;
    phone?: string;
  };
  // 古いAPIレスポンス形式との互換性
  participantName?: string;
  participantEmail?: string;
  participantPhone?: string;
  lead?: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  };
}

interface ParticipantsResponse {
  participations: Participant[];
  stats: {
    total: number;
    confirmed: number;
    pending: number;
    declined: number;
    waitlist: number;
    cancelled: number;
  };
  event: {
    id: string;
    title: string;
    maxParticipants?: number;
    availableSpots?: number;
  };
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const getStatusInfo = (status: string) => {
  switch (status) {
    case 'CONFIRMED':
      return { label: '参加確定', color: 'bg-green-500 text-white', emoji: '✅' };
    case 'WAITLIST':
      return { label: 'キャンセル待ち', color: 'bg-orange-500 text-white', emoji: '⏳' };
    case 'DECLINED':
      return { label: '不参加', color: 'bg-gray-500 text-white', emoji: '❌' };
    case 'PENDING':
      return { label: '返信待ち', color: 'bg-blue-500 text-white', emoji: '⏰' };
    case 'CANCELLED':
      return { label: 'キャンセル', color: 'bg-red-500 text-white', emoji: '🚫' };
    default:
      return { label: '不明', color: 'bg-gray-400 text-white', emoji: '❓' };
  }
};

export function ParticipantsSection({ eventId }: ParticipantsSectionProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showOnlyRecent, setShowOnlyRecent] = useState(true);

  const { data: response, isLoading } = useSWR<ParticipantsResponse>(
    `/api/events/${eventId}/participations`,
    fetcher
  );

  // デバッグ情報を追加
  console.log('ParticipantsSection API Response:', response);
  console.log('ParticipantsSection Response Type:', typeof response);
  console.log('ParticipantsSection Participants:', response?.participations);
  console.log('ParticipantsSection Participants Type:', typeof response?.participations);
  console.log('ParticipantsSection Participants Length:', response?.participations?.length);

  const participants = response?.participations || [];

  // APIレスポンスが配列の場合のフォールバック処理
  const safeParticipants = Array.isArray(response) ? response : participants;

  const handleStatusChange = async (participationId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/events/${eventId}/participations/${participationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('ステータス更新に失敗しました');
      }

      // データを再取得（エラーハンドリングを追加）
      try {
        // SWRの自動再検証に依存
        window.location.reload();
      } catch (reloadError) {
        console.error('Reload error:', reloadError);
      }
      
      toast.success('参加状況を更新しました');
    } catch (error) {
      console.error('Status change error:', error);
      toast.error('更新に失敗しました');
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <UsersIcon className="h-5 w-5 mr-2" />
            参加者一覧
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!response) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-red-600">参加者一覧を取得できませんでした</p>
          <p className="text-sm text-gray-500 mt-2">
            エラー詳細: データの読み込みに失敗しました
          </p>
        </CardContent>
      </Card>
    );
  }

  // フィルタリング
  const filteredParticipants = safeParticipants.filter((participant) => {
    // 新しい形式と古い形式の両方に対応
    const participantName = participant.participant?.name || participant.participantName || participant.lead?.name || '';
    const participantEmail = participant.participant?.email || participant.participantEmail || participant.lead?.email || '';

    const matchesSearch = searchTerm === '' || 
      participantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      participantEmail.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || participant.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // 最新のX件のみ表示（必要に応じて）
  const displayParticipants = showOnlyRecent && filteredParticipants.length > 10 
    ? filteredParticipants.slice(0, 10)
    : filteredParticipants;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center">
            <UsersIcon className="h-5 w-5 mr-2" />
            参加者一覧
          </CardTitle>
          <Badge variant="outline" className="text-sm">
            {filteredParticipants.length} / {safeParticipants.length}名
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {/* 検索・フィルター */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="名前・メールアドレスで検索..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <FilterIcon className="h-4 w-4 mr-2" />
              <SelectValue placeholder="参加状況" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全ての状況</SelectItem>
              <SelectItem value="CONFIRMED">参加確定</SelectItem>
              <SelectItem value="WAITLIST">キャンセル待ち</SelectItem>
              <SelectItem value="DECLINED">不参加</SelectItem>
              <SelectItem value="PENDING">返信待ち</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {displayParticipants.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {searchTerm || statusFilter !== 'all' 
              ? '条件に一致する参加者が見つかりません' 
              : 'まだ参加者がいません'}
          </div>
        ) : (
          <div className="space-y-4">
            {/* 参加者テーブル */}
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>参加者</TableHead>
                    <TableHead>連絡先</TableHead>
                    <TableHead>参加状況</TableHead>
                    <TableHead>種別</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {displayParticipants.map((participant) => {
                    const statusInfo = getStatusInfo(participant.status);
                    // 新しい形式と古い形式の両方に対応
                    const displayName = participant.participant?.name || participant.participantName || participant.lead?.name || '';
                    const displayEmail = participant.participant?.email || participant.participantEmail || participant.lead?.email || '';
                    const displayPhone = participant.participant?.phone || participant.participantPhone || participant.lead?.phone || '';

                    return (
                      <TableRow key={participant.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{displayName}</p>
                            {participant.note && (
                              <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                                {participant.note}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {displayEmail && (
                              <div className="flex items-center text-xs text-gray-600">
                                <MailIcon className="h-3 w-3 mr-1" />
                                <span className="truncate max-w-[120px]">{displayEmail}</span>
                              </div>
                            )}
                            {displayPhone && (
                              <div className="flex items-center text-xs text-gray-600">
                                <PhoneIcon className="h-3 w-3 mr-1" />
                                <span>{displayPhone}</span>
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={statusInfo.color}>
                            {statusInfo.emoji} {statusInfo.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={participant.isExternal ? 'secondary' : 'outline'}>
                            {participant.isExternal ? '外部' : '内部'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontalIcon className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem 
                                onClick={() => handleStatusChange(participant.id, 'CONFIRMED')}
                                disabled={participant.status === 'CONFIRMED'}
                              >
                                参加確定にする
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleStatusChange(participant.id, 'WAITLIST')}
                                disabled={participant.status === 'WAITLIST'}
                              >
                                キャンセル待ちにする
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleStatusChange(participant.id, 'DECLINED')}
                                disabled={participant.status === 'DECLINED'}
                              >
                                不参加にする
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {/* 全件表示ボタン */}
            {showOnlyRecent && filteredParticipants.length > 10 && (
              <div className="text-center">
                <Button 
                  variant="outline" 
                  onClick={() => setShowOnlyRecent(false)}
                >
                  全ての参加者を表示 ({filteredParticipants.length}名)
                </Button>
              </div>
            )}

            {/* 詳細管理へのリンク */}
            <div className="text-center pt-4">
              <Button asChild variant="outline">
                <a href={`/dashboard/events/${eventId}/manage`}>
                  詳細な参加者管理画面を開く
                </a>
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}