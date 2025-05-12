"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { MemoForm } from "@/components/memo-form";
import { MemoList } from "@/components/memo-list";
import { LeadForm } from "./LeadForm";

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
}

interface LeadActionsProps {
  leadId: string;
  lead?: Lead;
  onSuccess?: () => void;
}

export function LeadActions({ leadId, lead, onSuccess }: LeadActionsProps) {
  const [showMemoList, setShowMemoList] = useState(false);

  return (
    <div className="relative">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">メニューを開く</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-80">
          <DropdownMenuLabel>操作</DropdownMenuLabel>
          <DropdownMenuItem
            onClick={() => navigator.clipboard.writeText(leadId)}
          >
            IDをコピー
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setShowMemoList(true)}>
            メモを表示
          </DropdownMenuItem>
          <div className="p-2">
            <MemoForm leadId={leadId} onSuccess={() => {}} />
          </div>
          <DropdownMenuSeparator />
          <div className="p-2">
            <LeadForm
              lead={lead}
              onSuccess={onSuccess || (() => {})}
              type={
                lead?.type === "organization" ? "organization" : "individual"
              }
            />
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
      {showMemoList && (
        <div className="absolute right-0 mt-2 w-80 bg-white shadow-lg rounded-lg p-4 z-50">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold">メモ一覧</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowMemoList(false)}
            >
              ✕
            </Button>
          </div>
          <MemoList leadId={leadId} />
        </div>
      )}
    </div>
  );
}
