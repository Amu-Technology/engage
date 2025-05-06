'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

interface ActivityTypeChartProps {
  data: Record<string, number>
  labels: Record<string, string>
}

export function ActivityTypeChart({ data, labels }: ActivityTypeChartProps) {
  const chartData = Object.entries(data).map(([type, count]) => ({
    type: labels[type] || type,
    count,
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>アクティビティタイプ別集計</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="type" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
} 