'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  PrinterIcon, 
  InfoIcon,
  PackageIcon
} from 'lucide-react';
import useSWR from 'swr';
import { toast } from 'sonner';
import QRCode from 'qrcode';

interface ShippingLabelsProps {
  eventId: string;
}

interface RecipientInfo {
  name: string;
  nameReading?: string;
  postalCode?: string;
  address?: string;
  phone?: string;
  email?: string;
  company?: string;
  position?: string;
}

interface EventInfo {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  location?: string;
  description?: string;
  participationFee?: number;
  requirements?: string;
  maxParticipants?: number;
}

interface OrganizationInfo {
  name: string;
  contactInfo?: string;
}

interface ShippingLabel {
  id: string;
  recipientInfo: RecipientInfo;
  eventInfo: EventInfo;
  organizationInfo: OrganizationInfo;
  registrationUrl: string;
  qrCodeData: string;
  printDate: string;
}

interface ShippingLabelsResponse {
  event: {
    id: string;
    title: string;
    groupName: string;
  };
  shippingLabels: ShippingLabel[];
  totalCount: number;
}

const fetcher = (url: string) => fetch(url).then(async (res) => {
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error! status: ${res.status}`);
  }
  return res.json();
});

export function ShippingLabels({ eventId }: ShippingLabelsProps) {
  const [isPrinting, setIsPrinting] = useState(false);
  const [qrCodes, setQrCodes] = useState<Record<string, string>>({});

  const { data: labelsData, error, isLoading } = useSWR<ShippingLabelsResponse>(
    `/api/events/${eventId}/shipping-labels`,
    fetcher
  );

  // デバッグ情報を追加
  console.log('送り状印刷コンポーネント - イベントID:', eventId);
  console.log('送り状印刷コンポーネント - データ:', labelsData);
  console.log('送り状印刷コンポーネント - エラー:', error);
  console.log('送り状印刷コンポーネント - 読み込み中:', isLoading);

  // QRコードを生成
  useEffect(() => {
    if (labelsData?.shippingLabels) {
      const generateQRCodes = async () => {
        const newQrCodes: Record<string, string> = {};
        
        for (const label of labelsData.shippingLabels) {
          try {
            const qrDataUrl = await QRCode.toDataURL(label.qrCodeData, {
              width: 200,
              margin: 2,
              color: {
                dark: '#000000',
                light: '#FFFFFF'
              }
            });
            newQrCodes[label.id] = qrDataUrl;
          } catch (error) {
            console.error('QRコード生成エラー:', error);
          }
        }
        
        setQrCodes(newQrCodes);
      };
      
      generateQRCodes();
    }
  }, [labelsData]);

  const handlePrint = async () => {
    setIsPrinting(true);
    try {
      // 印刷用のスタイルを適用
      const printContent = document.getElementById('shipping-labels-content');
      if (printContent) {
        const printWindow = window.open('', '_blank');
        if (printWindow) {
          printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
              <title>送り状 - ${labelsData?.event.title}</title>
              <style>
                @page {
                  size: A4;
                  margin: 10mm;
                }
                body {
                  font-family: 'Noto Sans JP', sans-serif;
                  font-size: 12px;
                  line-height: 1.4;
                  margin: 0;
                  padding: 0;
                }
                .shipping-label {
                  width: 100%;
                  max-width: 180mm;
                  min-height: 120mm;
                  border: 2px solid #000;
                  margin-bottom: 10mm;
                  padding: 5mm;
                  box-sizing: border-box;
                  page-break-inside: avoid;
                  page-break-after: always;
                }
                .shipping-label:last-child {
                  page-break-after: auto;
                }
                .header {
                  text-align: center;
                  border-bottom: 1px solid #000;
                  padding-bottom: 3mm;
                  margin-bottom: 3mm;
                }
                .event-title {
                  font-size: 16px;
                  font-weight: bold;
                  margin-bottom: 2mm;
                }
                .organization-name {
                  font-size: 12px;
                  color: #666;
                }
                .content {
                  display: flex;
                  gap: 5mm;
                }
                .recipient-section {
                  flex: 1;
                }
                .qr-section {
                  width: 30mm;
                  text-align: center;
                }
                .recipient-name {
                  font-size: 18px;
                  font-weight: bold;
                  margin-bottom: 2mm;
                }
                .recipient-reading {
                  font-size: 10px;
                  color: #666;
                  margin-bottom: 3mm;
                }
                .address-section {
                  margin-bottom: 3mm;
                }
                .postal-code {
                  font-size: 14px;
                  font-weight: bold;
                  margin-bottom: 1mm;
                }
                .address {
                  font-size: 12px;
                  line-height: 1.6;
                }
                .contact-info {
                  font-size: 10px;
                  color: #666;
                  margin-bottom: 3mm;
                }
                .event-details {
                  border-top: 1px solid #ddd;
                  padding-top: 3mm;
                  margin-top: 3mm;
                }
                .event-details h4 {
                  font-size: 12px;
                  font-weight: bold;
                  margin: 0 0 2mm 0;
                }
                .detail-row {
                  display: flex;
                  margin-bottom: 1mm;
                }
                .detail-label {
                  width: 15mm;
                  font-size: 10px;
                  color: #666;
                }
                .detail-value {
                  flex: 1;
                  font-size: 10px;
                }
                .qr-placeholder {
                  width: 25mm;
                  height: 25mm;
                  border: 1px solid #000;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  font-size: 8px;
                  text-align: center;
                  margin-bottom: 2mm;
                }
                .qr-code {
                  width: 25mm;
                  height: 25mm;
                  margin-bottom: 2mm;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                }
                .qr-code img {
                  width: 100%;
                  height: 100%;
                  object-fit: contain;
                  max-width: 25mm;
                  max-height: 25mm;
                }
                .qr-url {
                  font-size: 8px;
                  word-break: break-all;
                  line-height: 1.2;
                }
                .footer {
                  border-top: 1px solid #ddd;
                  padding-top: 2mm;
                  margin-top: 3mm;
                  font-size: 8px;
                  color: #666;
                  text-align: right;
                }
              </style>
            </head>
            <body>
              ${printContent.innerHTML}
            </body>
            </html>
          `);
          printWindow.document.close();
          printWindow.focus();
          setTimeout(() => {
            printWindow.print();
            printWindow.close();
          }, 1000);
        }
      }
      toast.success('印刷を開始しました');
    } catch (error) {
      console.error('印刷エラー:', error);
      toast.error('印刷に失敗しました');
    } finally {
      setIsPrinting(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PackageIcon className="h-5 w-5" />
            送り状印刷
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="text-gray-600 mt-4">送り状データを読み込み中...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !labelsData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PackageIcon className="h-5 w-5" />
            送り状印刷
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <InfoIcon className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <p className="text-red-600 mb-2">送り状データの読み込みに失敗しました</p>
            <p className="text-sm text-gray-500 mt-2">
              エラー詳細: {error?.message || 'データの読み込みに失敗しました'}
            </p>
            <div className="mt-4 p-3 bg-gray-50 rounded text-left">
              <p className="text-xs text-gray-600 mb-2">デバッグ情報:</p>
              <p className="text-xs text-gray-500">イベントID: {eventId}</p>
              <p className="text-xs text-gray-500">エラータイプ: {error?.name || 'Unknown'}</p>
              <p className="text-xs text-gray-500">データ状態: {labelsData ? '存在' : 'なし'}</p>
            </div>
            <div className="mt-4">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.location.reload()}
              >
                ページを再読み込み
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (labelsData.totalCount === 0 || !labelsData.shippingLabels || labelsData.shippingLabels.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PackageIcon className="h-5 w-5" />
            送り状印刷
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <InfoIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">送り状を作成できません</p>
            <p className="text-sm text-gray-500">
              このイベントにグループが設定されていないか、グループにリードが登録されていません
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <PackageIcon className="h-5 w-5" />
            送り状印刷
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline">
              {labelsData?.totalCount || 0}件
            </Badge>
            <Button
              onClick={handlePrint}
              disabled={isPrinting}
              className="flex items-center gap-2"
            >
              <PrinterIcon className="h-4 w-4" />
              {isPrinting ? '印刷中...' : '印刷する'}
            </Button>
          </div>
        </div>
        <p className="text-sm text-gray-600">
          グループ「{labelsData?.event?.groupName || '未設定'}」のリード {labelsData?.totalCount || 0}件の送り状を印刷できます
        </p>
      </CardHeader>
      <CardContent>
        <div id="shipping-labels-content">
          {labelsData.shippingLabels?.map((label) => (
            <div key={label.id} className="shipping-label" style={{ pageBreakAfter: 'always' }}>
              {/* ヘッダー */}
              <div className="header">
                <div className="event-title">{label.eventInfo.title}</div>
                <div className="organization-name">{label.organizationInfo.name}</div>
              </div>

              {/* メインコンテンツ */}
              <div className="content">
                {/* 宛先情報 */}
                <div className="recipient-section">
                  <div className="recipient-name">{label.recipientInfo.name} 様</div>
                  {label.recipientInfo.nameReading && (
                    <div className="recipient-reading">({label.recipientInfo.nameReading})</div>
                  )}
                  
                  {(label.recipientInfo.postalCode || label.recipientInfo.address) && (
                    <div className="address-section">
                      {label.recipientInfo.postalCode && (
                        <div className="postal-code">〒{label.recipientInfo.postalCode}</div>
                      )}
                      {label.recipientInfo.address && (
                        <div className="address">{label.recipientInfo.address}</div>
                      )}
                    </div>
                  )}

                  <div className="contact-info">
                    {label.recipientInfo.phone && <div>TEL: {label.recipientInfo.phone}</div>}
                    {label.recipientInfo.email && <div>Email: {label.recipientInfo.email}</div>}
                    {label.recipientInfo.company && (
                      <div>
                        {label.recipientInfo.company}
                        {label.recipientInfo.position && ` ${label.recipientInfo.position}`}
                      </div>
                    )}
                  </div>
                </div>

                {/* QRコードセクション */}
                <div className="qr-section">
                  {qrCodes[label.id] ? (
                    <div className="qr-code">
                      <img src={qrCodes[label.id]} alt={`QR Code for ${label.recipientInfo.name}`} />
                    </div>
                  ) : (
                    <div className="qr-placeholder">
                      QRコード<br />
                    生成中...
                    </div>
                  )}
                  <div className="qr-url">{label.registrationUrl}</div>
                </div>
              </div>

              {/* イベント詳細 */}
              <div className="event-details">
                <h4>イベント詳細</h4>
                <div className="detail-row">
                  <span className="detail-label">日時:</span>
                  <span className="detail-value">
                    {new Date(label.eventInfo.startDate).toLocaleString('ja-JP')}
                    {label.eventInfo.endDate && 
                      ` ～ ${new Date(label.eventInfo.endDate).toLocaleString('ja-JP')}`
                    }
                  </span>
                </div>
                {label.eventInfo.location && (
                  <div className="detail-row">
                    <span className="detail-label">会場:</span>
                    <span className="detail-value">{label.eventInfo.location}</span>
                  </div>
                )}
                {label.eventInfo.participationFee && (
                  <div className="detail-row">
                    <span className="detail-label">参加費:</span>
                    <span className="detail-value">{label.eventInfo.participationFee.toLocaleString()}円</span>
                  </div>
                )}
                {label.eventInfo.requirements && (
                  <div className="detail-row">
                    <span className="detail-label">持参物:</span>
                    <span className="detail-value">{label.eventInfo.requirements}</span>
                  </div>
                )}
                {label.organizationInfo.contactInfo && (
                  <div className="detail-row">
                    <span className="detail-label">連絡先:</span>
                    <span className="detail-value">{label.organizationInfo.contactInfo}</span>
                  </div>
                )}
              </div>

              {/* フッター */}
              <div className="footer">
                印刷日: {new Date(label.printDate).toLocaleDateString('ja-JP')}
              </div>
            </div>
          ))}
        </div>

        {/* プレビュー表示（画面表示用） */}
        <div className="mt-6 space-y-4 max-h-96 overflow-y-auto">
          <h3 className="font-medium text-sm text-gray-600">プレビュー（最初の3件）</h3>
          {labelsData.shippingLabels?.slice(0, 3).map((label, index) => (
            <div key={label.id} className="border rounded-lg p-4 bg-gray-50">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-medium">{label.recipientInfo.name} 様</h4>
                  <p className="text-sm text-gray-600">
                    {label.recipientInfo.postalCode && `〒${label.recipientInfo.postalCode} `}
                    {label.recipientInfo.address}
                  </p>
                </div>
                <Badge variant="outline">{index + 1}件目</Badge>
              </div>
              <div className="grid grid-cols-3 gap-4 text-xs">
                <div>
                  <p className="font-medium">イベント情報</p>
                  <p>{label.eventInfo.title}</p>
                  <p>{new Date(label.eventInfo.startDate).toLocaleDateString('ja-JP')}</p>
                  {label.eventInfo.participationFee && (
                    <p>参加費: {label.eventInfo.participationFee.toLocaleString()}円</p>
                  )}
                </div>
                <div>
                  <p className="font-medium">申込URL</p>
                  <p className="text-blue-600 break-all text-xs">
                    {label.registrationUrl.length > 30 
                      ? `${label.registrationUrl.substring(0, 30)}...` 
                      : label.registrationUrl
                    }
                  </p>
                </div>
                <div className="text-center">
                  <p className="font-medium mb-2">QRコード</p>
                  {qrCodes[label.id] ? (
                    <img 
                      src={qrCodes[label.id]} 
                      alt={`QR Code for ${label.recipientInfo.name}`}
                      className="w-16 h-16 mx-auto border"
                    />
                  ) : (
                    <div className="w-16 h-16 mx-auto border border-gray-300 bg-gray-100 flex items-center justify-center text-xs text-gray-500">
                      生成中...
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          {labelsData?.totalCount > 3 && (
            <p className="text-sm text-gray-500 text-center">
              他 {(labelsData?.totalCount || 0) - 3} 件...
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}