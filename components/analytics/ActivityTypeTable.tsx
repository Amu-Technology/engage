import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ActivityType {
  id: string;
  name: string;
  color: string | null;
  point: number;
}

interface ActivityTypeTableProps {
  byType: Record<string, number>;
  previousByType: Record<string, number>;
  activityTypes: ActivityType[];
}

export function ActivityTypeTable({ byType, previousByType, activityTypes }: ActivityTypeTableProps) {
  // 合計値の計算
  const totalStats = Object.entries(byType).reduce(
    (acc, [type, count]) => {
      const activityType = activityTypes.find(t => t.id === type);
      const point = activityType?.point || 0;
      const previousCount = previousByType[type] || 0;
      
      return {
        totalCount: acc.totalCount + count,
        previousTotalCount: acc.previousTotalCount + previousCount,
        totalPoints: acc.totalPoints + (count * point),
        previousTotalPoints: acc.previousTotalPoints + (previousCount * point),
      };
    },
    {
      totalCount: 0,
      previousTotalCount: 0,
      totalPoints: 0,
      previousTotalPoints: 0,
    }
  );

  // アクティビティタイプごとのポイント計算
  const typeStats = Object.entries(byType).map(([type, count]) => {
    const activityType = activityTypes.find(t => t.id === type);
    const point = activityType?.point || 0;
    const previousCount = previousByType[type] || 0;
    const totalPoints = count * point;
    const previousPoints = previousCount * point;
    const pointsDiff = totalPoints - previousPoints;

    return {
      type,
      count,
      previousCount,
      diff: count - previousCount,
      activityType,
      totalPoints,
      previousPoints,
      pointsDiff
    };
  }).sort((a, b) => b.totalPoints - a.totalPoints); // ポイントの多い順にソート

  return (
    <Card>
      <CardHeader>
        <CardTitle>アクティビティタイプ別集計</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4 grid grid-cols-2 gap-4">
          <div className="rounded-lg border p-4">
            <div className="text-sm text-muted-foreground">アクティビティ数</div>
            <div className="mt-2 flex items-baseline justify-between">
              <div className="text-2xl font-bold">{totalStats.totalCount}</div>
              <div className={`text-sm ${totalStats.totalCount > totalStats.previousTotalCount ? 'text-green-600' : totalStats.totalCount < totalStats.previousTotalCount ? 'text-red-600' : ''}`}>
                {totalStats.totalCount > totalStats.previousTotalCount ? '+' : ''}{totalStats.totalCount - totalStats.previousTotalCount}
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
              <div className={`text-sm ${totalStats.totalPoints > totalStats.previousTotalPoints ? 'text-green-600' : totalStats.totalPoints < totalStats.previousTotalPoints ? 'text-red-600' : ''}`}>
                {totalStats.totalPoints > totalStats.previousTotalPoints ? '+' : ''}{totalStats.totalPoints - totalStats.previousTotalPoints}pt
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
                <th className="text-left py-2">アクティビティタイプ</th>
                <th className="text-right py-2">期間内</th>
                <th className="text-right py-2">前期間</th>
                <th className="text-right py-2">増減</th>
                <th className="text-right py-2">ポイント</th>
                <th className="text-right py-2">ポイント増減</th>
              </tr>
            </thead>
            <tbody>
              {typeStats.map(({ type, count, previousCount, diff, activityType, totalPoints, previousPoints, pointsDiff }) => (
                <tr key={type} className="border-b">
                  <td className="py-2">
                    <div className="flex items-center gap-2">
                      {activityType?.color && (
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: activityType.color }}
                        />
                      )}
                      <span>{activityType?.name || type}</span>
                    </div>
                  </td>
                  <td className="text-right py-2">{count}</td>
                  <td className="text-right py-2">{previousCount}</td>
                  <td className={`text-right py-2 ${diff > 0 ? 'text-green-600' : diff < 0 ? 'text-red-600' : ''}`}>
                    {diff > 0 ? '+' : ''}{diff}
                  </td>
                  <td className="text-right py-2">
                    <div className="space-y-1">
                      <div>{totalPoints}pt</div>
                      <div className="text-sm text-muted-foreground">
                        ({activityType?.point || 0}pt × {count})
                      </div>
                    </div>
                  </td>
                  <td className={`text-right py-2 ${pointsDiff > 0 ? 'text-green-600' : pointsDiff < 0 ? 'text-red-600' : ''}`}>
                    {pointsDiff > 0 ? '+' : ''}{pointsDiff}pt
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
} 