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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import useSWR from 'swr';
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
  leadId?: string;
  participantName: string;
  participantEmail?: string;
  participantPhone?: string;
  lead?: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
  };
  participant?: {
    id?: string;
    name: string;
    email?: string;
    phone?: string;
  };
}

interface Lead {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
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
  const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null);
  const [leadSearchTerm, setLeadSearchTerm] = useState('');
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);

  const { data: participantsData, error: participantsError, isLoading: participantsLoading } = useSWR<ParticipantsResponse>(
    `/api/events/${eventId}/participations`,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 5000,
      errorRetryCount: 3,
      errorRetryInterval: 1000,
      onError: (error) => {
        console.error('Participants fetch error:', error);
      }
    }
  );

  // Lead検索用のSWR
  const { data: leadsData } = useSWR<Lead[]>(
    leadSearchTerm.length >= 2 ? `/api/leads?search=${encodeURIComponent(leadSearchTerm)}` : null,
    fetcher
  );

  // デバッグ情報を追加
  console.log('API Response:', participantsData);
  console.log('Participants:', participantsData?.participations);

  const participants = participantsData?.participations || [];

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

  const handleDeleteParticipant = async (participationId: string) => {
    if (!confirm('この参加者を削除しますか？')) return;

    try {
      const response = await fetch(`/api/events/${eventId}/participations/${participationId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('削除に失敗しました');
      }

      // データを再取得（エラーハンドリングを追加）
      try {
        // SWRの自動再検証に依存
        window.location.reload();
      } catch (reloadError) {
        console.error('Reload error:', reloadError);
      }
      
      toast.success('参加者を削除しました');
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('削除に失敗しました');
    }
  };

  const handleLinkToLead = async (participationId: string, leadId: string) => {
    try {
      const response = await fetch(`/api/events/${eventId}/participations/${participationId}/link-lead`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ leadId }),
      });

      if (!response.ok) {
        throw new Error('Leadとの紐付けに失敗しました');
      }

      // データを再取得（エラーハンドリングを追加）
      try {
        // SWRの自動再検証に依存
        window.location.reload();
      } catch (reloadError) {
        console.error('Reload error:', reloadError);
      }
      
      setIsLinkDialogOpen(false);
      setSelectedParticipant(null);
      setLeadSearchTerm('');
      
      toast.success('Leadと紐付けました');
    } catch (error) {
      console.error('Link error:', error);
      toast.error('紐付けに失敗しました');
    }
  };

  const handleCreateNewLead = async (participationId: string) => {
    if (!selectedParticipant) return;

    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: selectedParticipant.participantName,
          email: selectedParticipant.participantEmail,
          phone: selectedParticipant.participantPhone,
          type: 'individual',
        }),
      });

      if (!response.ok) {
        throw new Error('新規Lead作成に失敗しました');
      }

      const newLead = await response.json();
      await handleLinkToLead(participationId, newLead.id);
      
      toast.success('新規Leadを作成し、紐付けました');
    } catch (error) {
      console.error('Create lead error:', error);
      toast.error('新規Lead作成に失敗しました');
    }
  };

  const openLinkDialog = (participant: Participant) => {
    setSelectedParticipant(participant);
    setIsLinkDialogOpen(true);
    setLeadSearchTerm('');
  };

  if (participantsLoading) {
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

  if (participantsError || !participantsData) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-red-600">参加者一覧を取得できませんでした</p>
          <p className="text-sm text-gray-500 mt-2">
            エラー詳細: {participantsError?.message || 'データの読み込みに失敗しました'}
          </p>
        </CardContent>
      </Card>
    );
  }

  // フィルタリング
  const filteredParticipants = participants.filter((participant) => {
    const participantName = participant.participantName || participant.participant?.name || '';
    const participantEmail = participant.participantEmail || participant.participant?.email || '';

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
                <TableHead>Lead紐付け</TableHead>
                <TableHead>登録日</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredParticipants.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                    {searchTerm || statusFilter !== 'all' || typeFilter !== 'all' 
                      ? '条件に一致する参加者が見つかりません' 
                      : 'まだ参加者がいません'}
                  </TableCell>
                </TableRow>
              ) : (
                filteredParticipants.map((participant) => {
                  const statusInfo = getStatusInfo(participant.status);
                  const displayName = participant.participantName || participant.participant?.name || '';
                  const displayEmail = participant.participantEmail || participant.participant?.email || '';
                  const displayPhone = participant.participantPhone || participant.participant?.phone || '';

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
                        {participant.leadId ? (
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-green-600 border-green-600">
                              ✓ 紐付け済み
                            </Badge>
                            <span className="text-xs text-gray-500">
                              {participant.lead?.name || 'Lead情報'}
                            </span>
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openLinkDialog(participant)}
                            className="text-blue-600 border-blue-600 hover:bg-blue-50"
                          >
                            Lead紐付け
                          </Button>
                        )}
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
                              onClick={() => openLinkDialog(participant)}
                              disabled={!!participant.leadId}
                            >
                              Lead紐付け
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

        {/* Lead紐付けダイアログ */}
        <Dialog open={isLinkDialogOpen} onOpenChange={setIsLinkDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Leadとの紐付け</DialogTitle>
            </DialogHeader>
            
            {selectedParticipant && (
              <div className="space-y-6">
                {/* 参加者情報 */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium mb-2">参加者情報</h3>
                  <div className="space-y-1 text-sm">
                    <p><span className="font-medium">名前:</span> {selectedParticipant.participantName}</p>
                    {selectedParticipant.participantEmail && (
                      <p><span className="font-medium">メール:</span> {selectedParticipant.participantEmail}</p>
                    )}
                    {selectedParticipant.participantPhone && (
                      <p><span className="font-medium">電話:</span> {selectedParticipant.participantPhone}</p>
                    )}
                  </div>
                </div>

                {/* Lead検索 */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="lead-search">既存Leadを検索</Label>
                    <Input
                      id="lead-search"
                      placeholder="名前またはメールアドレスで検索..."
                      value={leadSearchTerm}
                      onChange={(e) => setLeadSearchTerm(e.target.value)}
                      className="mt-1"
                    />
                  </div>

                  {/* 検索結果 */}
                  {leadSearchTerm.length >= 2 && (
                    <div className="border rounded-lg p-4 max-h-60 overflow-y-auto">
                      <h4 className="font-medium mb-3">検索結果</h4>
                      {leadsData && leadsData.length > 0 ? (
                        <div className="space-y-2">
                          {leadsData.map((lead) => (
                            <div
                              key={lead.id}
                              className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                            >
                              <div>
                                <p className="font-medium">{lead.name}</p>
                                {lead.email && <p className="text-sm text-gray-600">{lead.email}</p>}
                                {lead.company && <p className="text-xs text-gray-500">{lead.company}</p>}
                              </div>
                              <Button
                                size="sm"
                                onClick={() => handleLinkToLead(selectedParticipant.id, lead.id)}
                              >
                                紐付け
                              </Button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-center py-4">
                          該当するLeadが見つかりません
                        </p>
                      )}
                    </div>
                  )}

                  {/* 新規Lead作成 */}
                  <div className="border-t pt-4">
                    <Button
                      variant="outline"
                      onClick={() => handleCreateNewLead(selectedParticipant.id)}
                      className="w-full"
                    >
                      新規Leadとして作成して紐付け
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}