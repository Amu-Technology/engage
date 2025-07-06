'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, MapPinIcon, UsersIcon, BuildingIcon } from 'lucide-react';
import useSWR from 'swr';

interface EventDetailsProps {
  eventId: string;
}

interface Event {
  id: string;
  title: string;
  description?: string;
  date: string;
  location?: string;
  maxParticipants?: number;
  group: {
    name: string;
  };
  _count: {
    participations: number;
  };
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function EventDetails({ eventId }: EventDetailsProps) {
  const { data: event, error, isLoading } = useSWR<Event>(
    `/api/events/${eventId}`,
    fetcher
  );

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="animate-pulse space-y-2">
            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-4/6"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !event) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-red-600">イベント情報を取得できませんでした</p>
        </CardContent>
      </Card>
    );
  }

  const eventDate = new Date(event.date);
  const isEventPast = eventDate < new Date();
  const participantCount = event._count.participations;
  const isEventFull = event.maxParticipants && participantCount >= event.maxParticipants;

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <CardTitle className="text-3xl">{event.title}</CardTitle>
              {isEventPast && (
                <Badge variant="destructive">終了済み</Badge>
              )}
              {isEventFull && !isEventPast && (
                <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                  満員
                </Badge>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              <BuildingIcon className="h-4 w-4 text-gray-500" />
              <Badge variant="outline" className="text-sm">
                {event.group.name}
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* イベント概要 */}
        {event.description && (
          <div>
            <h3 className="font-semibold text-lg text-gray-900 mb-3">概要</h3>
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
              {event.description}
            </p>
          </div>
        )}

        {/* イベント詳細情報 */}
        <div>
          <h3 className="font-semibold text-lg text-gray-900 mb-4">詳細情報</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 日時 */}
            <div className="flex items-start space-x-4 p-4 bg-blue-50 rounded-lg">
              <div className="p-2 bg-blue-100 rounded-full">
                <CalendarIcon className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h4 className="font-medium text-blue-900 mb-1">開催日時</h4>
                <p className="text-sm text-blue-800">
                  {eventDate.toLocaleDateString('ja-JP', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    weekday: 'long',
                  })}
                </p>
                <p className="text-sm text-blue-700">
                  {eventDate.toLocaleTimeString('ja-JP', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })} 開始
                </p>
              </div>
            </div>

            {/* 場所 */}
            {event.location && (
              <div className="flex items-start space-x-4 p-4 bg-green-50 rounded-lg">
                <div className="p-2 bg-green-100 rounded-full">
                  <MapPinIcon className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h4 className="font-medium text-green-900 mb-1">開催場所</h4>
                  <p className="text-sm text-green-800">{event.location}</p>
                </div>
              </div>
            )}

            {/* 参加者数 */}
            <div className="flex items-start space-x-4 p-4 bg-purple-50 rounded-lg">
              <div className="p-2 bg-purple-100 rounded-full">
                <UsersIcon className="h-5 w-5 text-purple-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-purple-900 mb-1">参加者数</h4>
                <div className="flex items-center space-x-2">
                  <p className="text-sm text-purple-800 font-medium">
                    {participantCount}
                    {event.maxParticipants && ` / ${event.maxParticipants}`}名
                  </p>
                  {event.maxParticipants && (
                    <div className="flex-1 max-w-[100px]">
                      <div className="w-full bg-purple-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all ${
                            participantCount >= event.maxParticipants 
                              ? 'bg-red-500' 
                              : participantCount >= event.maxParticipants * 0.8 
                              ? 'bg-orange-500' 
                              : 'bg-purple-600'
                          }`}
                          style={{ 
                            width: `${Math.min((participantCount / event.maxParticipants) * 100, 100)}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>
                
                {event.maxParticipants && participantCount >= event.maxParticipants && (
                  <p className="text-xs text-orange-700 mt-1">
                    ⚠️ 定員に達しています
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 特記事項 */}
        {(isEventPast || isEventFull) && (
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">ご注意</h4>
            <ul className="text-sm text-gray-700 space-y-1">
              {isEventPast && (
                <li>• このイベントは既に終了しています</li>
              )}
              {isEventFull && !isEventPast && (
                <li>• 現在、定員に達しています。キャンセル待ちでの申込は可能です</li>
              )}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}