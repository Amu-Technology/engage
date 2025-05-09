import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { Prisma } from '@prisma/client'

export async function GET(request: Request) {
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

    const { searchParams } = new URL(request.url)
    const leadId = searchParams.get('leadId')
    const groupId = searchParams.get('groupId')

    const where: Prisma.LeadActivityWhereInput = {
      organizationId: user.organization.id
    }

    if (leadId) {
      where.leadId = leadId
    } else if (groupId) {
      where.lead = {
        groups: {
          some: {
            groupId
          }
        }
      }
    }

    const activities = await prisma.leadActivity.findMany({
      where,
      select: {
        id: true,
        type: true,
        typeId: true,
        description: true,
        createdAt: true,
        updatedAt: true,
        lead: {
          select: {
            id: true,
            name: true
          }
        },
        activityType: {
          select: {
            id: true,
            name: true,
            point: true,
            color: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    

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

    const body = await request.json()
    const { leadId, typeId, description, scheduledAt, type } = body

    if (!leadId || !typeId || !description || !type) {
      return NextResponse.json(
        { error: '必要な情報が不足しています' },
        { status: 400 }
      )
    }

    // リードの存在確認と権限チェック
    const lead = await prisma.lead.findFirst({
      where: {
        id: leadId,
        organizationId: user.organization.id
      }
    })

    if (!lead) {
      return NextResponse.json({ error: 'リードが見つかりません' }, { status: 404 })
    }

    // アクティビティタイプの取得
    const activityType = await prisma.activityType.findFirst({
      where: {
        id: typeId,
        organizationId: user.organization.id
      }
    })

    if (!activityType) {
      return NextResponse.json({ error: 'アクティビティタイプが見つかりません' }, { status: 404 })
    }

    // トランザクションで処理
    const [activity] = await prisma.$transaction([
      // アクティビティの作成
      prisma.leadActivity.create({
        data: {
          leadId,
          typeId,
          type,
          description,
          organizationId: user.organization.id,
          updatedAt: scheduledAt ? new Date(scheduledAt) : undefined
        },
        include: {
          activityType: true
        }
      }),
      // リードの評価を更新
      prisma.lead.update({
        where: { id: leadId },
        data: {
          evaluation: {
            increment: activityType.point
          }
        }
      })
    ])

    return NextResponse.json(activity)
  } catch (error) {
    console.error('エラー:', error)
    return NextResponse.json(
      { error: 'アクティビティの作成に失敗しました' },
      { status: 500 }
    )
  }
} 