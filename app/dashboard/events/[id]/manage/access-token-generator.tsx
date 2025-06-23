'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  LinkIcon, 
  CopyIcon, 
  RefreshCwIcon, 
  ExternalLinkIcon,
  QrCodeIcon 
} from 'lucide-react';
import { toast } from 'sonner';
import useSWR, { mutate } from 'swr';

interface AccessTokenGeneratorProps {
  eventId: string;
}

interface AccessToken {
  id: string;
  token: string;
  isActive: boolean;
  expiresAt?: string;
  createdAt: string;
  _count: {
    participations: number;
  };
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function AccessTokenGenerator({ eventId }: AccessTokenGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);

  const { data: accessToken, error, isLoading } = useSWR<AccessToken>(
    `/api/events/${eventId}/access-token`,
    fetcher
  );

  const generateAccessToken = async () => {
    setIsGenerating(true);
    
    try {
      const response = await fetch(`/api/events/${eventId}/access-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('アクセストークン生成に失敗しました');
      }

      mutate(`/api/events/${eventId}/access-token`);
      toast.success('外部申込URLを生成しました');
      
    } catch (error) {
      toast.error('アクセストークン生成に失敗しました');
    } finally {
      setIsGenerating(false);
    }
  };

  const regenerateAccessToken = async () => {
    setIsRegenerating(true);
    
    try {
      const response = await fetch(`/api/events/${eventId}/access-token`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('アクセストークン再生成に失敗しました');
      }

      mutate(`/api/events/${eventId}/access-token`);
      toast.success('外部申込URLを再生成しました');
      
    } catch (error) {
      toast.error('アクセストークン再生成に失敗しました');
    } finally {
      setIsRegenerating(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('URLをコピーしました');
    } catch (error) {
      toast.error('コピーに失敗しました');
    }
  };

  const publicUrl = accessToken 
    ? `${typeof window !== 'undefined' ? window.location.origin : ''}/public/events/${accessToken.token}`
    : '';

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <LinkIcon className="h-5 w-5 mr-2" />
            外部申込URL
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-8 bg-gray-200 rounded w-32"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          <LinkIcon className="h-5 w-5 mr-2" />
          外部申込URL
        </CardTitle>
        <p className="text-sm text-gray-600">
          外部ユーザーが参加申込できる公開URLです
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {!accessToken ? (
          /* アクセストークンが未生成の場合 */
          <div className="text-center py-6">
            <p className="text-gray-600 mb-4">
              外部申込URLがまだ生成されていません
            </p>
            <Button 
              onClick={generateAccessToken}
              disabled={isGenerating}
              className="min-w-[150px]"
            >
              {isGenerating ? (
                <>
                  <RefreshCwIcon className="h-4 w-4 mr-2 animate-spin" />
                  生成中...
                </>
              ) : (
                <>
                  <LinkIcon className="h-4 w-4 mr-2" />
                  URLを生成
                </>
              )}
            </Button>
          </div>
        ) : (
          /* アクセストークンが存在する場合 */
          <div className="space-y-4">
            {/* ステータス表示 */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Badge variant={accessToken.isActive ? 'default' : 'secondary'}>
                  {accessToken.isActive ? '有効' : '無効'}
                </Badge>
                <span className="text-sm text-gray-600">
                  {accessToken._count.participations}名が申込済み
                </span>
              </div>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={regenerateAccessToken}
                disabled={isRegenerating}
              >
                {isRegenerating ? (
                  <RefreshCwIcon className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCwIcon className="h-4 w-4" />
                )}
              </Button>
            </div>

            {/* URL表示 */}
            <div className="space-y-2">
              <Label>外部申込URL</Label>
              <div className="flex space-x-2">
                <Input 
                  value={publicUrl}
                  readOnly
                  className="font-mono text-sm"
                />
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => copyToClipboard(publicUrl)}
                >
                  <CopyIcon className="h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="icon"
                  asChild
                >
                  <a href={publicUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLinkIcon className="h-4 w-4" />
                  </a>
                </Button>
              </div>
            </div>

            {/* アクセストークン詳細 */}
            <div className="text-xs text-gray-500 space-y-1">
              <p>生成日: {new Date(accessToken.createdAt).toLocaleString('ja-JP')}</p>
              {accessToken.expiresAt && (
                <p>有効期限: {new Date(accessToken.expiresAt).toLocaleString('ja-JP')}</p>
              )}
            </div>

            {/* 使用方法 */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
              <h4 className="font-medium text-blue-900 mb-2">使用方法</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• このURLを参加者にメール・SNSで共有してください</li>
                <li>• 参加者は認証なしで参加申込ができます</li>
                <li>• QRコードを生成して印刷物にも利用できます</li>
                <li>• URLを再生成すると古いURLは無効になります</li>
              </ul>
            </div>

            {/* 追加アクション */}
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => copyToClipboard(publicUrl)}
                className="flex-1"
              >
                <CopyIcon className="h-4 w-4 mr-2" />
                URLをコピー
              </Button>
              
              <Button 
                variant="outline" 
                size="sm"
                className="flex-1"
                onClick={() => toast.info('QRコード生成機能は今後実装予定です')}
              >
                <QrCodeIcon className="h-4 w-4 mr-2" />
                QRコード
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}