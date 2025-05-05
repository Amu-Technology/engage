import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { auth } from '@/auth'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
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

    const lead = await prisma.lead.findUnique({
      where: {
        id: params.id,
        organizationId: user.organization.id,
      },
    })

    if (!lead) {
      return NextResponse.json({ error: 'リードが見つかりません' }, { status: 404 })
    }

    return NextResponse.json(lead)
  } catch (error) {
    console.error('エラー:', error)
    return NextResponse.json(
      { error: 'リードの取得に失敗しました' },
      { status: 500 }
    )
  }
} 