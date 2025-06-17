"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import useSWR from "swr";
import { toast } from "sonner";
import { fetcher } from "@/lib/fetcher";
import { Check, Search } from "lucide-react";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Command, CommandInput, CommandEmpty, CommandGroup, CommandItem, CommandList } from "@/components/ui/command";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Lead, PaymentType, Payment } from '@prisma/client';

const formSchema = z.object({
  leadId: z.string().min(1, "リードは必須です。"),
  amount: z.coerce.number({ invalid_type_error: "数値を入力してください。" }).int().min(1, "金額は1以上で入力してください。"),
  paymentDate: z.string().min(1, "入金日は必須です。"),
  paymentTypeId: z.string().optional(),
  description: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface PaymentFormProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  payment: Payment | null;
}

function useDebounce(value: string, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => { setDebouncedValue(value); }, delay);
    return () => { clearTimeout(handler); };
  }, [value, delay]);
  return debouncedValue;
}

export default function PaymentForm({
  isOpen,
  onOpenChange,
  onSuccess,
  payment,
}: PaymentFormProps) {
  const [isLeadSelectorOpen, setIsLeadSelectorOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLeadName, setSelectedLeadName] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const { data: searchedLeads, isLoading: isLeadsLoading } = useSWR<Lead[]>(
    debouncedSearchQuery ? `/api/leads/search?q=${encodeURIComponent(debouncedSearchQuery)}` : null,
    fetcher
  );
  
  const { data: paymentTypes } = useSWR<PaymentType[]>("/api/payment-types", fetcher);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
        leadId: '',
        amount: 0,
        paymentDate: '',
        paymentTypeId: '',
        description: ''
    }
  });

  // 編集モードの場合に初期値を設定
  useEffect(() => {
    if (payment) {
        form.reset({
            leadId: payment.leadId,
            amount: payment.amount,
            paymentDate: new Date(payment.paymentDate).toISOString().split('T')[0], // YYYY-MM-DD形式
            paymentTypeId: payment.paymentTypeId || '',
            description: payment.description || ''
        });
        // TODO: 選択されたリード名もAPIから取得してセットする必要がある
    } else {
        form.reset();
    }
  }, [payment, form]);

  const onSubmit = async (data: FormValues) => {
    try {
      const submissionData = {
        ...data,
        paymentTypeId: data.paymentTypeId === "" ? null : data.paymentTypeId
      };
      
      const response = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submissionData),
      });
      if(!response.ok) throw new Error("入金の作成に失敗しました。");
      toast.success("入金を記録しました。");
      onSuccess();
      form.reset();
      setSelectedLeadName("");
    } catch(err) {
      toast.error(err instanceof Error ? err.message : "エラーが発生しました。");
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{payment ? "入金の編集" : "新規入金"}</DialogTitle>
            <DialogDescription>
              新しい入金情報を入力してください。リードと金額、入金日は必須です。
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="leadId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>リード</FormLabel>
                    <div className="flex items-center gap-2">
                      <Input
                        {...field}
                        value={selectedLeadName || (payment ? 'リード名取得中...' : '')}
                        readOnly
                        placeholder="リードを選択してください"
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsLeadSelectorOpen(true)}
                      >
                        <Search className="h-4 w-4" />
                      </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="paymentTypeId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>入金タイプ (任意)</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || undefined} defaultValue={field.value || undefined}>
                      <FormControl><SelectTrigger><SelectValue placeholder="入金タイプを選択..." /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="none">選択しない</SelectItem>
                        {paymentTypes?.map((type) => (
                          <SelectItem key={type.id} value={type.id}>
                            {type.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>金額</FormLabel>
                    <FormControl><Input type="number" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="paymentDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>入金日</FormLabel>
                    <FormControl><Input type="date" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>説明 (任意)</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>キャンセル</Button>
                <Button type="submit">作成</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={isLeadSelectorOpen} onOpenChange={setIsLeadSelectorOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>リードを選択</DialogTitle>
          </DialogHeader>
          <Command>
            <CommandInput
              placeholder="リード名で検索..."
              value={searchQuery}
              onValueChange={setSearchQuery}
            />
            <CommandList>
              {isLeadsLoading && <CommandEmpty>検索中...</CommandEmpty>}
              {!isLeadsLoading && searchedLeads?.length === 0 && <CommandEmpty>リードが見つかりません。</CommandEmpty>}
              <CommandGroup>
                {searchedLeads?.map((lead) => (
                  <CommandItem
                    key={lead.id}
                    value={lead.name} // ★ 修正点: valueプロパティを追加
                    onSelect={() => {
                      form.setValue("leadId", lead.id);
                      setSelectedLeadName(lead.name);
                      setIsLeadSelectorOpen(false);
                      form.trigger("leadId"); // バリデーションを再実行
                    }}
                  >
                    <Check
                        className={cn(
                            "mr-2 h-4 w-4",
                            form.getValues("leadId") === lead.id ? "opacity-100" : "opacity-0"
                        )}
                    />
                    {lead.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </DialogContent>
      </Dialog>
    </>
  );
}