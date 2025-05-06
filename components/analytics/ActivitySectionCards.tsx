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

interface ActivitySectionCardsProps {
  stats: ActivityStats;
}

const activityTypeLabels: Record<string, string> = {
  meeting: "面談",
  call: "電話",
  email: "メール",
  other: "その他",
};

const calculateChange = (current: number, previous: number): number => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
};

export function ActivitySectionCards({ stats }: ActivitySectionCardsProps) {
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