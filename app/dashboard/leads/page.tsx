'use client'

import { useState, useEffect } from 'react'
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { ArrowUpDown, ChevronDown} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,

  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { toast } from 'sonner'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { LeadForm } from './components/LeadForm'
import { LeadActions } from './components/LeadActions'
import { MultiSelect } from "@/components/ui/multi-select"
import { BulkActions } from './components/BulkActions'
import { CsvImport } from './components/CsvImport'

interface Lead {
  id: string
  name: string
  nameReading: string | null
  nickname: string | null
  type: string
  district: string | null
  homePhone: string | null
  mobilePhone: string | null
  company: string | null
  position: string | null
  postalCode: string | null
  address: string | null
  email: string | null
  referrer: string | null
  evaluation: number | null
  status: string
  isPaid: boolean
  groupId: string | null
  group: {
    id: string
    name: string
  } | null
  statusId: string | null
  leadsStatus: {
    id: string
    name: string
    color: string | null
  } | null
  groups?: {
    id: string
    groupId: string
  }[]
}

interface Group {
  id: string
  name: string
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [groups, setGroups] = useState<Group[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  })
  const [globalFilter, setGlobalFilter] = useState('')
  const [leadsStatuses, setLeadsStatuses] = useState<{ id: string; name: string; color: string | null }[]>([])

  const fetchLeads = async () => {
    try {
      const response = await fetch('/api/leads')
      if (!response.ok) {
        throw new Error('リード一覧の取得に失敗しました')
      }
      const data = await response.json()
      setLeads(data)
    } catch (error) {
      console.error('エラー:', error)
      toast.error('リード一覧の取得に失敗しました')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchGroups = async () => {
    try {
      const response = await fetch('/api/groups')
      if (!response.ok) {
        if (response.status === 404) {
          setGroups([])
          return
        }
        throw new Error('グループ一覧の取得に失敗しました')
      }
      const data = await response.json()
      setGroups(data)
    } catch (error) {
      console.error('エラー:', error)
      setGroups([])
    }
  }

  const fetchLeadsStatuses = async () => {
    try {
      const response = await fetch('/api/leads-status')
      if (!response.ok) throw new Error('ステータスの取得に失敗しました')
      const data = await response.json()
      setLeadsStatuses(data)
    } catch (err) {
      console.error('エラー:', err)
      toast.error('ステータスの取得に失敗しました')
    }
  }

  useEffect(() => {
    fetchLeads()
    fetchGroups()
    fetchLeadsStatuses()
  }, [])

  const handleGroupChange = async (leadId: string, groupIds: string[]) => {
    try {
      const response = await fetch(`/api/leads/${leadId}/groups`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ groupIds }),
      })

      if (!response.ok) throw new Error('グループの更新に失敗しました')

      const updatedLead = await response.json()
      setLeads((prev) =>
        prev.map((lead) => (lead.id === leadId ? updatedLead : lead))
      )
      toast.success('グループを更新しました')
    } catch (err) {
      console.error('エラー:', err)
      toast.error('グループの更新に失敗しました')
    }
  }

  const handleStatusChange = async (leadId: string, statusId: string) => {
    try {
      const response = await fetch(`/api/leads/${leadId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ statusId }),
      })

      if (!response.ok) throw new Error('ステータスの更新に失敗しました')

      const updatedLead = await response.json()
      setLeads((prev) =>
        prev.map((lead) => (lead.id === leadId ? updatedLead : lead))
      )
      toast.success('ステータスを更新しました')
    } catch (err) {
      console.error('エラー:', err)
      toast.error('ステータスの更新に失敗しました')
    }
  }

  const handlePaymentStatusChange = async (leadId: string, isPaid: boolean) => {
    try {
      const response = await fetch(`/api/leads/${leadId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPaid }),
      })

      if (!response.ok) throw new Error('入金状況の更新に失敗しました')

      const updatedLead = await response.json()
      setLeads((prev) =>
        prev.map((lead) => (lead.id === leadId ? updatedLead : lead))
      )
    } catch (err) {
      console.error('エラー:', err)
      toast.error('入金状況の更新に失敗しました')
    }
  }

  const columns: ColumnDef<Lead>[] = [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && 'indeterminate')
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="すべて選択"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="行を選択"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: 'name',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            名前
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const lead = row.original
        return (
          <Button
            variant="link"
            className="p-0 h-auto font-normal"
            onClick={() => window.location.href = `/dashboard/leads/${lead.id}`}
          >
            {lead.name}
          </Button>
        )
      },
    },
    {
      accessorKey: 'nameReading',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            読み仮名
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
    },
    {
      accessorKey: 'email',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            メールアドレス
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
    },
    {
      accessorKey: 'phone',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            電話番号
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
    },
    {
      accessorKey: 'status',
      header: 'ステータス',
      cell: ({ row }) => {
        const lead = row.original
        return (
          <Select
            value={lead.statusId || ''}
            onValueChange={(value) => handleStatusChange(lead.id, value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="ステータスを選択" />
            </SelectTrigger>
            <SelectContent>
              {leadsStatuses.map((status) => (
                <SelectItem key={status.id} value={status.id}>
                  <div className="flex items-center gap-2">
                    {status.color && (
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: status.color }}
                      />
                    )}
                    <span>{status.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )
      },
    },
    {
      accessorKey: 'homePhone',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            自宅電話
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
    },
    {
      accessorKey: 'mobilePhone',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            携帯電話
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
    },
    {
      accessorKey: 'company',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            会社
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
    },
    {
      accessorKey: 'position',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            役職
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
    },
    {
      accessorKey: 'postalCode',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            郵便番号
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
    },
    {
      accessorKey: 'address',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            住所
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
    },
    {
      accessorKey: 'referrer',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            紹介者
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
    },
    {
      accessorKey: 'evaluation',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            評価
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
    },
    {
      accessorKey: 'isPaid',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            有料会員
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const isPaid = row.getValue('isPaid') as boolean
        return <div>{isPaid ? 'はい' : 'いいえ'}</div>
      },
    },
    {
      accessorKey: 'createdAt',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            登録日
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const date = row.getValue('createdAt') as Date
        return <div>{date ? new Date(date).toLocaleDateString('ja-JP') : '-'}</div>
      },
    },
    {
      accessorKey: 'groups',
      header: 'グループ',
      cell: ({ row }) => {
        const lead = row.original
        return (
          <MultiSelect
            value={lead.groups?.map(g => g.groupId) || []}
            onChange={(value) => handleGroupChange(lead.id, value)}
            options={groups.map(group => ({
              value: group.id,
              label: group.name
            }))}
            placeholder="グループを選択"
          />
        )
      },
    },
    {
      id: 'actions',
      enableHiding: false,
      cell: ({ row }) => {
        const lead = row.original
        return <LeadActions leadId={lead.id} lead={lead} onSuccess={fetchLeads} />
      },
    },
  ]

  const table = useReactTable({
    data: leads,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination,
    },
  })

  if (isLoading) {
    return <div className="p-4">読み込み中...</div>
  }

  return (
    <div className="space-y-4 px-4 py-2">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">リード一覧</h1>
        <div className="flex items-center space-x-2">
          <LeadForm onSuccess={fetchLeads} />
          <CsvImport onSuccess={fetchLeads} />
        </div>
    

      </div>

      <BulkActions
        selectedRows={table.getSelectedRowModel().rows}
        groups={groups}
        leadsStatuses={leadsStatuses}
        onGroupChange={handleGroupChange}
        onStatusChange={handleStatusChange}
        onPaymentStatusChange={handlePaymentStatusChange}
      />

      <div className="flex items-center space-x-2">
        <Input
          placeholder="検索..."
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="max-w-sm"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              表示項目 <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                )
              })}
          </DropdownMenuContent>
        </DropdownMenu>
        <Select
          value={String(pagination.pageSize)}
          onValueChange={(value) => setPagination({ ...pagination, pageSize: Number(value) })}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="表示件数" />
          </SelectTrigger>
          <SelectContent>
            {[10, 50, 100, 200, 500].map((size) => (
              <SelectItem key={size} value={String(size)}>
                {size}件表示
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  リードが見つかりません
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          前へ
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          次へ
        </Button>
      </div>
      
    </div>
  )
} 