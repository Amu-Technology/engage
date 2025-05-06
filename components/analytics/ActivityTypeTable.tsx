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
  return (
    <Card>
      <CardHeader>
        <CardTitle>アクティビティタイプ別集計</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">アクティビティタイプ</th>
                <th className="text-right py-2">期間内</th>
                <th className="text-right py-2">前期間</th>
                <th className="text-right py-2">増減</th>
                <th className="text-right py-2">ポイント</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(byType).map(([type, count]) => {
                const previousCount = previousByType[type] || 0;
                const diff = count - previousCount;
                const activityType = activityTypes.find(t => t.id === type);
                const point = activityType?.point || 0;
                const totalPoints = count * point;
                const previousPoints = previousCount * point;
                const pointsDiff = totalPoints - previousPoints;

                return (
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
                        <div className={`text-sm ${pointsDiff > 0 ? 'text-green-600' : pointsDiff < 0 ? 'text-red-600' : ''}`}>
                          {pointsDiff > 0 ? '+' : ''}{pointsDiff}pt
                        </div>
                      </div>
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