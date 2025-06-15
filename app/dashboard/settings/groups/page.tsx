'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { GroupManager } from './components/GroupManager'

export default function GroupsSettingsPage() {
  return (
    <div className="container mx-auto p-4 space-y-4">
      <Tabs defaultValue="groups">
        <TabsContent value="groups">
          <Card>
            <CardHeader>
              <CardTitle>グループの作成</CardTitle>
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