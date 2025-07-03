import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { parse } from 'csv-parse/sync'

interface CsvRecord {
  name: string
  email?: string
  phone?: string
  status?: string
  evaluation?: string
  type?: string
  nameReading?: string
  nickname?: string
  district?: string
  homePhone?: string
  mobilePhone?: string
  company?: string
  position?: string
  postalCode?: string
  address?: string
  referrer?: string
  isPaid?: string
}

/**
 * @openapi
 * /api/leads/import:
 *   post:
 *     summary: CSVファイルをインポート
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: インポート完了
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { organization: true }
    })

    if (!user?.organization) {
      return NextResponse.json({ error: '組織が見つかりません' }, { status: 404 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    if (!file) {
      return NextResponse.json({ error: 'ファイルが必要です' }, { status: 400 })
    }

    const content = await file.text()
    const records = parse(content, {
      columns: true,
      skip_empty_lines: true
    })

    const leads = records.map((record: CsvRecord) => {
      if (!user.organization) {
        throw new Error('組織が見つかりません')
      }
      return {
        organizationId: user.organization.id,
        name: record.name,
        email: record.email || null,
        phone: record.phone || null,
        status: record.status || 'potential',
        evaluation: record.evaluation ? parseInt(record.evaluation) : null,
        type: record.type || 'individual',
        nameReading: record.nameReading || null,
        nickname: record.nickname || null,
        district: record.district || null,
        homePhone: record.homePhone || null,
        mobilePhone: record.mobilePhone || null,
        company: record.company || null,
        position: record.position || null,
        postalCode: record.postalCode || null,
        address: record.address || null,
        referrer: record.referrer || null,
        isPaid: record.isPaid === 'true'
      }
    })

    await prisma.lead.createMany({
      data: leads,
      skipDuplicates: true
    })

    return NextResponse.json({ message: 'インポートが完了しました' })
  } catch (error) {
    console.error('エラー:', error)
    return NextResponse.json(
      { error: 'CSVのインポートに失敗しました' },
      { status: 500 }
    )
  }
} 