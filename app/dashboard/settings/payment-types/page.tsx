import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PaymentTypeManager } from './components/PaymentTypeManager';

export default function PaymentTypesSettingsPage() {
  return (
    <div className="container mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-bold">設定</h1>
      <Card>
        <CardHeader>
          <CardTitle>入金タイプの管理</CardTitle>
        </CardHeader>
        <CardContent>
          <PaymentTypeManager />
        </CardContent>
      </Card>
    </div>
  );
}