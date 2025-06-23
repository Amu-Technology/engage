import { Suspense } from 'react';
import { EventManagementDashboard } from './event-management-dashboard';
import { ParticipantsOverview } from './participants-overview';
import { ParticipantsList } from './participants-list';
import { EventRegistrationForm } from './event-registration-form';
import { ShippingLabels } from './shipping-labels';

interface EventManagementPageProps {
  params: Promise<{ id: string }>;
}

export default async function EventManagementPage({ params }: EventManagementPageProps) {
  const { id } = await params;
  
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* ページヘッダー */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            イベント参加管理
          </h1>
          <p className="text-muted-foreground">
            参加者の状況確認・管理と申込データのエクスポートができます
          </p>
        </div>

        {/* メインダッシュボード */}
        <div className="space-y-8">
          {/* イベント概要・統計 */}
          <Suspense fallback={<div className="animate-pulse bg-muted h-48 rounded-lg"></div>}>
            <EventManagementDashboard eventId={id} />
          </Suspense>

          {/* 参加状況サマリー */}
          <Suspense fallback={<div className="animate-pulse bg-muted h-32 rounded-lg"></div>}>
            <ParticipantsOverview eventId={id} />
          </Suspense>

          {/* 送り状印刷 */}
          <Suspense fallback={<div className="animate-pulse bg-muted h-48 rounded-lg"></div>}>
            <ShippingLabels eventId={id} />
          </Suspense>

          {/* 参加申込フォームと参加者一覧を横並びで表示 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8" id="registration">
            {/* 参加申込フォーム */}
            <div>
              <Suspense fallback={<div className="animate-pulse bg-muted h-96 rounded-lg"></div>}>
                <EventRegistrationForm eventId={id} />
              </Suspense>
            </div>

            {/* 参加者一覧・管理 */}
            <div>
              <Suspense fallback={<div className="animate-pulse bg-muted h-96 rounded-lg"></div>}>
                <ParticipantsList eventId={id} />
              </Suspense>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}