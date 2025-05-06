"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format, subDays } from "date-fns";
import { toast } from "sonner";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { ActivitySectionCards } from '@/components/analytics/ActivitySectionCards'
import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { ActivityTypeChart } from '@/components/activity-type-chart'
import { DateRangeSelector } from '@/components/date-range-selector'

interface Activity {
  id: string;
  leadId: string;
  type: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  lead: {
    name: string;
  };
}

interface ActivityStats {
  total: number;
  previousTotal: number;
  byType: Record<string, number>;
  previousByType: Record<string, number>;
  byLead: Array<{
    leadId: string;
    leadName: string;
    count: number;
  }>;
  timeline: Array<{
    date: string;
    count: number;
  }>;
}

interface DateRange {
  startDate: Date;
  endDate: Date;
}

export default function AnalyticsPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: subDays(new Date(), 7),
    endDate: new Date(),
  });

  const handleDateRangeChange = (range: DateRange) => {
    setDateRange(range);
  };

  const fetchActivities = async () => {
    try {
      const response = await fetch("/api/activities");
      if (!response.ok) throw new Error("アクティビティの取得に失敗しました");
      const data = await response.json();
      setActivities(data);
    } catch (error) {
      console.error("エラー:", error);
      toast.error("アクティビティの取得に失敗しました");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  const getStats = useCallback((): ActivityStats => {
    // 前の期間の日付範囲を計算
    const daysDiff = Math.ceil(
      (dateRange.endDate.getTime() - dateRange.startDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    const previousStartDate = new Date(dateRange.startDate);
    previousStartDate.setDate(previousStartDate.getDate() - daysDiff);
    const previousEndDate = new Date(dateRange.startDate);
    previousEndDate.setDate(previousEndDate.getDate() - 1);

    // 現在の期間のアクティビティ
    const filteredActivities = activities.filter(
      (activity) => {
        const activityDate = new Date(activity.createdAt);
        return activityDate >= dateRange.startDate && activityDate <= dateRange.endDate;
      }
    );

    // 前の期間のアクティビティ
    const previousActivities = activities.filter(
      (activity) => {
        const activityDate = new Date(activity.createdAt);
        return activityDate >= previousStartDate && activityDate <= previousEndDate;
      }
    );

    // 種類別集計（現在の期間）
    const byType = filteredActivities.reduce((acc, activity) => {
      acc[activity.type] = (acc[activity.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // 種類別集計（前の期間）
    const previousByType = previousActivities.reduce((acc, activity) => {
      acc[activity.type] = (acc[activity.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // リード別集計
    const byLead = filteredActivities.reduce((acc, activity) => {
      const existing = acc.find((item) => item.leadId === activity.leadId);
      if (existing) {
        existing.count++;
      } else {
        acc.push({
          leadId: activity.leadId,
          leadName: activity.lead.name,
          count: 1,
        });
      }
      return acc;
    }, [] as Array<{ leadId: string; leadName: string; count: number }>);
    byLead.sort((a, b) => b.count - a.count);

    // 時系列データ
    const timeline = Array.from({ length: daysDiff + 1 }, (_, i) => {
      const date = new Date(dateRange.startDate);
      date.setDate(date.getDate() + i);
      const dateStr = format(date, "yyyy-MM-dd");
      const dayActivities = filteredActivities.filter(
        (activity) => format(new Date(activity.createdAt), "yyyy-MM-dd") === dateStr
      );

      const typeCounts = dayActivities.reduce((acc, activity) => {
        acc[`${activity.type}_count`] = (acc[`${activity.type}_count`] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return {
        date: format(date, "MM/dd"),
        count: dayActivities.length,
        ...typeCounts,
      };
    });

    return {
      total: filteredActivities.length,
      previousTotal: previousActivities.length,
      byType,
      previousByType,
      byLead: byLead.slice(0, 10),
      timeline,
    };
  }, [activities, dateRange]);

  const stats = useMemo(() => getStats(), [getStats]);

  const activityTypeLabels: Record<string, string> = {
    meeting: "面談",
    call: "電話",
    email: "メール",
    other: "その他",
  };

  if (isLoading) {
    return <div className="p-4">読み込み中...</div>;
  }

  // アクティビティタイプのデータを準備
  const activityTypes = Object.entries(stats.byType).map(([id]) => ({
    id,
    name: activityTypeLabels[id] || id,
    color: null,
  }));

  return (
    <div className="container mx-auto p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">アクティビティ分析</h1>
      </div>

      <DateRangeSelector onRangeChange={handleDateRangeChange} />

      <ActivitySectionCards stats={stats} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ActivityTypeChart
          data={stats.byType}
          labels={activityTypeLabels}
        />
        <ChartAreaInteractive
          data={stats.timeline}
          xAxisKey="date"
          yAxisKey="count"
          title="アクティビティ推移"
          activityTypes={activityTypes}
        />

        <Card>
          <CardHeader>
            <CardTitle>リード別アクティビティ数</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.byLead}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="leadName" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
