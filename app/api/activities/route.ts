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

    const activities = await prisma.leadActivity.findMany({
      where: {
        lead: {
          organizationId: user.organization.id
        }
      },
      include: {
        lead: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    if (!activities) {
      return NextResponse.json({ error: 'アクティビティが見つかりません' }, { status: 404 })
    }

    return NextResponse.json(activities)
  } catch (err) {
    console.error('アクティビティ取得エラー:', err)
    if (err instanceof Error) {
      return NextResponse.json(
        { error: `アクティビティの取得に失敗しました: ${err.message}` },
        { status: 500 }
      )
    }
    return NextResponse.json(
      { error: 'アクティビティの取得に失敗しました' },
      { status: 500 }
    )
  }
} 