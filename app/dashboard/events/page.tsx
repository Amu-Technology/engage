"use client";

import { format } from "date-fns";
import { toast } from "sonner";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import { Trash2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import EventCreateForm from "./components/EventCreateForm";

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
  const {
    data: events,
    error,
    isLoading,
    mutate,
  } = useSWR<FormattedEvent[]>("/api/events", fetcher);

  const handleDelete = async (eventId: string) => {
    if (!confirm("このイベントを削除してもよろしいですか？")) return;
    try {
      const response = await fetch(`/api/events/${eventId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("イベントの削除に失敗しました");
      toast.success("イベントを削除しました");
      mutate();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "イベントの削除に失敗しました"
      );
    }
  };

  const renderContent = () => {
    if (isLoading)
      return (
        <TableRow>
          <TableCell colSpan={5} className="text-center">
            読み込み中...
          </TableCell>
        </TableRow>
      );
    if (error)
      return (
        <TableRow>
          <TableCell colSpan={5} className="text-center text-red-500">
            エラーが発生しました
          </TableCell>
        </TableRow>
      );
    if (!events?.length)
      return (
        <TableRow>
          <TableCell colSpan={5} className="text-center">
            イベントがありません
          </TableCell>
        </TableRow>
      );

    return events.map((event) => (
      <TableRow key={event.id}>
        <TableCell>{event.title}</TableCell>
        <TableCell>
          {format(new Date(event.startDate), "yyyy/MM/dd")} -{" "}
          {format(new Date(event.endDate), "yyyy/MM/dd")}
        </TableCell>
        <TableCell>
          <div className="flex flex-wrap gap-1">
            {event.relatedGroups.map((g: { id: string; name: string }) => (
              <Badge key={g.id} variant="secondary">
                {g.name}
              </Badge>
            ))}
          </div>
        </TableCell>
        <TableCell>{event.relatedLeads.length}名</TableCell>
        <TableCell className="text-right">
          <Button
            variant="ghost"
            size="icon"
            className="text-red-500"
            onClick={() => handleDelete(event.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </TableCell>
      </TableRow>
    ));
  };

  return (
    <div className="container mx-auto p-4 space-y-4">
      <EventCreateForm />

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
            <TableBody>{renderContent()}</TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
