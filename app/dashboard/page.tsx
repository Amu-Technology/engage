"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { format, subDays } from "date-fns";
import { toast } from "sonner";
import { ActivitySectionCards } from '@/components/analytics/ActivitySectionCards'
import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { ActivityTypeChart } from '@/components/activity-type-chart'
import { DateRangeSelector } from '@/components/date-range-selector'
import { ActivityTypeTable } from '@/components/analytics/ActivityTypeTable'
import { ActivityLeadsTable } from '@/components/analytics/ActivityLeadsTable'

interface Activity {
  id: string;
  leadId: string;
  type: string;
  typeId: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  lead: {
    name: string;
  };
}

interface ActivityType {
  id: string;
  name: string;
  color: string | null;
  point: number;
}

interface ActivityStats {
  total: number;
  previousTotal: number;
  byType: Record<string, number>;
  previousByType: Record<string, number>;
  byLead: Array<{ leadId: string; leadName: string; count: number; points: number }>;
  timeline: Array<{ date: string; count: number }>;
  leadsData: Array<{
    id: string;
    name: string;
    activityCount: number;
    previousActivityCount: number;
    totalPoints: number;
    previousTotalPoints: number;
  }>;
}

interface DateRange {
  startDate: Date;
  endDate: Date;
}

export default function AnalyticsPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [activityTypes, setActivityTypes] = useState<ActivityType[]>([]);
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
    }
  };

  const fetchActivityTypes = async () => {
    try {
      const response = await fetch("/api/activity-types");
      if (!response.ok) throw new Error("アクティビティタイプの取得に失敗しました");
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
    fetchActivities();
    fetchActivityTypes();
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
        const activityDate = new Date(activity.updatedAt);
        return activityDate >= dateRange.startDate && activityDate <= dateRange.endDate;
      }
    );

    // 前の期間のアクティビティ
    const previousActivities = activities.filter(
      (activity) => {
        const activityDate = new Date(activity.updatedAt);
        return activityDate >= previousStartDate && activityDate <= previousEndDate;
      }
    );

    // 種類別集計（現在の期間）
    const byType = filteredActivities.reduce((acc, activity) => {
      acc[activity.typeId] = (acc[activity.typeId] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // 種類別集計（前の期間）
    const previousByType = previousActivities.reduce((acc, activity) => {
      acc[activity.typeId] = (acc[activity.typeId] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // リード別集計（現在の期間）
    const byLead = filteredActivities.reduce((acc, activity) => {
      // leadIdをキーとしてオブジェクトで管理
      const key = `${activity.leadId}-${activity.lead.name}`; // リードIDと名前を組み合わせて一意のキーを作成
      if (!acc[key]) {
        acc[key] = {
          leadId: activity.leadId,
          leadName: activity.lead.name,
          count: 0,
          points: 0,
        };
      }
      
      acc[key].count += 1;
      acc[key].points += activityTypes.find(t => t.id === activity.typeId)?.point || 0;
      
      return acc;
    }, {} as Record<string, { leadId: string; leadName: string; count: number; points: number }>);

    // オブジェクトを配列に変換
    const byLeadArray = Object.values(byLead);

    // リード別集計（前の期間）
    const previousByLead = previousActivities.reduce((acc, activity) => {
      const key = `${activity.leadId}-${activity.lead.name}`; // リードIDと名前を組み合わせて一意のキーを作成
      if (!acc[key]) {
        acc[key] = {
          leadId: activity.leadId,
          leadName: activity.lead.name,
          count: 0,
          points: 0,
        };
      }
      
      acc[key].count += 1;
      acc[key].points += activityTypes.find(t => t.id === activity.typeId)?.point || 0;
      
      return acc;
    }, {} as Record<string, { leadId: string; leadName: string; count: number; points: number }>);

    const previousByLeadArray = Object.values(previousByLead);

    // リード別データの結合
    const leadsData = byLeadArray.map((lead, index) => {
      const previousLead = previousByLeadArray.find(p => p.leadId === lead.leadId);
      return {
        id: `${lead.leadId}-${index}`,
        name: lead.leadName,
        activityCount: lead.count,
        previousActivityCount: previousLead?.count || 0,
        totalPoints: lead.points,
        previousTotalPoints: previousLead?.points || 0,
      };
    }).sort((a, b) => b.activityCount - a.activityCount);

    // 時系列データ
    const timeline = Array.from({ length: daysDiff + 1 }, (_, i) => {
      const date = new Date(dateRange.startDate);
      date.setDate(date.getDate() + i);
      const dateStr = format(date, "yyyy-MM-dd");
      const dayActivities = filteredActivities.filter(
        (activity) => format(new Date(activity.updatedAt), "yyyy-MM-dd") === dateStr
      );

      const typeCounts = dayActivities.reduce((acc, activity) => {
        acc[`${activity.typeId}_count`] = (acc[`${activity.typeId}_count`] || 0) + 1;
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
      byLead: byLeadArray.slice(0, 10),
      timeline,
      leadsData,
    };
  }, [activities, dateRange, activityTypes]);

  const stats = useMemo(() => getStats(), [getStats]);


  if (isLoading) {
    return <div className="p-4">読み込み中...</div>;
  }

  // アクティビティタイプのデータを準備
  const activityTypesData = activityTypes.map(type => ({
    id: type.id,
    name: type.name,
    color: type.color,
    point: type.point
  }));

  return (
    <div className="container mx-auto p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">アクティビティ分析</h1>
      </div>

      <DateRangeSelector onRangeChange={handleDateRangeChange} />

      <ActivitySectionCards stats={stats} activityTypes={activityTypesData} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ActivityTypeChart
          data={stats.byType}
          activityTypes={activityTypesData}
        />
        <ChartAreaInteractive
          data={stats.timeline}
          xAxisKey="date"
          yAxisKey="count"
          title="アクティビティ推移"
          activityTypes={activityTypesData}
        />

        <ActivityTypeTable
          byType={stats.byType}
          previousByType={stats.previousByType}
          activityTypes={activityTypesData}
        />

        <ActivityLeadsTable leads={stats.leadsData} />
      </div>
    </div>
  );
}
