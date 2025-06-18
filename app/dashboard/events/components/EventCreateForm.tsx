"use client";

import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// 1. Zodを使ってフォーム用のスキーマを定義
const eventFormSchema = z
  .object({
    title: z.string().min(1, "タイトルは必須です。"),
    startDate: z.string().min(1, "開始日時は必須です。"),
    endDate: z.string().min(1, "終了日時は必須です。"),
    location: z.string().optional(),
    description: z.string().optional(),
    groupId: z.string().optional(),
  })
  .refine((data) => new Date(data.endDate) >= new Date(data.startDate), {
    message: "終了日時は開始日時以降に設定してください。",
    path: ["endDate"],
  });

// フォームで扱うデータの型をスキーマから推論
type EventFormValues = z.infer<typeof eventFormSchema>;

interface Group {
  id: string;
  name: string;
}

export default function EventCreateForm() {
  const router = useRouter();
  const [groups, setGroups] = useState<Group[]>([]);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
  } = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
  });

  // グループ一覧を取得
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const response = await fetch("/api/groups");
        if (!response.ok) throw new Error("グループの取得に失敗しました");
        const data = await response.json();
        setGroups(data);
      } catch (error) {
        console.error("エラー:", error);
        toast.error("グループの取得に失敗しました");
      }
    };

    fetchGroups();
  }, []);

  // フォーム送信時の処理
  const onSubmit: SubmitHandler<EventFormValues> = async (data) => {
    try {
      const submissionData = {
        ...data,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
      };

      const response = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submissionData),
      });

      if (!response.ok) {
        throw new Error("イベントの作成に失敗しました");
      }

      toast.success("イベントを正常に作成しました。");
      router.push("/dashboard/events");
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "予期せぬエラーが発生しました。"
      );
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">タイトル</Label>
        <Input
          id="title"
          defaultValue="新しいイベント"
          {...register("title")}
        />
        {errors.title && (
          <p className="text-sm text-red-500">{errors.title.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="startDate">開始日時</Label>
          <Input
            id="startDate"
            type="datetime-local"
            {...register("startDate")}
          />
          {errors.startDate && (
            <p className="text-sm text-red-500">{errors.startDate.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="endDate">終了日時</Label>
          <Input id="endDate" type="datetime-local" {...register("endDate")} />
          {errors.endDate && (
            <p className="text-sm text-red-500">{errors.endDate.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="location">場所 (任意)</Label>
        <Input id="location" {...register("location")} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">説明 (任意)</Label>
        <Textarea id="description" {...register("description")} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="groupId">関連グループ (任意)</Label>
        <Select
          onValueChange={(value) => setValue("groupId", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="グループを選択" />
          </SelectTrigger>
          <SelectContent>
            {groups.map((group) => (
              <SelectItem key={group.id} value={group.id}>
                {group.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "作成中..." : "イベントを作成"}
        </Button>
      </div>
    </form>
  );
}
