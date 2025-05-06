import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Lead {
  id: string;
  name: string;
  activityCount: number;
  previousActivityCount: number;
  totalPoints: number;
  previousTotalPoints: number;
}

interface ActivityLeadsTableProps {
  leads: Lead[];
}

export function ActivityLeadsTable({ leads }: ActivityLeadsTableProps) {
  // 合計値の計算
  const totalStats = leads.reduce(
    (acc, lead) => ({
      totalCount: acc.totalCount + lead.activityCount,
      previousTotalCount: acc.previousTotalCount + lead.previousActivityCount,
      totalPoints: acc.totalPoints + lead.totalPoints,
      previousTotalPoints: acc.previousTotalPoints + lead.previousTotalPoints,
    }),
    {
      totalCount: 0,
      previousTotalCount: 0,
      totalPoints: 0,
      previousTotalPoints: 0,
    }
  );

  // 増減率の計算
  const countDiff = totalStats.totalCount - totalStats.previousTotalCount;
  const countDiffPercentage = totalStats.previousTotalCount
    ? (countDiff / totalStats.previousTotalCount) * 100
    : 0;

  const pointsDiff = totalStats.totalPoints - totalStats.previousTotalPoints;
  const pointsDiffPercentage = totalStats.previousTotalPoints
    ? (pointsDiff / totalStats.previousTotalPoints) * 100
    : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>アクティビティ実施リード一覧</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4 grid grid-cols-2 gap-4">
          <div className="rounded-lg border p-4">
            <div className="text-sm text-muted-foreground">アクティビティ数</div>
            <div className="mt-2 flex items-baseline justify-between">
              <div className="text-2xl font-bold">{totalStats.totalCount}</div>
              <div className={`text-sm ${countDiff > 0 ? 'text-green-600' : countDiff < 0 ? 'text-red-600' : ''}`}>
                {countDiff > 0 ? '+' : ''}{countDiffPercentage.toFixed(1)}%
              </div>
            </div>
            <div className="mt-1 text-sm text-muted-foreground">
              前期間: {totalStats.previousTotalCount}
            </div>
          </div>
          <div className="rounded-lg border p-4">
            <div className="text-sm text-muted-foreground">合計ポイント</div>
            <div className="mt-2 flex items-baseline justify-between">
              <div className="text-2xl font-bold">{totalStats.totalPoints}pt</div>
              <div className={`text-sm ${pointsDiff > 0 ? 'text-green-600' : pointsDiff < 0 ? 'text-red-600' : ''}`}>
                {pointsDiff > 0 ? '+' : ''}{pointsDiffPercentage.toFixed(1)}%
              </div>
            </div>
            <div className="mt-1 text-sm text-muted-foreground">
              前期間: {totalStats.previousTotalPoints}pt
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">リード名</th>
                <th className="text-right py-2">アクティビティ数</th>
                <th className="text-right py-2">前期間</th>
                <th className="text-right py-2">増減</th>
                <th className="text-right py-2">ポイント</th>
                <th className="text-right py-2">前期間</th>
                <th className="text-right py-2">増減</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => {
                const activityDiff = lead.activityCount - lead.previousActivityCount;
                const pointsDiff = lead.totalPoints - lead.previousTotalPoints;

                return (
                  <tr key={lead.id} className="border-b">
                    <td className="py-2">{lead.name}</td>
                    <td className="text-right py-2">{lead.activityCount}</td>
                    <td className="text-right py-2">{lead.previousActivityCount}</td>
                    <td className={`text-right py-2 ${activityDiff > 0 ? 'text-green-600' : activityDiff < 0 ? 'text-red-600' : ''}`}>
                      {activityDiff > 0 ? '+' : ''}{activityDiff}
                    </td>
                    <td className="text-right py-2">{lead.totalPoints}pt</td>
                    <td className="text-right py-2">{lead.previousTotalPoints}pt</td>
                    <td className={`text-right py-2 ${pointsDiff > 0 ? 'text-green-600' : pointsDiff < 0 ? 'text-red-600' : ''}`}>
                      {pointsDiff > 0 ? '+' : ''}{pointsDiff}pt
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
} 