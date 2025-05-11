'use client'

import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"

interface Lead {
    id: string;
    name: string;
    nameReading: string | null;
    nickname: string | null;
    type: string;
    district: string | null;
    homePhone: string | null;
    mobilePhone: string | null;
    company: string | null;
    position: string | null;
    postalCode: string | null;
    address: string | null;
    email: string | null;
    referrer: string | null;
    evaluation: number | null;
    status: string;
    isPaid: boolean;
    groupId: string | null;
    group: {
      id: string;
      name: string;
    } | null;
    statusId: string | null;
    leadsStatus: {
      id: string;
      name: string;
      color: string | null;
    } | null;
    groups?: {
      id: string;
      groupId: string;
    }[];
  }

interface CsvExportProps {
  selectedLeads: Lead[]
}

export function CsvExport({ selectedLeads }: CsvExportProps) {
  const handleExport = () => {
    if (selectedLeads.length === 0) {
      return
    }

    // CSVヘッダー
    const headers = [
      'name',
      'nameReading',
      'nickname',
      'type',
      'district',
      'homePhone',
      'mobilePhone',
      'company',
      'position',
      'postalCode',
      'address',
      'email',
      'referrer',
      'evaluation',
      'status',
      'isPaid'
    ]

    // CSVデータの作成
    const csvData = selectedLeads.map(lead => [
      lead.name,
      lead.nameReading || '',
      lead.nickname || '',
      lead.type,
      lead.district || '',
      lead.homePhone || '',
      lead.mobilePhone || '',
      lead.company || '',
      lead.position || '',
      lead.postalCode || '',
      lead.address || '',
      lead.email || '',
      lead.referrer || '',
      lead.evaluation || '',
      lead.status,
      lead.isPaid ? 'true' : 'false'
    ])

    // CSV文字列の作成
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    // Blobの作成とダウンロード
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `leads_export_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  return (
    <Button
      variant="outline"
      onClick={handleExport}
      disabled={selectedLeads.length === 0}
    >
      <Download className="mr-2 h-4 w-4" />
      CSVエクスポート
    </Button>
  )
} 