'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowDownIcon, ArrowUpIcon } from 'lucide-react'

interface SectionCard {
  title: string
  value: number
  previousValue: number
  change: number
  description: string
}

interface SectionCardsProps {
  cards: SectionCard[]
}

export function SectionCards({ cards }: SectionCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {card.title}
            </CardTitle>
            <div className="flex items-center space-x-1">
              {card.change > 0 ? (
                <ArrowUpIcon className="h-4 w-4 text-green-500" />
              ) : card.change < 0 ? (
                <ArrowDownIcon className="h-4 w-4 text-red-500" />
              ) : null}
              <span className={`text-sm ${card.change > 0 ? 'text-green-500' : card.change < 0 ? 'text-red-500' : ''}`}>
                {Math.abs(card.change).toFixed(1)}%
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value}</div>
            <p className="text-xs text-muted-foreground">
              {card.description}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              前回: {card.previousValue}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
