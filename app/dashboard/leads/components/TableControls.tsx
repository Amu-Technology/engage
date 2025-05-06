'use client';

import { Input } from '@/components/ui/input';
import { ColumnSelector } from './ColumnSelector';
import { Search } from 'lucide-react';

interface TableControlsProps {
  globalFilter: string;
  onGlobalFilterChange: (value: string) => void;
  columns: {
    id: string;
    title: string;
    isVisible: boolean;
  }[];
  onColumnVisibilityChange: (columnId: string, isVisible: boolean) => void;
}

export function TableControls({
  globalFilter,
  onGlobalFilterChange,
  columns,
  onColumnVisibilityChange,
}: TableControlsProps) {
  return (
    <div className="flex items-center space-x-2">
      <div className="relative flex-1">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
        <Input
          placeholder="検索..."
          value={globalFilter}
          onChange={(e) => onGlobalFilterChange(e.target.value)}
          className="pl-8"
        />
      </div>
      <ColumnSelector
        columns={columns}
        onColumnVisibilityChange={onColumnVisibilityChange}
      />
    </div>
  );
} 