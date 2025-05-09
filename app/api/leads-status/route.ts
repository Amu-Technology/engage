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
      include: { organization: true },
    })

    if (!user?.organization) {
      return NextResponse.json({ error: '組織が見つかりません' }, { status: 404 })
    }

    const leadsStatuses = await prisma.leadsStatus.findMany({
      where: { organizationId: user.organization.id },
      orderBy: { createdAt: 'asc' },
    })

    return NextResponse.json(leadsStatuses)
  } catch (err) {
    console.error('エラー:', err)
    return NextResponse.json({ error: '内部サーバーエラー' }, { status: 500 })
  }
}

export async function POST(request: Request) {
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

    const { name, color } = await request.json()

    if (!name) {
      return NextResponse.json({ error: 'ステータス名は必須です' }, { status: 400 })
    }

    const leadsStatus = await prisma.leadsStatus.create({
      data: {
        name,
        color,
        organizationId: user.organization.id,
      },
    })

    return NextResponse.json(leadsStatus)
  } catch (err) {
    console.error('エラー:', err)
    return NextResponse.json({ error: '内部サーバーエラー' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
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

    const { id, name, color } = await request.json()

    if (!name) {
      return NextResponse.json({ error: 'ステータス名は必須です' }, { status: 400 })
    }

    // 更新対象のステータスが同じ組織に属しているか確認
    const existingStatus = await prisma.leadsStatus.findFirst({
      where: {
        id,
        organizationId: user.organization.id
      }
    })

    if (!existingStatus) {
      return NextResponse.json({ error: 'ステータスが見つかりません' }, { status: 404 })
    }

    const leadsStatus = await prisma.leadsStatus.update({
      where: { id },
      data: {
        name,
        color
      }
    })

    return NextResponse.json(leadsStatus)
  } catch (err) {
    console.error('エラー:', err)
    return NextResponse.json({ error: '内部サーバーエラー' }, { status: 500 })
  }
} 