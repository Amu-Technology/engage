"use client";

import { useState } from "react";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import { Plus } from "lucide-react";
import { format } from "date-fns";
import {
  ColumnDef,
  useReactTable,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import PaymentForm from "./components/PaymentForm";
import { PaymentFilters } from "./components/PaymentFilters";
import type { Payment, Lead, User, PaymentType } from '@prisma/client';

export type PaymentWithDetails = Payment & {
  lead: Pick<Lead, 'id' | 'name'>;
  recordedBy: Pick<User, 'id' | 'name'>;
  paymentType: PaymentType | null;
};

export default function PaymentsPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<PaymentWithDetails | null>(null);
  
  // ★ 修正点: 初期値を 'all' に
  const [filters, setFilters] = useState({
    paymentTypeId: 'all', 
    startDate: '',
    endDate: ''
  });

  // ★ 修正点: クエリ構築ロジックをより安全に
  const buildQuery = () => {
    const params = new URLSearchParams();
    if (filters.paymentTypeId && filters.paymentTypeId !== 'all') {
      params.append('paymentTypeId', filters.paymentTypeId);
    }
    if (filters.startDate) {
      params.append('startDate', filters.startDate);
    }
    if (filters.endDate) {
      params.append('endDate', filters.endDate);
    }
    return params.toString();
  };

  const { data: payments, error, isLoading, mutate } = useSWR<PaymentWithDetails[]>(`/api/payments?${buildQuery()}`, fetcher);

  const handleAddNew = () => {
    setSelectedPayment(null);
    setIsFormOpen(true);
  };
  
  const columns: ColumnDef<PaymentWithDetails>[] = [
    { accessorKey: "paymentDate", header: "入金日", cell: ({ row }) => format(new Date(row.original.paymentDate), "yyyy/MM/dd") },
    { accessorKey: "lead.name", header: "リード名" },
    { accessorKey: "amount", header: "金額", cell: ({ row }) => `${row.original.amount.toLocaleString()}円` },
    { accessorKey: "paymentType.name", header: "入金タイプ", cell: ({ row }) => row.original.paymentType ? <Badge variant="outline">{row.original.paymentType.name}</Badge> : '-' },
    { accessorKey: "description", header: "メモ" },
    { accessorKey: "recordedBy.name", header: "記録者" },
  ];

  const table = useReactTable({
    data: payments || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="container mx-auto p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">入金履歴</h1>
        <Button onClick={handleAddNew}>
          <Plus className="mr-2 h-4 w-4" />
          新規入金
        </Button>
      </div>

      <PaymentForm
        isOpen={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSuccess={() => {
          setIsFormOpen(false);
          mutate();
        }}
        payment={selectedPayment}
      />
      
      <PaymentFilters onFilterChange={setFilters} />

      <Card>
        <CardHeader>
          <CardTitle>履歴一覧</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map(headerGroup => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <TableHead key={header.id}>
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {isLoading && <TableRow><TableCell colSpan={columns.length} className="h-24 text-center">読み込み中...</TableCell></TableRow>}
              {error && <TableRow><TableCell colSpan={columns.length} className="h-24 text-center text-red-500">データ取得エラー</TableCell></TableRow>}
              {!isLoading && table.getRowModel().rows.length === 0 && (
                <TableRow><TableCell colSpan={columns.length} className="h-24 text-center">データがありません。</TableCell></TableRow>
              )}
              {!isLoading && table.getRowModel().rows.map(row => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map(cell => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}