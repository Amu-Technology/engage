import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { auth } from '@/auth'

export async function POST(
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
      include: { organization: true },
    })

    if (!user?.organization) {
      return NextResponse.json({ error: '組織が見つかりません' }, { status: 404 })
    }

    const lead = await prisma.lead.findUnique({
      where: { id: params.id },
    })

    if (!lead) {
      return NextResponse.json({ error: 'リードが見つかりません' }, { status: 404 })
    }

    if (lead.organizationId !== user.organization.id) {
      return NextResponse.json({ error: '権限がありません' }, { status: 403 })
    }

    const { email, days } = await request.json()

    const notification = await prisma.notificationPreference.upsert({
      where: {
        leadId: params.id,
      },
      update: {
        email: true,
        emailAddress: email,
        intervalDays: parseInt(days),
      },
      create: {
        leadId: params.id,
        email: true,
        emailAddress: email,
        intervalDays: parseInt(days),
      },
    })

    return NextResponse.json(notification)
  } catch (err) {
    console.error('エラー:', err)
    return NextResponse.json({ error: '内部サーバーエラー' }, { status: 500 })
  }
} 