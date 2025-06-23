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
  SearchIcon, 
  MailIcon, 
  PhoneIcon, 
  MoreHorizontalIcon,
  FilterIcon 
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import useSWR, { mutate } from 'swr';
import { toast } from 'sonner';

interface ParticipantsListProps {
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

export function ParticipantsList({ eventId }: ParticipantsListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const { data: response, error, isLoading } = useSWR<ParticipantsResponse>(
    `/api/events/${eventId}/participations`,
    fetcher
  );

  // デバッグ情報を追加
  console.log('API Response:', response);
  console.log('Participants:', response?.participations);

  const participants = response?.participations || [];

  const handleStatusChange = async (participantId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/events/${eventId}/participations/${participantId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('ステータス更新に失敗しました');
      }

      // データを再取得
      mutate(`/api/events/${eventId}/participations`);
      mutate(`/api/events/${eventId}/participations/stats`);
      
      toast.success('参加状況を更新しました');
    } catch {
      toast.error('更新に失敗しました');
    }
  };

  const handleDeleteParticipant = async (participantId: string) => {
    if (!confirm('この参加者を削除しますか？')) return;

    try {
      const response = await fetch(`/api/events/${eventId}/participations/${participantId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('削除に失敗しました');
      }

      mutate(`/api/events/${eventId}/participations`);
      mutate(`/api/events/${eventId}/participations/stats`);
      
      toast.success('参加者を削除しました');
    } catch {
      toast.error('削除に失敗しました');
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">参加者一覧</CardTitle>
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

  if (error || !response) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-red-600">参加者一覧を取得できませんでした</p>
          <p className="text-sm text-gray-500 mt-2">
            エラー詳細: {error?.message || 'データの読み込みに失敗しました'}
          </p>
        </CardContent>
      </Card>
    );
  }

  // フィルタリング
  const filteredParticipants = participants.filter((participant) => {
    const participantName = participant.participant?.name || '';
    const participantEmail = participant.participant?.email || '';

    const matchesSearch = searchTerm === '' || 
      participantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      participantEmail.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || participant.status === statusFilter;
    
    const matchesType = typeFilter === 'all' || 
      (typeFilter === 'external' && participant.isExternal) ||
      (typeFilter === 'internal' && !participant.isExternal);

    return matchesSearch && matchesStatus && matchesType;
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">参加者一覧</CardTitle>
          <Badge variant="outline" className="text-sm">
            {filteredParticipants.length} / {participants.length}名
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {/* フィルター・検索 */}
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
          
          <div className="flex gap-2">
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

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="種別" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全て</SelectItem>
                <SelectItem value="external">外部</SelectItem>
                <SelectItem value="internal">内部</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* 参加者テーブル */}
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>参加者</TableHead>
                <TableHead>連絡先</TableHead>
                <TableHead>参加状況</TableHead>
                <TableHead>種別</TableHead>
                <TableHead>登録日</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredParticipants.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                    {searchTerm || statusFilter !== 'all' || typeFilter !== 'all' 
                      ? '条件に一致する参加者が見つかりません' 
                      : 'まだ参加者がいません'}
                  </TableCell>
                </TableRow>
              ) : (
                filteredParticipants.map((participant) => {
                  const statusInfo = getStatusInfo(participant.status);
                  const displayName = participant.participant?.name || '';
                  const displayEmail = participant.participant?.email || '';
                  const displayPhone = participant.participant?.phone || '';

                  return (
                    <TableRow key={participant.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{displayName}</p>
                          {participant.note && (
                            <p className="text-xs text-gray-500 mt-1">
                              {participant.note.length > 50 
                                ? `${participant.note.substring(0, 50)}...` 
                                : participant.note}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {displayEmail && (
                            <div className="flex items-center text-xs text-gray-600">
                              <MailIcon className="h-3 w-3 mr-1" />
                              <span className="truncate max-w-[150px]">{displayEmail}</span>
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
                        <span className="text-sm text-gray-600">
                          {new Date(participant.registeredAt).toLocaleDateString('ja-JP')}
                        </span>
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
                            <DropdownMenuItem 
                              onClick={() => handleDeleteParticipant(participant.id)}
                              className="text-red-600"
                            >
                              削除
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}