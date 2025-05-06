'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { GroupManager } from './components/GroupManager'

export default function GroupsSettingsPage() {
  return (
    <div className="container mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-bold">設定</h1>
      <Tabs defaultValue="groups">
        <TabsList>
          <TabsTrigger value="groups">グループ</TabsTrigger>
        </TabsList>
        <TabsContent value="groups">
          <Card>
            <CardHeader>
              <CardTitle>グループの管理</CardTitle>
            </CardHeader>
            <CardContent>
              <GroupManager />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 