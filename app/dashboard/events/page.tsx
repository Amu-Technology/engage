"use client";

import { useState } from "react";
import { toast } from "sonner";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import { Plus, Edit, Trash2 } from "lucide-react";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EventForm } from "./components/EventForm";

interface FormattedEvent {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  location: string | null;
  description: string | null;
  relatedGroups: { id: string; name: string }[];
  relatedLeads: { id: string; name: string; email: string | null }[];
}

export default function EventsPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<FormattedEvent | null>(null);

  const { data: events, error, isLoading, mutate } = useSWR<FormattedEvent[]>('/api/events', fetcher);

  const handleEdit = (event: FormattedEvent) => {
    setSelectedEvent(event);
    setIsFormOpen(true);
  };
  
  const handleAddNew = () => {
    setSelectedEvent(null);
    setIsFormOpen(true);
  };

  const handleDelete = async (eventId: string) => {
    if (!confirm("このイベントを削除してもよろしいですか？")) return;

    try {
      const response = await fetch(`/api/events/${eventId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('イベントの削除に失敗しました');
      }
      toast.success('イベントを削除しました');
      mutate();
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : 'イベントの削除に失敗しました');
    }
  };

  // --- ここからが修正箇所 ---

  const renderContent = () => {
    if (isLoading) {
      return (
        <TableRow>
          <TableCell colSpan={5} className="h-24 text-center">
            読み込み中...
          </TableCell>
        </TableRow>
      );
    }

    if (error) {
      return (
        <TableRow>
          <TableCell colSpan={5} className="h-24 text-center text-red-500">
            データの読み込み中にエラーが発生しました。
          </TableCell>
        </TableRow>
      );
    }

    if (!events || events.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={5} className="h-24 text-center">
            登録されているイベントはありません。
          </TableCell>
        </TableRow>
      );
    }

    return events.map((event) => (
      <TableRow key={event.id}>
        <TableCell className="font-medium">{event.title}</TableCell>
        <TableCell>
          {format(new Date(event.startDate), "yyyy/MM/dd")} - {format(new Date(event.endDate), "yyyy/MM/dd")}
        </TableCell>
        <TableCell>
          <div className="flex flex-wrap gap-1">
            {event.relatedGroups.map(g => <Badge key={g.id} variant="secondary">{g.name}</Badge>)}
          </div>
        </TableCell>
        <TableCell>{event.relatedLeads.length}名</TableCell>
        <TableCell className="text-right">
           <Button variant="ghost" size="icon" onClick={() => handleEdit(event)}>
             <Edit className="h-4 w-4" />
           </Button>
           <Button variant="ghost" size="icon" className="text-red-500" onClick={() => handleDelete(event.id)}>
             <Trash2 className="h-4 w-4" />
           </Button>
        </TableCell>
      </TableRow>
    ));
  };

  return (
    <div className="container mx-auto p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">イベント管理</h1>
        <Button onClick={handleAddNew}>
          <Plus className="mr-2 h-4 w-4" />
          新規イベント追加
        </Button>
      </div>

      <EventForm
        isOpen={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSuccess={() => {
          setIsFormOpen(false);
          mutate();
        }}
        event={selectedEvent}
      />

      <Card>
        <CardHeader>
          <CardTitle>イベント一覧</CardTitle>
          <CardDescription>登録されているイベントの一覧です。</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>タイトル</TableHead>
                <TableHead>開催期間</TableHead>
                <TableHead>関連グループ</TableHead>
                <TableHead>参加リード数</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {renderContent()}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}