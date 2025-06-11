'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ActivityTypeManager } from './components/ActivityTypeManager'

export default function SettingsPage() {
  return (
    <div className="container mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-bold">設定</h1>
      <Card>
            <CardHeader>
              <CardTitle>アクティビティタイプの管理</CardTitle>
            </CardHeader>
            <CardContent>
              <ActivityTypeManager />
            </CardContent>
          </Card>

    </div>
  )
} 