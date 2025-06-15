"use client";

import { useForm, getFormProps, getInputProps } from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import { toast } from "sonner";
import useSWR from "swr";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { fetcher } from "@/lib/fetcher";
import * as z from "zod";

const formSchema = z
  .object({
    title: z.string().min(1, "タイトルは必須です"),
    startDate: z
      .string({ required_error: "開始日時は必須です" })
      .refine((val) => val && !isNaN(Date.parse(val)), "有効な日付ではありません"),
    endDate: z
      .string({ required_error: "終了日時は必須です" })
      .refine((val) => val && !isNaN(Date.parse(val)), "有効な日付ではありません"),
    location: z.string().optional(),
    description: z.string().optional(),
    groupId: z.string().optional(),
  })
  .refine((data) => new Date(data.endDate) >= new Date(data.startDate), {
    message: "終了日時は開始日時以降に設定してください。",
    path: ["endDate"],
  });

type FormValues = z.infer<typeof formSchema>;

interface Group {
  id: string;
  name: string;
}

interface EventFormProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  event: {
    id: string;
    title: string;
    startDate: string;
    endDate: string;
    location: string | null;
    description: string | null;
    relatedGroups: { id: string }[];
  } | null;
}

const formatDateTimeLocal = (date: Date): string => {
    if (!date || isNaN(date.getTime())) return "";
    const pad = (num: number) => num.toString().padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

export function EventForm({
  isOpen,
  onOpenChange,
  onSuccess,
  event,
}: EventFormProps) {
  const { data: groups, error: groupsError } = useSWR<Group[]>(
    "/api/groups",
    fetcher
  );

  // ★★★ ここからが修正箇所 ★★★
  const [form, fields] = useForm<FormValues>({
    constraint: getZodConstraint(formSchema),
    shouldValidate: "onBlur",
    shouldRevalidate: "onInput",
    // `defaultValue`オプションで初期値を設定
    defaultValue: event ? {
        title: event.title,
        startDate: formatDateTimeLocal(new Date(event.startDate)),
        endDate: formatDateTimeLocal(new Date(event.endDate)),
        location: event.location || '',
        description: event.description || '',
        groupId: event.relatedGroups?.[0]?.id || 'none'
    } : undefined, // 新規作成時はundefinedで空にする
    
    async onSubmit(e) {
      e.preventDefault();
      const formData = new FormData(e.currentTarget);
      const submission = parseWithZod(formData, { schema: formSchema });

      if (submission.status !== "success") {
        return;
      }
      
      const submissionData = {
        ...submission.value,
        groupId:
          submission.value.groupId === "none"
            ? undefined
            : submission.value.groupId,
      };

      try {
        const url = event ? `/api/events/${event.id}` : "/api/events";
        const method = event ? "PUT" : "POST";

        const response = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(submissionData),
        });

        if (!response.ok) {
          throw new Error(
            event
              ? "イベントの更新に失敗しました"
              : "イベントの作成に失敗しました"
          );
        }

        toast.success(
          event ? "イベントを更新しました" : "イベントを作成しました"
        );
        onSuccess();
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "処理中にエラーが発生しました"
        );
      }
    },
  });
  // ★★★ ここまでが修正箇所 ★★★

  // `useEffect`によるリセットは不要になったため削除
  // useEffect(() => { ... });

  if (groupsError) {
    toast.error("グループの取得に失敗しました");
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{event ? "イベントの編集" : "新規イベント"}</DialogTitle>
        </DialogHeader>
        <form {...getFormProps(form)} className="space-y-4">
          <div>
            <Label htmlFor={fields.title.id}>タイトル</Label>
            <Input {...getInputProps(fields.title, { type: "text" })} />
            <div className="text-sm font-medium text-destructive">
              {fields.title.errors}
            </div>
          </div>

          <div>
            <Label htmlFor={fields.startDate.id}>開始日時</Label>
            <Input
              {...getInputProps(fields.startDate, { type: "datetime-local" })}
            />
            <div className="text-sm font-medium text-destructive">
              {fields.startDate.errors}
            </div>
          </div>

          <div>
            <Label htmlFor={fields.endDate.id}>終了日時</Label>
            <Input
              {...getInputProps(fields.endDate, { type: "datetime-local" })}
            />
            <div className="text-sm font-medium text-destructive">
              {fields.endDate.errors}
            </div>
          </div>

          <div>
            <Label htmlFor={fields.location.id}>場所</Label>
            <Input {...getInputProps(fields.location, { type: "text" })} />
            <div className="text-sm font-medium text-destructive">
              {fields.location.errors}
            </div>
          </div>

          <div>
            <Label htmlFor={fields.description.id}>説明</Label>
            <Textarea
              {...getInputProps(fields.description, { type: "text" })}
            />
            <div className="text-sm font-medium text-destructive">
              {fields.description.errors}
            </div>
          </div>

          <div>
            <Label htmlFor={fields.groupId.id}>参加グループ (任意)</Label>
            <Select
              name={fields.groupId.name}
              defaultValue={fields.groupId.initialValue}
            >
              <SelectTrigger>
                <SelectValue placeholder="グループを選択..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">選択しない</SelectItem>
                {groups?.map((group) => (
                  <SelectItem key={group.id} value={group.id}>
                    {group.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="text-sm font-medium text-destructive">
              {fields.groupId.errors}
            </div>
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              キャンセル
            </Button>
            <Button type="submit">{event ? "更新" : "作成"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}