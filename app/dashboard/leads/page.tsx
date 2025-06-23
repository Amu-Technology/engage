"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useUser } from "@/app/providers/UserProvider";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowUpDown, ChevronDown } from "lucide-react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,

  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { BulkActions } from "./components/BulkActions";
import { CsvImport } from "./components/CsvImport";
import { SearchBar } from "./components/SearchBar";
import { LeadForm } from "./components/LeadForm";
import { LeadActions } from "./components/LeadActions";
import { MultiSelect } from "@/components/ui/multi-select";
import { DataTablePagination } from "./components/DataTablePagination";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LeadsTable } from "./components/LeadsTable";
import { CsvExport } from "./components/CsvExport";

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

interface Group {
  id: string;
  name: string;
}

export default function LeadsPage() {
  const { user, isLoading: isUserLoading } = useUser();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"individual" | "organization">(
    "individual"
  );
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [searchParams, setSearchParams] = useState({
    name: "",
    nameReading: "",
    address: "",
    district: "",
    phone: "",
  });
  const [filteredTotal, setFilteredTotal] = useState(0);
  const [leadsStatuses, setLeadsStatuses] = useState<
    { id: string; name: string; color: string | null }[]
  >([]);

  const fetchLeads = async () => {
    try {
      const response = await fetch(`/api/leads?type=${activeTab}`);
      if (!response.ok) {
        throw new Error("リード一覧の取得に失敗しました");
      }
      const data = await response.json();
      setLeads(data);
    } catch (error) {
      console.error("エラー:", error);
      toast.error("リード一覧の取得に失敗しました");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isUserLoading) {
      fetchLeads();
    }
  }, [isUserLoading, activeTab]);

  const fetchGroups = async () => {
    try {
      const response = await fetch("/api/groups");
      if (!response.ok) {
        if (response.status === 404) {
          setGroups([]);
          return;
        }
        throw new Error("グループ一覧の取得に失敗しました");
      }
      const data = await response.json();
      setGroups(data);
    } catch (error) {
      console.error("エラー:", error);
      setGroups([]);
    }
  };

  const fetchLeadsStatuses = async () => {
    try {
      const response = await fetch("/api/leads-status");
      if (!response.ok) throw new Error("ステータスの取得に失敗しました");
      const data = await response.json();
      setLeadsStatuses(data);
    } catch (err) {
      console.error("エラー:", err);
      toast.error("ステータスの取得に失敗しました");
    }
  };

  useEffect(() => {
    fetchGroups();
    fetchLeadsStatuses();
  }, []);

  const handleGroupChange = async (leadId: string | string[], groupIds: string[]) => {
    try {
      // 単一のリードの場合
      if (typeof leadId === "string") {
        const response = await fetch(`/api/leads/${leadId}/groups`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ groupIds }),
        });

        if (!response.ok) throw new Error("グループの更新に失敗しました");

        const updatedLead = await response.json();
        setLeads((prev) =>
          prev.map((lead) => (lead.id === leadId ? updatedLead : lead))
        );
      }
      // 複数のリードの場合
      else if (Array.isArray(leadId)) {
        const response = await fetch(`/api/groups/${groupIds[0]}/leads`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ leadIds: leadId }),
        });

        if (!response.ok) throw new Error("グループの更新に失敗しました");

        // 個別にリードを更新するのではなく、現在のリードリストを更新
        setLeads((prev) =>
          prev.map((lead) => {
            if (leadId.includes(lead.id)) {
              return {
                ...lead,
                groups: groupIds.map(groupId => ({ id: `${lead.id}-${groupId}`, groupId }))
              };
            }
            return lead;
          })
        );
      }

      toast.success("グループを更新しました");
    } catch (err) {
      console.error("エラー:", err);
      toast.error("グループの更新に失敗しました");
    }
  };

  const handleStatusChange = async (leadId: string, statusId: string) => {
    try {
      const response = await fetch(`/api/leads/${leadId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ statusId }),
      });

      if (!response.ok) throw new Error("ステータスの更新に失敗しました");

      const updatedLead = await response.json();
      setLeads((prev) =>
        prev.map((lead) => (lead.id === leadId ? updatedLead : lead))
      );
      toast.success("ステータスを更新しました");
    } catch (err) {
      console.error("エラー:", err);
      toast.error("ステータスの更新に失敗しました");
    }
  };

  const handlePaymentStatusChange = async (leadId: string, isPaid: boolean) => {
    try {
      const response = await fetch(`/api/leads/${leadId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPaid }),
      });

      if (!response.ok) throw new Error("入金状況の更新に失敗しました");

      const updatedLead = await response.json();
      setLeads((prev) =>
        prev.map((lead) => (lead.id === leadId ? updatedLead : lead))
      );
    } catch (err) {
      console.error("エラー:", err);
      toast.error("入金状況の更新に失敗しました");
    }
  };

  const handleSearch = (params: {
    name: string;
    nameReading: string;
    address: string;
    district: string;
    phone: string;
  }) => {
    setSearchParams(params);

    // 各カラムにフィルターを設定
    const filters: ColumnFiltersState = [];

    if (params.name) {
      filters.push({
        id: "name",
        value: params.name,
      });
    }
    if (params.nameReading) {
      filters.push({
        id: "nameReading",
        value: params.nameReading,
      });
    }
    if (params.address) {
      filters.push({
        id: "address",
        value: params.address,
      });
    }
    if (params.district) {
      filters.push({
        id: "district",
        value: params.district,
      });
    }
    if (params.phone) {
      filters.push({
        id: "phone",
        value: params.phone,
      });
    }

    setColumnFilters(filters);
  };

  const columns: ColumnDef<Lead>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
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
    },
    {
      accessorKey: "name",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            名前
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const lead = row.original;
        return (
          <Button
            variant="link"
            className="p-0 h-auto font-normal"
            onClick={() =>
              (window.location.href = `/dashboard/leads/${lead.id}`)
            }
          >
            {lead.name}
          </Button>
        );
      },
      filterFn: (row, id, value) => {
        const val = row.getValue(id);
        if (!val) return false;
        return val.toString().toLowerCase().includes(value.toLowerCase());
      },
    },
    {
      accessorKey: "nameReading",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            読み仮名
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      filterFn: (row, id, value) => {
        const val = row.getValue(id);
        if (!val) return false;
        return val.toString().toLowerCase().includes(value.toLowerCase());
      },
    },
    {
      accessorKey: "address",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            住所
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      filterFn: (row, id, value) => {
        const val = row.getValue(id);
        if (!val) return false;
        return val.toString().toLowerCase().includes(value.toLowerCase());
      },
    },
    {
      accessorKey: "district",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            地区
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      filterFn: (row, id, value) => {
        const val = row.getValue(id);
        if (!val) return false;
        return val.toString().toLowerCase().includes(value.toLowerCase());
      },
    },
    {
      accessorKey: "phone",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            電話番号
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      filterFn: (row, id, value) => {
        const phone = row.getValue("homePhone")?.toString() || "";
        const mobilePhone = row.getValue("mobilePhone")?.toString() || "";
        return phone.includes(value) || mobilePhone.includes(value);
      },
    },
    {
      accessorKey: "status",
      header: "ステータス",
      cell: ({ row }) => {
        const lead = row.original;
        return (
          <Select
            value={lead.statusId || ""}
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
        );
      },
    },
    {
      accessorKey: "homePhone",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            自宅電話
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
    },
    {
      accessorKey: "mobilePhone",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            携帯電話
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
    },
    {
      accessorKey: "company",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            会社
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
    },
    {
      accessorKey: "position",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            役職
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
    },
    {
      accessorKey: "postalCode",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            郵便番号
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
    },
    {
      accessorKey: "email",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            メールアドレス
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
    },
    {
      accessorKey: "referrer",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            紹介者
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
    },
    {
      accessorKey: "evaluation",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            評価
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
    },
    {
      accessorKey: "isPaid",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            有料会員
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const isPaid = row.getValue("isPaid") as boolean;
        return <div>{isPaid ? "はい" : "いいえ"}</div>;
      },
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            登録日
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const date = row.getValue("createdAt") as Date;
        return (
          <div>{date ? new Date(date).toLocaleDateString("ja-JP") : "-"}</div>
        );
      },
    },
    {
      accessorKey: "groups",
      header: "グループ",
      cell: ({ row }) => {
        const lead = row.original;
        return (
          <MultiSelect
            value={lead.groups?.map((g) => g.groupId) || []}
            onChange={(value) => handleGroupChange(lead.id, value)}
            options={groups.map((group) => ({
              value: group.id,
              label: group.name,
            }))}
            placeholder="グループを選択"
          />
        );
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const lead = row.original;
        return (
          <LeadActions leadId={lead.id} lead={lead} onSuccess={fetchLeads} />
        );
      },
    },
  ];

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
    filterFns: {
      customFilter: (row, columnId, filterValue) => {
        const value = row.getValue(columnId);
        if (!value) return false;
        return String(value)
          .toLowerCase()
          .includes(String(filterValue).toLowerCase());
      },
    },
  });

  const filteredRows = table.getFilteredRowModel().rows;
  const filteredRowsLength = filteredRows.length;

  useEffect(() => {
    // フィルター適用後の総数を更新
    setFilteredTotal(filteredRowsLength);
  }, [filteredRowsLength]);

  // 組織リードへのアクセス権チェック
  const canAccessOrganization =
    user?.role === "admin" || user?.role === "manager";

  if (isUserLoading || isLoading) {
    return <div className="p-4">読み込み中...</div>;
  }

  return (
    <div className="space-y-4 px-4 py-2">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">リード一覧</h1>
        <div className="flex items-center space-x-2">
          <LeadForm onSuccess={fetchLeads} type={activeTab} />
          <CsvImport onSuccess={fetchLeads} type={activeTab} />
          <CsvExport selectedLeads={table.getSelectedRowModel().rows.map(row => row.original)} />
        </div>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(value) =>
          setActiveTab(value as "individual" | "organization")
        }
      >
        <TabsList>
          <TabsTrigger value="individual">個人リード</TabsTrigger>
          {canAccessOrganization && (
            <TabsTrigger value="organization">組織リード</TabsTrigger>
          )}
        </TabsList>
        <TabsContent value="individual">
          <BulkActions
            selectedRows={table.getSelectedRowModel().rows}
            groups={groups}
            leadsStatuses={leadsStatuses}
            onGroupChange={handleGroupChange}
            onStatusChange={handleStatusChange}
            onPaymentStatusChange={handlePaymentStatusChange}
            onLeadsUpdate={(updatedLeads: Lead[]) => {
              setLeads(updatedLeads as Lead[]);
              table.setRowSelection({});
            }}
          />
          <div className="flex flex-col space-y-4">
            <div className="flex justify-between items-center">
              <SearchBar onSearch={handleSearch} />
              {Object.entries(searchParams).some(([, value]) => value) && (
                <div className="text-sm text-muted-foreground">
                  検索条件:{" "}
                  {Object.entries(searchParams)
                    .filter(([, value]) => value)
                    .map(([key, value]) => `${key}: ${value}`)
                    .join(", ")}
                </div>
              )}
            </div>

            <div className="flex items-center space-x-2">
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
                      );
                    })}
                </DropdownMenuContent>
              </DropdownMenu>
              <Select
                value={String(pagination.pageSize)}
                onValueChange={(value) =>
                  setPagination({ ...pagination, pageSize: Number(value) })
                }
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
          </div>

          <LeadsTable
            table={table}
            leadsStatuses={leadsStatuses}
            groups={groups}
            onStatusChange={handleStatusChange}
            onGroupChange={handleGroupChange}
            onPaymentStatusChange={handlePaymentStatusChange}
          />

          <div className="flex items-center justify-end space-x-2">
            <DataTablePagination
              table={table}
              totalItems={filteredTotal || leads.length}
            />
          </div>
        </TabsContent>

        {canAccessOrganization && (
          <TabsContent value="organization">
            <BulkActions
              selectedRows={table.getSelectedRowModel().rows}
              groups={groups}
              leadsStatuses={leadsStatuses}
              onGroupChange={handleGroupChange}
              onStatusChange={handleStatusChange}
              onPaymentStatusChange={handlePaymentStatusChange}
              onLeadsUpdate={(updatedLeads: Lead[]) => {
                setLeads(updatedLeads as Lead[]);
                table.setRowSelection({});
              }}
            />

            <div className="flex flex-col space-y-4">
              <div className="flex justify-between items-center">
                <SearchBar onSearch={handleSearch} />
                {Object.entries(searchParams).some(([, value]) => value) && (
                  <div className="text-sm text-muted-foreground">
                    検索条件:{" "}
                    {Object.entries(searchParams)
                      .filter(([, value]) => value)
                      .map(([key, value]) => `${key}: ${value}`)
                      .join(", ")}
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-2">
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
                        );
                      })}
                  </DropdownMenuContent>
                </DropdownMenu>
                <Select
                  value={String(pagination.pageSize)}
                  onValueChange={(value) =>
                    setPagination({ ...pagination, pageSize: Number(value) })
                  }
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
            </div>

            <LeadsTable
              table={table}
              leadsStatuses={leadsStatuses}
              groups={groups}
              onStatusChange={handleStatusChange}
              onGroupChange={handleGroupChange}
              onPaymentStatusChange={handlePaymentStatusChange}
            />

            <div className="flex items-center justify-end space-x-2">
              <DataTablePagination
                table={table}
                totalItems={filteredTotal || leads.length}
              />
            </div>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
