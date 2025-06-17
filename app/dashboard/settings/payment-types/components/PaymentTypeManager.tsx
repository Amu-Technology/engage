"use client";

import { useState } from "react";
import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';
import { toast } from "sonner";
import { Pencil, Trash2 } from "lucide-react";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import type { PaymentType } from "@prisma/client";

const formSchema = z.object({
  name: z.string().min(1, "名前は必須です"),
});

export function PaymentTypeManager() {
  const { data: paymentTypes, error, isLoading, mutate } = useSWR<PaymentType[]>('/api/payment-types', fetcher);
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingType, setEditingType] = useState<PaymentType | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "" },
  });

  const handleOpenDialog = (type: PaymentType | null) => {
    setEditingType(type);
    form.reset({ name: type ? type.name : "" });
    setIsDialogOpen(true);
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const url = editingType ? `/api/payment-types/${editingType.id}` : "/api/payment-types";
      const method = editingType ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!response.ok) throw new Error("保存に失敗しました");

      toast.success(editingType ? "更新しました" : "作成しました");
      setIsDialogOpen(false);
      mutate(); // データを再検証して一覧を更新
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "エラーが発生しました");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("この入金タイプを削除しますか？関連する入金からはタイプ情報が失われます。")) return;
    try {
        const response = await fetch(`/api/payment-types/${id}`, { method: "DELETE" });
        if(!response.ok) throw new Error("削除に失敗しました");
        toast.success("削除しました");
        mutate();
    } catch(err) {
        toast.error(err instanceof Error ? err.message : "エラーが発生しました");
    }
  };
  
  if (isLoading) return <div>読み込み中...</div>;
  if (error) return <div className="text-red-500">データ取得エラー</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => handleOpenDialog(null)}>新規追加</Button>
      </div>

      <div className="space-y-2 border rounded-md p-2">
        {paymentTypes?.map((type) => (
          <div
            key={type.id}
            className="flex items-center justify-between p-2 hover:bg-muted/50 rounded-md"
          >
            <span>{type.name}</span>
            <div className="flex gap-2">
              <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(type)}>
                <Pencil className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(type.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingType ? "入金タイプの編集" : "新規入金タイプ"}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>タイプ名</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <DialogClose asChild>
                    <Button type="button" variant="outline">キャンセル</Button>
                </DialogClose>
                <Button type="submit">保存</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}