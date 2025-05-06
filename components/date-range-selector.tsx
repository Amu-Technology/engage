'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { subDays, subMonths, subYears } from 'date-fns'

interface DateRange {
  startDate: Date
  endDate: Date
}

interface DateRangeSelectorProps {
  onRangeChange: (range: DateRange) => void
}

export function DateRangeSelector({ onRangeChange }: DateRangeSelectorProps) {
  const [selectedTab, setSelectedTab] = useState<string>('custom')
  const [startDate, setStartDate] = useState<string>('')
  const [endDate, setEndDate] = useState<string>('')

  const handleTabChange = (value: string) => {
    setSelectedTab(value)
    const now = new Date()
    let range: DateRange

    switch (value) {
      case '7days':
        range = {
          startDate: subDays(now, 7),
          endDate: now
        }
        break
      case '30days':
        range = {
          startDate: subDays(now, 30),
          endDate: now
        }
        break
      case '90days':
        range = {
          startDate: subDays(now, 90),
          endDate: now
        }
        break
      case '6months':
        range = {
          startDate: subMonths(now, 6),
          endDate: now
        }
        break
      case '1year':
        range = {
          startDate: subYears(now, 1),
          endDate: now
        }
        break
      case '3years':
        range = {
          startDate: subYears(now, 3),
          endDate: now
        }
        break
      default:
        return
    }

    onRangeChange(range)
  }

  const handleCustomDateChange = () => {
    if (startDate && endDate) {
      onRangeChange({
        startDate: new Date(startDate),
        endDate: new Date(endDate)
      })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>期間選択</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Tabs value={selectedTab} onValueChange={handleTabChange}>
            <TabsList className="grid grid-cols-7">
              <TabsTrigger value="custom">カスタム</TabsTrigger>
              <TabsTrigger value="7days">7日間</TabsTrigger>
              <TabsTrigger value="30days">30日間</TabsTrigger>
              <TabsTrigger value="90days">90日間</TabsTrigger>
              <TabsTrigger value="6months">半年</TabsTrigger>
              <TabsTrigger value="1year">1年</TabsTrigger>
              <TabsTrigger value="3years">3年</TabsTrigger>
            </TabsList>
          </Tabs>

          {selectedTab === 'custom' && (
            <div className="flex gap-4">
              <div className="flex-1">
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value)
                    handleCustomDateChange()
                  }}
                />
              </div>
              <div className="flex-1">
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value)
                    handleCustomDateChange()
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
} 