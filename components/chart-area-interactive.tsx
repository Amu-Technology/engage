"use client"

import * as React from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

import { useIsMobile } from "@/hooks/use-mobile"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

interface ChartAreaInteractiveProps {
  data: Array<{
    [key: string]: string | number
  }>
  xAxisKey: string
  yAxisKey: string
  title: string
  description: string
}

export function ChartAreaInteractive({
  data,
  xAxisKey,
  yAxisKey,
  title,
  description,
}: ChartAreaInteractiveProps) {
  const isMobile = useIsMobile()
  const [timeRange, setTimeRange] = React.useState("90d")

  const timeRangeOptions = React.useMemo(() => {
    if (isMobile) {
      return [
        { value: "7d", label: "7d" },
        { value: "30d", label: "30d" },
        { value: "90d", label: "90d" },
      ]
    }
    return [
      { value: "7d", label: "7 days" },
      { value: "30d", label: "30 days" },
      { value: "90d", label: "90 days" },
    ]
  }, [isMobile])

  const filteredData = data.filter((item) => {
    const date = new Date(item.date)
    const referenceDate = new Date("2024-06-30")
    const diffTime = Math.abs(referenceDate.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays <= parseInt(timeRange)
  })

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
        <div className="flex items-center justify-end">
          <ToggleGroup
            type="single"
            value={timeRange}
            onValueChange={(value) => value && setTimeRange(value)}
            variant="outline"
            size="sm"
          >
            {timeRangeOptions.map((option) => (
              <ToggleGroupItem
                key={option.value}
                value={option.value}
                aria-label={option.label}
              >
                {option.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>
      </CardHeader>
      <CardContent>
        <div className="aspect-auto h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={filteredData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={xAxisKey} />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey={yAxisKey}
                stroke="#8884d8"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
