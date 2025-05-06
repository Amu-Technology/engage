'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDown } from 'lucide-react';

interface ColumnSelectorProps {
  columns: {
    id: string;
    title: string;
    isVisible: boolean;
  }[];
  onColumnVisibilityChange: (columnId: string, isVisible: boolean) => void;
}

export function ColumnSelector({ columns, onColumnVisibilityChange }: ColumnSelectorProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="ml-auto">
          表示項目 <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {columns.map((column) => {
          return (
            <DropdownMenuCheckboxItem
              key={column.id}
              className="capitalize"
              checked={column.isVisible}
              onCheckedChange={(value) => onColumnVisibilityChange(column.id, value)}
            >
              {column.title}
            </DropdownMenuCheckboxItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 