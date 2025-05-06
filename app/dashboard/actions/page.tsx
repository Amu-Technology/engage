'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { LeadActivityForm } from './components/LeadActivityForm'
import { GroupActivityForm } from './components/GroupActivityForm'

export default function ActionsPage() {
  return (
    <div className="container mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-bold">アクション設定</h1>
      <Tabs defaultValue="lead">
        <TabsList>
          <TabsTrigger value="lead">リード別</TabsTrigger>
          <TabsTrigger value="group">グループ別</TabsTrigger>
        </TabsList>
        <TabsContent value="lead">
          <Card>
            <CardHeader>
              <CardTitle>リード別アクション設定</CardTitle>
            </CardHeader>
            <CardContent>
              <LeadActivityForm />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="group">
          <Card>
            <CardHeader>
              <CardTitle>グループ別アクション設定</CardTitle>
            </CardHeader>
            <CardContent>
              <GroupActivityForm />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 