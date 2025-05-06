import { Table } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface DataTablePaginationProps<TData> {
  table: Table<TData>
  totalItems: number
}

export function DataTablePagination<TData>({
  table,
  totalItems,
}: DataTablePaginationProps<TData>) {
  return (
    <div className="flex items-center justify-end space-x-2">
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.setPageIndex(0)}
          disabled={!table.getCanPreviousPage()}
        >
          最初
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          前へ
        </Button>
        <div className="flex items-center gap-1">
          <span className="text-sm">ページ</span>
          <Input
            type="number"
            min={1}
            max={table.getPageCount()}
            value={table.getState().pagination.pageIndex + 1}
            onChange={(e) => {
              const page = e.target.value ? Number(e.target.value) - 1 : 0
              table.setPageIndex(page)
            }}
            className="w-16 h-8"
          />
          <span className="text-sm">/ {table.getPageCount()}</span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          次へ
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.setPageIndex(table.getPageCount() - 1)}
          disabled={!table.getCanNextPage()}
        >
          最後
        </Button>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">
          全{totalItems}件中 {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}-
          {Math.min(
            (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
            totalItems
          )}件
        </span>
      </div>
    </div>
  )
} 