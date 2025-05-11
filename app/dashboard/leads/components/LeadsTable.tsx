"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { flexRender, Table as TableInstance } from "@tanstack/react-table";
interface Lead {
  id: string;
  name: string;
  nameReading: string | null;
  nickname: string | null;
  type: string;
  district: string | null;
  homePhone: string | null;
  mobilePhone: string | null;
  company: string | null;
  position: string | null;
  postalCode: string | null;
  address: string | null;
  email: string | null;
  referrer: string | null;
  evaluation: number | null;
  status: string;
  isPaid: boolean;
  groupId: string | null;
  group: {
    id: string;
    name: string;
  } | null;
  statusId: string | null;
  leadsStatus: {
    id: string;
    name: string;
    color: string | null;
  } | null;
  groups?: {
    id: string;
    groupId: string;
  }[];
}

interface LeadsTableProps {
  table: TableInstance<Lead>;
  leadsStatuses: { id: string; name: string; color: string | null }[];
  groups: { id: string; name: string }[];
  onStatusChange: (leadId: string, statusId: string) => void;
  onGroupChange: (leadId: string, groupIds: string[]) => void;
}

export function LeadsTable({ table }: LeadsTableProps) {
  return (
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
                data-state={row.getIsSelected() && "selected"}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={table.getAllColumns().length}
                className="h-24 text-center"
              >
                リードが見つかりません
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
