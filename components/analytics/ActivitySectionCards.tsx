'use client'

import { SectionCards } from "@/components/section-cards"

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

interface ActivityType {
  id: string;
  name: string;
  color?: string | null;
  point?: number;
}

interface ActivitySectionCardsProps {
  stats: ActivityStats;
  activityTypes: ActivityType[];
}

const calculateChange = (current: number, previous: number): number => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
};

export function ActivitySectionCards({ stats, activityTypes }: ActivitySectionCardsProps) {
  const activityTypeLabels: Record<string, string> = Object.fromEntries(
    activityTypes.map(type => [type.id, type.name])
  );

  const sectionCards = [
    {
      title: "総アクティビティ",
      value: stats.total,
      previousValue: stats.previousTotal,
      change: calculateChange(stats.total, stats.previousTotal),
      description: "期間内の総アクティビティ数",
    },
    ...Object.entries(stats.byType).map(([type, count]) => ({
      title: activityTypeLabels[type] || type,
      value: count,
      previousValue: stats.previousByType[type] || 0,
      change: calculateChange(count, stats.previousByType[type] || 0),
      description: `${activityTypeLabels[type] || type}のアクティビティ数`,
    })),
  ];

  return <SectionCards cards={sectionCards} />;
} 