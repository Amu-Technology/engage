"use client";

import * as React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ChartAreaInteractiveProps {
  data: Array<{
    [key: string]: string | number;
  }>;
  xAxisKey: string;
  yAxisKey: string;
  title: string;
  labels?: Record<string, string>;
  activityTypes?: {
    id: string;
    name: string;
    color: string | null;
  }[];
}

const COLORS = [
  "#8884d8",
  "#82ca9d",
  "#ffc658",
  "#ff8042",
  "#0088fe",
  "#00c49f",
  "#ffbb28",
  "#ff8042",
];

export function ChartAreaInteractive({
  data,
  xAxisKey,
  yAxisKey,
  title,
  labels,
  activityTypes,
}: ChartAreaInteractiveProps) {
  // アクティビティタイプごとのデータを生成
  const chartData = React.useMemo(() => {
    if (!activityTypes) return data;

    return data.map((item) => {
      const result: Record<string, string | number> = {
        [xAxisKey]: item[xAxisKey],
      };
      activityTypes.forEach((type) => {
        result[type.id] = item[`${type.id}_count`] || 0;
      });
      return result;
    });
  }, [data, xAxisKey, activityTypes]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="aspect-auto h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey={xAxisKey}
                tick={{ fontSize: 12 }}
                interval="preserveStartEnd"
              />
              <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                  fontSize: "12px",
                }}
              />
              <Legend
                verticalAlign="bottom"
                height={36}
                wrapperStyle={{
                  paddingTop: "20px",
                }}
                formatter={(value) => labels?.[value] || value}
                iconType="circle"
                iconSize={10}
              />
              {activityTypes ? (
                activityTypes.map((type, index) => (
                  <Line
                    key={type.id}
                    type="monotone"
                    dataKey={type.id}
                    name={labels?.[type.id] || type.id}
                    stroke={type.color || COLORS[index % COLORS.length]}
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                ))
              ) : (
                <Line
                  type="monotone"
                  dataKey={yAxisKey}
                  name={labels?.[yAxisKey] || yAxisKey}
                  stroke="#8884d8"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
