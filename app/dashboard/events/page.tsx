import { Suspense } from 'react';
import { EventsList } from './events-list';
import { EventsHeader } from './events-header';

export default function EventsPage() {
  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* ページヘッダー */}
        <Suspense fallback={<div className="animate-pulse bg-gray-200 h-16 rounded-lg mb-8"></div>}>
          <EventsHeader />
        </Suspense>

        {/* イベント一覧 */}
        <Suspense fallback={
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse bg-gray-200 h-64 rounded-lg"></div>
            ))}
          </div>
        }>
          <EventsList />
        </Suspense>
      </div>
    </div>
  );
}