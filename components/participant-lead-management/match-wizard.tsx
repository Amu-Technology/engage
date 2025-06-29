'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription 
} from '@/components/ui/dialog';
import { 
  AlertTriangle, 
  CheckCircle, 
  User, 
  ArrowRight,
  Merge,
  UserPlus
} from 'lucide-react';
import { toast } from 'sonner';

interface MatchWizardProps {
  isOpen: boolean;
  onClose: () => void;
  participation: {
    id: string;
    participantName: string;
    participantEmail?: string;
    participantPhone?: string;
    participantAddress?: string;
    event: {
      title: string;
      startDate: string;
    };
  };
  matchCandidate?: {
    id: string;
    leadId?: string;
    lead?: {
      id: string;
      name: string;
      email?: string;
      phone?: string;
      address?: string;
    };
    confidence: number;
    matchType: string;
    matchedFields: {
      name?: boolean;
      email?: boolean;
      phone?: boolean;
    };
  };
  onComplete: () => void;
}

export function MatchWizard({
  isOpen,
  onClose,
  participation,
  matchCandidate,
  onComplete
}: MatchWizardProps) {
  const [step, setStep] = useState(1);
  const [action, setAction] = useState<'merge' | 'link' | 'create'>('merge');
  const [leadFormData, setLeadFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    company: '',
    position: '',
    status: 'potential',
  });
  const [note, setNote] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // フォーム初期化
      setStep(1);
      setLeadFormData({
        name: participation.participantName,
        email: participation.participantEmail || '',
        phone: participation.participantPhone || '',
        address: participation.participantAddress || '',
        company: '',
        position: '',
        status: 'potential',
      });
      setNote('');
    }
  }, [isOpen, participation]);

  // データ比較表示コンポーネント
  const DataComparison = ({ label, participantValue, leadValue, isMatched }: {
    label: string;
    participantValue?: string;
    leadValue?: string;
    isMatched?: boolean;
  }) => (
    <div className="grid grid-cols-3 gap-4 p-3 border rounded-lg">
      <div className="font-medium flex items-center gap-2">
        {isMatched && <CheckCircle className="h-4 w-4 text-green-600" />}
        {label}
      </div>
      <div className="text-sm">
        <div className="text-gray-600">参加者</div>
        <div className={isMatched ? 'font-medium text-green-700' : ''}>
          {participantValue || '(未入力)'}
        </div>
      </div>
      <div className="text-sm">
        <div className="text-gray-600">Lead</div>
        <div className={isMatched ? 'font-medium text-green-700' : ''}>
          {leadValue || '(未入力)'}
        </div>
      </div>
    </div>
  );

  // ステップ1: アクション選択
  const renderActionSelection = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">処理方法を選択してください</h3>
        
        {matchCandidate && (
          <div className="space-y-4">
            {/* マッチング情報表示 */}
            <Card className="border-blue-200">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">マッチング候補</CardTitle>
                  <Badge className="bg-blue-100 text-blue-800">
                    信頼度: {Math.round(matchCandidate.confidence * 100)}%
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <DataComparison
                    label="名前"
                    participantValue={participation.participantName}
                    leadValue={matchCandidate.lead?.name}
                    isMatched={matchCandidate.matchedFields?.name}
                  />
                  <DataComparison
                    label="メール"
                    participantValue={participation.participantEmail}
                    leadValue={matchCandidate.lead?.email}
                    isMatched={matchCandidate.matchedFields?.email}
                  />
                  <DataComparison
                    label="電話番号"
                    participantValue={participation.participantPhone}
                    leadValue={matchCandidate.lead?.phone}
                    isMatched={matchCandidate.matchedFields?.phone}
                  />
                </div>
              </CardContent>
            </Card>

            {/* アクション選択ボタン */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card 
                className={`cursor-pointer border-2 transition-colors ${
                  action === 'merge' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                }`}
                onClick={() => setAction('merge')}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Merge className="h-6 w-6 text-blue-600" />
                    <div>
                      <div className="font-medium">データをマージして紐付け</div>
                      <div className="text-sm text-gray-600">
                        Leadデータを参加者情報で補強します
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card 
                className={`cursor-pointer border-2 transition-colors ${
                  action === 'link' ? 'border-green-500 bg-green-50' : 'border-gray-200'
                }`}
                onClick={() => setAction('link')}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <ArrowRight className="h-6 w-6 text-green-600" />
                    <div>
                      <div className="font-medium">そのまま紐付け</div>
                      <div className="text-sm text-gray-600">
                        既存のLeadデータを変更せずに紐付けます
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* 新規Lead作成オプション */}
        <Card 
          className={`cursor-pointer border-2 transition-colors mt-4 ${
            action === 'create' ? 'border-purple-500 bg-purple-50' : 'border-gray-200'
          }`}
          onClick={() => setAction('create')}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <UserPlus className="h-6 w-6 text-purple-600" />
              <div>
                <div className="font-medium">新しいLeadを作成</div>
                <div className="text-sm text-gray-600">
                  参加者情報から新しいLeadを作成します
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {action === 'create' && (
        <Card className="border-yellow-200">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              重複チェック
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              同名または同じメールアドレスのLeadが既に存在する可能性があります。
              続行前に再度確認することをお勧めします。
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );

  // ステップ2: Lead情報入力（新規作成時）
  const renderLeadForm = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Lead情報を入力してください</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">名前 *</Label>
          <Input
            id="name"
            value={leadFormData.name}
            onChange={(e) => setLeadFormData({ ...leadFormData, name: e.target.value })}
            placeholder="名前を入力"
          />
        </div>

        <div>
          <Label htmlFor="email">メールアドレス</Label>
          <Input
            id="email"
            type="email"
            value={leadFormData.email}
            onChange={(e) => setLeadFormData({ ...leadFormData, email: e.target.value })}
            placeholder="メールアドレスを入力"
          />
        </div>

        <div>
          <Label htmlFor="phone">電話番号</Label>
          <Input
            id="phone"
            value={leadFormData.phone}
            onChange={(e) => setLeadFormData({ ...leadFormData, phone: e.target.value })}
            placeholder="電話番号を入力"
          />
        </div>

        <div>
          <Label htmlFor="company">会社名</Label>
          <Input
            id="company"
            value={leadFormData.company}
            onChange={(e) => setLeadFormData({ ...leadFormData, company: e.target.value })}
            placeholder="会社名を入力"
          />
        </div>

        <div className="md:col-span-2">
          <Label htmlFor="address">住所</Label>
          <Input
            id="address"
            value={leadFormData.address}
            onChange={(e) => setLeadFormData({ ...leadFormData, address: e.target.value })}
            placeholder="住所を入力"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="note">メモ</Label>
        <Textarea
          id="note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="必要に応じてメモを入力してください"
          rows={3}
        />
      </div>
    </div>
  );

  // ステップ3: 確認
  const renderConfirmation = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">実行内容の確認</h3>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-base">実行する処理</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {action === 'merge' && (
              <div className="flex items-center gap-2 text-blue-700">
                <Merge className="h-4 w-4" />
                <span>Leadデータをマージして紐付け</span>
              </div>
            )}
            {action === 'link' && (
              <div className="flex items-center gap-2 text-green-700">
                <ArrowRight className="h-4 w-4" />
                <span>既存Leadにそのまま紐付け</span>
              </div>
            )}
            {action === 'create' && (
              <div className="flex items-center gap-2 text-purple-700">
                <UserPlus className="h-4 w-4" />
                <span>新しいLeadを作成して紐付け</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">対象参加者</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 mb-2">
            <User className="h-4 w-4" />
            <span className="font-medium">{participation.participantName}</span>
          </div>
          <div className="text-sm text-gray-600">
            イベント: {participation.event.title}
          </div>
        </CardContent>
      </Card>

      {matchCandidate && action !== 'create' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">対象Lead</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span className="font-medium">{matchCandidate.lead?.name}</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  // 処理実行
  const handleExecute = async () => {
    setIsProcessing(true);
    try {
      let response;

      if (action === 'create') {
        // 新規Lead作成
        response = await fetch('/api/admin/participant-lead-management/create-lead', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            participationId: participation.id,
            leadData: leadFormData,
            mergeExistingData: true,
          }),
        });
      } else if (matchCandidate) {
        // 既存Leadとの紐付け
        response = await fetch(`/api/admin/participant-lead-management/matches/${matchCandidate.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: action === 'merge' ? 'merge' : 'approve',
            note,
          }),
        });
      }

      if (!response?.ok) {
        throw new Error('処理に失敗しました');
      }

      const result = await response.json();
      toast.success(result.message);
      onComplete();
      onClose();
    } catch (error) {
      console.error('エラー:', error);
      toast.error('処理に失敗しました');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>参加者-Lead紐付けウィザード</DialogTitle>
          <DialogDescription>
            {participation.participantName} さんのLead紐付けを設定します
          </DialogDescription>
        </DialogHeader>

        {/* プログレスバー */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">ステップ {step} / 3</span>
            <span className="text-sm text-gray-600">{Math.round((step / 3) * 100)}%</span>
          </div>
          <Progress value={(step / 3) * 100} className="h-2" />
        </div>

        {/* ステップ内容 */}
        <div className="min-h-[400px]">
          {step === 1 && renderActionSelection()}
          {step === 2 && action === 'create' && renderLeadForm()}
          {(step === 2 && action !== 'create') || step === 3 && renderConfirmation()}
        </div>

        <DialogFooter>
          <div className="flex justify-between w-full">
            <Button
              variant="outline"
              onClick={() => {
                if (step > 1) {
                  setStep(step - 1);
                } else {
                  onClose();
                }
              }}
              disabled={isProcessing}
            >
              {step === 1 ? 'キャンセル' : '戻る'}
            </Button>

            <Button
              onClick={() => {
                if (step === 3 || (step === 2 && action !== 'create') || (step === 1 && action !== 'create')) {
                  handleExecute();
                } else {
                  setStep(step + 1);
                }
              }}
              disabled={isProcessing || (action === 'create' && step === 2 && !leadFormData.name)}
            >
              {isProcessing ? '処理中...' : 
               (step === 3 || (step === 2 && action !== 'create') || (step === 1 && action !== 'create')) ? '実行' : '次へ'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}