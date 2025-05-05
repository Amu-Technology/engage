import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { auth } from '@/auth'

export async function GET() {
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

    const leads = await prisma.lead.findMany({
      where: { organizationId: user.organization.id },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(leads)
  } catch (error) {
    console.error('エラー:', error)
    return NextResponse.json(
      { error: 'リード一覧の取得に失敗しました' },
      { status: 500 }
    )
  }
} 