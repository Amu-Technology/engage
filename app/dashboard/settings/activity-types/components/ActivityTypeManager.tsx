"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Pencil, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

interface ActivityType {
  id: string;
  name: string;
  color: string | null;
  point: number;
}

const formSchema = z.object({
  name: z.string().min(1, "名前は必須です"),
  color: z.string().optional(),
  point: z.number().min(1, "ポイントは1以上である必要があります"),
});

export function ActivityTypeManager() {
  const [activityTypes, setActivityTypes] = useState<ActivityType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingType, setEditingType] = useState<ActivityType | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      color: "#000000",
      point: 1,
    },
  });

  const fetchActivityTypes = async () => {
    try {
      const response = await fetch("/api/activity-types");
      if (!response.ok)
        throw new Error("アクティビティタイプの取得に失敗しました");
      const data = await response.json();
      setActivityTypes(data);
    } catch (error) {
      console.error("エラー:", error);
      toast.error("アクティビティタイプの取得に失敗しました");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchActivityTypes();
  }, []);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const url = editingType
        ? `/api/activity-types/${editingType.id}`
        : "/api/activity-types";
      const method = editingType ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!response.ok)
        throw new Error("アクティビティタイプの保存に失敗しました");

      toast.success(
        editingType
          ? "アクティビティタイプを更新しました"
          : "アクティビティタイプを追加しました"
      );
      setIsDialogOpen(false);
      fetchActivityTypes();
      form.reset();
      setEditingType(null);
    } catch (error) {
      console.error("エラー:", error);
      toast.error("アクティビティタイプの保存に失敗しました");
    }
  };

  const handleEdit = (type: ActivityType) => {
    setEditingType(type);
    form.reset({
      name: type.name,
      color: type.color || "#000000",
      point: type.point,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("このアクティビティタイプを削除してもよろしいですか？"))
      return;

    try {
      const response = await fetch(`/api/activity-types/${id}`, {
        method: "DELETE",
      });

      if (!response.ok)
        throw new Error("アクティビティタイプの削除に失敗しました");

      toast.success("アクティビティタイプを削除しました");
      fetchActivityTypes();
    } catch (error) {
      console.error("エラー:", error);
      toast.error("アクティビティタイプの削除に失敗しました");
    }
  };

  if (isLoading) {
    return <div>読み込み中...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setEditingType(null);
                form.reset({ name: "", color: "#000000", point: 1 });
              }}
            >
              新規追加
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingType
                  ? "アクティビティタイプの編集"
                  : "新規アクティビティタイプ"}
              </DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>名前</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="color"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>色</FormLabel>
                      <FormControl>
                        <div className="flex gap-2">
                          <Input type="color" {...field} className="w-20" />
                          <Input {...field} className="flex-1" />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="point"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ポイント</FormLabel>
                      <FormControl>
                        <div className="flex gap-2">
                          <Input
                            type="number"
                            min={1}
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                            className="flex-1"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    キャンセル
                  </Button>
                  <Button type="submit">{editingType ? "更新" : "追加"}</Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-2">
        {activityTypes.map((type) => (
          <div
            key={type.id}
            className="flex items-center justify-between p-4 border rounded-lg"
          >
            <div className="flex items-center gap-2">
              {type.color && (
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: type.color }}
                />
              )}
              <span>{type.name}</span>
              <span>[{type.point}pt]</span>
              {type.id.includes('default') && (
                <span className="text-xs text-muted-foreground">(デフォルト)</span>
              )}
            </div>
            
            {!type.id.includes('default') && (
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEdit(type)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(type.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
