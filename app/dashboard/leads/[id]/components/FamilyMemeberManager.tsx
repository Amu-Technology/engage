"use client";

import { useState } from "react";
import useSWR from 'swr';
import { fetcher } from "@/lib/fetcher";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Plus, Edit, Trash2 } from "lucide-react";
import type { FamilyMember } from "@prisma/client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const formSchema = z.object({
  name: z.string().min(1, "名前は必須です。"),
  nameReading: z.string().optional(),
  relationship: z.string().optional(),
});

interface FamilyMemberManagerProps {
  leadId: string;
}

export function FamilyMemberManager({ leadId }: FamilyMemberManagerProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<FamilyMember | null>(null);
  
  const { data: familyMembers, error, isLoading, mutate } = useSWR<FamilyMember[]>(`/api/family-members?leadId=${leadId}`, fetcher);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", nameReading: "", relationship: "" },
  });

  const handleOpenDialog = (member: FamilyMember | null) => {
    setEditingMember(member);
    form.reset(member ? { name: member.name, nameReading: member.nameReading || '', relationship: member.relationship || '' } : { name: "", nameReading: "", relationship: "" });
    setIsDialogOpen(true);
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const url = editingMember ? `/api/family-members/${editingMember.id}` : `/api/family-members`;
    const method = editingMember ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...values, leadId }),
      });
      if (!response.ok) throw new Error("保存に失敗しました");
      
      toast.success(editingMember ? "更新しました" : "追加しました");
      setIsDialogOpen(false);
      mutate(); // データ再検証
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "エラーが発生しました");
    }
  };
  
  const handleDelete = async (id: string) => {
    if (!confirm("このメンバーを削除しますか？")) return;
    try {
        const response = await fetch(`/api/family-members/${id}`, { method: 'DELETE' });
        if(!response.ok) throw new Error("削除に失敗しました");
        toast.success("削除しました");
        mutate();
    } catch(err) {
        toast.error(err instanceof Error ? err.message : "エラーが発生しました");
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>家族構成</CardTitle>
        <Button onClick={() => handleOpenDialog(null)} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          家族を追加
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>名前</TableHead>
              <TableHead>読み仮名</TableHead>
              <TableHead>続柄</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && <TableRow><TableCell colSpan={4} className="text-center">読み込み中...</TableCell></TableRow>}
            {error && <TableRow><TableCell colSpan={4} className="text-center text-red-500">エラー</TableCell></TableRow>}
            {familyMembers?.map(member => (
              <TableRow key={member.id}>
                <TableCell>{member.name}</TableCell>
                <TableCell>{member.nameReading}</TableCell>
                <TableCell>{member.relationship}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(member)}><Edit className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(member.id)}><Trash2 className="h-4 w-4" /></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingMember ? '家族の編集' : '家族の追加'}</DialogTitle>
            </DialogHeader>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField control={form.control} name="name" render={({ field }) => (
                        <FormItem><FormLabel>名前</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
                    <FormField control={form.control} name="nameReading" render={({ field }) => (
                        <FormItem><FormLabel>読み仮名</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
                    <FormField control={form.control} name="relationship" render={({ field }) => (
                        <FormItem><FormLabel>続柄</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
                    <DialogFooter>
                        <DialogClose asChild><Button type="button" variant="outline">キャンセル</Button></DialogClose>
                        <Button type="submit">保存</Button>
                    </DialogFooter>
                </form>
            </Form>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}