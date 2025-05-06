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

    const activityTypes = await prisma.activityType.findMany({
      where: { organizationId: user.organization.id },
      orderBy: { name: 'asc' }
    })

    return NextResponse.json(activityTypes || [])
  } catch (err) {
    console.error('エラー:', err)
    return NextResponse.json(
      { error: 'アクティビティタイプの取得に失敗しました' },
      { status: 500 }
    )
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
      include: { organization: true }
    })

    if (!user?.organization) {
      return NextResponse.json({ error: '組織が見つかりません' }, { status: 404 })
    }

    const { name, color } = await request.json()

    if (!name) {
      return NextResponse.json(
        { error: 'アクティビティタイプ名は必須です' },
        { status: 400 }
      )
    }

    const activityType = await prisma.activityType.create({
      data: {
        name,
        color,
        organizationId: user.organization.id
      }
    })

    return NextResponse.json(activityType)
  } catch (err) {
    console.error('エラー:', err)
    return NextResponse.json(
      { error: 'アクティビティタイプの作成に失敗しました' },
      { status: 500 }
    )
  }
} 