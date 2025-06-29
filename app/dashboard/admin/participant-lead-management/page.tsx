'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { 
  Users, 
  UserPlus, 
  Search,
  RefreshCw,
  CheckCircle,
  XCircle,
  Settings
} from 'lucide-react';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(res => res.json());

interface Participation {
  id: string;
  participantName: string;
  participantEmail?: string;
  participantPhone?: string;
  participantAddress?: string;
  registeredAt: string;
  event: {
    id: string;
    title: string;
    startDate: string;
  };
  matchCandidates: MatchCandidate[];
  candidateProfile?: {
    stage: string;
    completeness: number;
    readyForLead: boolean;
  };
}

interface MatchCandidate {
  id: string;
  leadId?: string;
  lead?: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
  };
  matchType: string;
  confidence: number;
  matchedFields: {
    name: string;
    email: string;
    phone: string;
  };
  status: string;
}

export default function ParticipantLeadManagementPage() {
  const [statusFilter, setStatusFilter] = useState('PROPOSED');
  const [eventFilter, setEventFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedParticipations, setSelectedParticipations] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showMergeDialog, setShowMergeDialog] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<{
    participationId: string;
    matchId: string;
    action: 'approve' | 'reject' | 'merge';
  } | null>(null);

  // 参加者データ取得
  const { data: participationsData, mutate } = useSWR<{
    participations: Participation[];
    pagination: {
      total: number;
      page: number;
      limit: number;
    };
  }>(`/api/admin/participant-lead-management?status=${statusFilter}&eventId=${eventFilter}`, fetcher);

  // イベント一覧取得
  const { data: eventsData } = useSWR('/api/events', fetcher);

  const participations = participationsData?.participations || [];

  // マッチング分析実行
  const handleAnalyzeMatches = async () => {
    if (selectedParticipations.length === 0) {
      toast.error('分析する参加者を選択してください');
      return;
    }

    setIsAnalyzing(true);
    try {
      const response = await fetch('/api/admin/participant-lead-management', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          participationIds: selectedParticipations,
          algorithm: 'hybrid',
          confidenceThreshold: 0.7,
        }),
      });

      if (!response.ok) {
        throw new Error('マッチング分析に失敗しました');
      }

      const result = await response.json();
      toast.success(`${result.summary.totalCandidatesFound}件のマッチング候補を発見しました`);
      mutate();
      setSelectedParticipations([]);
    } catch {
      toast.error('マッチング分析に失敗しました');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // マッチング操作実行
  const handleMatchAction = async (action: 'approve' | 'reject' | 'merge') => {
    if (!selectedMatch) return;

    try {
      const response = await fetch(`/api/admin/participant-lead-management/matches/${selectedMatch.matchId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });

      if (!response.ok) {
        throw new Error('操作に失敗しました');
      }

      const result = await response.json();
      toast.success(result.message);
      mutate();
      setSelectedMatch(null);
      setShowMergeDialog(false);
    } catch {
      toast.error('操作に失敗しました');
    }
  };

  // 新規Lead作成
  const handleCreateLead = async (participationId: string, leadData: {
    name: string;
    email: string;
    phone: string;
    status: string;
  }) => {
    try {
      const response = await fetch('/api/admin/participant-lead-management/create-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          participationId,
          leadData,
          mergeExistingData: true,
        }),
      });

      if (!response.ok) {
        throw new Error('Lead作成に失敗しました');
      }

      const result = await response.json();
      toast.success(result.message);
      mutate();
    } catch {
      toast.error('Lead作成に失敗しました');
    }
  };

  // 信頼度に応じたバッジ色
  const getConfidenceBadgeColor = (confidence: number) => {
    if (confidence >= 0.9) return 'bg-green-100 text-green-800';
    if (confidence >= 0.7) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };



  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">参加者-Lead紐付け管理</h1>
        <p className="text-gray-600">
          イベント参加者と既存Leadの紐付け、または新規Lead作成を管理します
        </p>
      </div>

      {/* フィルタとアクション */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            フィルタとアクション
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="ステータスで絞り込み" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PROPOSED">提案済み</SelectItem>
                <SelectItem value="REVIEWING">レビュー中</SelectItem>
                <SelectItem value="APPROVED">承認済み</SelectItem>
                <SelectItem value="REJECTED">却下済み</SelectItem>
              </SelectContent>
            </Select>

            <Select value={eventFilter} onValueChange={setEventFilter}>
              <SelectTrigger>
                <SelectValue placeholder="イベントで絞り込み" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">全てのイベント</SelectItem>
                {eventsData?.map((event: { id: string; title: string }) => (
                  <SelectItem key={event.id} value={event.id}>
                    {event.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input
              placeholder="参加者名で検索"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />

            <Button 
              onClick={handleAnalyzeMatches}
              disabled={selectedParticipations.length === 0 || isAnalyzing}
              className="flex items-center gap-2"
            >
              {isAnalyzing ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
              マッチング分析
            </Button>
          </div>

          {selectedParticipations.length > 0 && (
            <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
              <Users className="h-4 w-4 text-blue-600" />
              <span className="text-sm text-blue-700">
                {selectedParticipations.length}件の参加者が選択されています
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 参加者一覧 */}
      <Card>
        <CardHeader>
          <CardTitle>未紐付け参加者一覧</CardTitle>
        </CardHeader>
        <CardContent>
          {!participations.length ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">未紐付けの参加者はありません</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <input
                      type="checkbox"
                      checked={selectedParticipations.length === participations.length}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedParticipations(participations.map(p => p.id));
                        } else {
                          setSelectedParticipations([]);
                        }
                      }}
                    />
                  </TableHead>
                  <TableHead>参加者情報</TableHead>
                  <TableHead>イベント</TableHead>
                  <TableHead>マッチング候補</TableHead>
                  <TableHead>Lead準備状況</TableHead>
                  <TableHead>アクション</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {participations.map((participation) => (
                  <TableRow key={participation.id}>
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={selectedParticipations.includes(participation.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedParticipations([...selectedParticipations, participation.id]);
                          } else {
                            setSelectedParticipations(selectedParticipations.filter(id => id !== participation.id));
                          }
                        }}
                      />
                    </TableCell>
                    
                    <TableCell>
                      <div>
                        <div className="font-medium">{participation.participantName}</div>
                        <div className="text-sm text-gray-600">
                          {participation.participantEmail}
                        </div>
                        {participation.participantPhone && (
                          <div className="text-sm text-gray-600">
                            {participation.participantPhone}
                          </div>
                        )}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div>
                        <div className="font-medium">{participation.event.title}</div>
                        <div className="text-sm text-gray-600">
                          {new Date(participation.event.startDate).toLocaleDateString('ja-JP')}
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="space-y-2">
                        {participation.matchCandidates.length === 0 ? (
                          <Badge variant="outline">候補なし</Badge>
                        ) : (
                          participation.matchCandidates.slice(0, 2).map((match) => (
                            <div key={match.id} className="flex items-center gap-2">
                              <Badge className={getConfidenceBadgeColor(match.confidence)}>
                                {Math.round(match.confidence * 100)}%
                              </Badge>
                              <span className="text-sm">{match.lead?.name}</span>
                              <div className="flex gap-1">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setSelectedMatch({
                                      participationId: participation.id,
                                      matchId: match.id,
                                      action: 'approve',
                                    });
                                    setShowMergeDialog(true);
                                  }}
                                >
                                  <CheckCircle className="h-3 w-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleMatchAction('reject')}
                                >
                                  <XCircle className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </TableCell>

                    <TableCell>
                      {participation.candidateProfile ? (
                        <div>
                          <Badge 
                            variant={participation.candidateProfile.readyForLead ? "default" : "secondary"}
                          >
                            {participation.candidateProfile.readyForLead ? "準備完了" : "準備中"}
                          </Badge>
                          <div className="text-sm text-gray-600 mt-1">
                            完成度: {Math.round(participation.candidateProfile.completeness * 100)}%
                          </div>
                        </div>
                      ) : (
                        <Badge variant="outline">未分析</Badge>
                      )}
                    </TableCell>

                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            // 新規Lead作成ダイアログを開く
                            const leadData = {
                              name: participation.participantName,
                              email: participation.participantEmail || '',
                              phone: participation.participantPhone || '',
                              status: 'potential',
                            };
                            handleCreateLead(participation.id, leadData);
                          }}
                        >
                          <UserPlus className="h-3 w-3 mr-1" />
                          Lead作成
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* マッチング確認ダイアログ */}
      <AlertDialog open={showMergeDialog} onOpenChange={setShowMergeDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>マッチング操作の確認</AlertDialogTitle>
            <AlertDialogDescription>
              この操作を実行してもよろしいですか？この操作は取り消すことができません。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>キャンセル</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedMatch && handleMatchAction(selectedMatch.action)}
            >
              実行
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}