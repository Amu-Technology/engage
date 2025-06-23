'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PlusIcon, SearchIcon, FilterIcon } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

interface EventsHeaderProps {
  onSearch?: (query: string) => void;
  onFilter?: (filter: string) => void;
}

export function EventsHeader({ onSearch, onFilter }: EventsHeaderProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterValue, setFilterValue] = useState('all');

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    onSearch?.(query);
  };

  const handleFilterChange = (filter: string) => {
    setFilterValue(filter);
    onFilter?.(filter);
  };

  return (
    <div className="mb-8 space-y-6">
      {/* メインヘッダー */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">イベント管理</h1>
          <p className="text-gray-600 mt-1">
            イベントの作成・管理と参加者の状況確認ができます
          </p>
        </div>
        
        <Button asChild>
          <Link href="/dashboard/events/create">
            <PlusIcon className="h-4 w-4 mr-2" />
            新しいイベント
          </Link>
        </Button>
      </div>

      {/* 検索・フィルター */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* 検索バー */}
            <div className="relative flex-1">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="イベントタイトル・場所で検索..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* フィルター */}
            <div className="flex gap-2 sm:w-auto">
              <Select value={filterValue} onValueChange={handleFilterChange}>
                <SelectTrigger className="w-40">
                  <FilterIcon className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="フィルター" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全てのイベント</SelectItem>
                  <SelectItem value="upcoming">開催予定</SelectItem>
                  <SelectItem value="ongoing">参加受付中</SelectItem>
                  <SelectItem value="past">終了済み</SelectItem>
                  <SelectItem value="full">満員</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}