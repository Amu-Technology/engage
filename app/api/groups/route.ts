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

    const groups = await prisma.group.findMany({
      where: { organizationId: user.organization.id },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(groups)
  } catch (error) {
    console.error('エラー:', error)
    return NextResponse.json(
      { error: 'グループの取得に失敗しました' },
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
      include: { organization: true },
    })

    if (!user?.organization) {
      return NextResponse.json({ error: '組織が見つかりません' }, { status: 404 })
    }

    const { name } = await request.json()

    if (!name) {
      return NextResponse.json(
        { error: 'グループ名が必要です' },
        { status: 400 }
      )
    }

    const group = await prisma.group.create({
      data: {
        name,
        organizationId: user.organization.id,
      },
    })

    return NextResponse.json(group)
  } catch (error) {
    console.error('エラー:', error)
    return NextResponse.json(
      { error: 'グループの作成に失敗しました' },
      { status: 500 }
    )
  }
} 