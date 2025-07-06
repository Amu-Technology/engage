import { Suspense } from 'react';
import { EventDetails } from './event-details';
import { EventActions } from './event-actions';
import { QuickParticipationOverview } from './quick-participation-overview';
import { ParticipantsSection } from './participants-section';
import { AccessTokenGenerator } from './manage/access-token-generator';

interface EventPageProps {
  params: Promise<{ id: string }>
}

export default async function EventPage({ params }: EventPageProps) {
  const { id } = await params;
  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* イベント詳細 */}
        <div className="space-y-6">
          <Suspense fallback={<div className="animate-pulse bg-gray-200 h-64 rounded-lg"></div>}>
            <EventDetails eventId={id} />
          </Suspense>

          {/* 参加状況クイックビュー */}
          <Suspense fallback={<div className="animate-pulse bg-gray-200 h-32 rounded-lg"></div>}>
            <QuickParticipationOverview eventId={id} />
          </Suspense>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 左側：参加者管理 */}
            <div className="lg:col-span-2 space-y-6">
              {/* 参加者一覧セクション */}
              <Suspense fallback={<div className="animate-pulse bg-gray-200 h-96 rounded-lg"></div>}>
                <ParticipantsSection eventId={id} />
              </Suspense>
            </div>

            {/* 右側：管理機能 */}
            <div className="space-y-6">
              {/* 外部申込URL生成 */}
              <Suspense fallback={<div className="animate-pulse bg-gray-200 h-64 rounded-lg"></div>}>
                <AccessTokenGenerator eventId={id} />
              </Suspense>

              {/* アクション */}
              <Suspense fallback={<div className="animate-pulse bg-gray-200 h-16 rounded-lg"></div>}>
                <EventActions eventId={id} />
              </Suspense>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}