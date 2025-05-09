import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

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
    const groupId = searchParams.get('groupId')

    if (!groupId) {
      return NextResponse.json({ error: 'グループIDが必要です' }, { status: 400 })
    }

    // グループの存在確認と権限チェック
    const group = await prisma.group.findFirst({
      where: {
        id: groupId,
        organizationId: user.organization.id
      }
    })

    if (!group) {
      return NextResponse.json({ error: 'グループが見つかりません' }, { status: 404 })
    }

    // グループに所属するリードのアクティビティを取得
    const activities = await prisma.leadActivity.findMany({
      where: {
        lead: {
          groups: {
            some: {
              groupId
            }
          }
        },
        organizationId: user.organization.id
      },
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        activityType: true,
        lead: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    return NextResponse.json(activities)
  } catch (error) {
    console.error('エラー:', error)
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
    const { groupId, typeId, content, scheduledAt } = body

    if (!groupId || !typeId || !content) {
      return NextResponse.json(
        { error: '必要な情報が不足しています' },
        { status: 400 }
      )
    }

    // グループの存在確認と権限チェック
    const group = await prisma.group.findFirst({
      where: {
        id: groupId,
        organizationId: user.organization.id
      }
    })

    if (!group) {
      return NextResponse.json({ error: 'グループが見つかりません' }, { status: 404 })
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

    // グループに所属するすべてのリードを取得
    const groupLeads = await prisma.leadGroup.findMany({
      where: {
        groupId,
        lead: {
          organizationId: user.organization.id
        }
      },
      select: { leadId: true }
    })

    // トランザクションで一括処理
    const activities = await prisma.$transaction(async (tx) => {
      // 各リードに対してアクティビティを作成
      const createdActivities = await Promise.all(
        groupLeads.map(({ leadId }) =>
          tx.leadActivity.create({
            data: {
              leadId,
              typeId,
              type: activityType.name,
              description: content,
              organizationId: user.organization!.id,
              updatedAt: scheduledAt ? new Date(scheduledAt) : undefined
            },
            include: {
              activityType: true
            }
          })
        )
      )

      // 各リードの評価を更新
      await Promise.all(
        groupLeads.map(({ leadId }) =>
          tx.lead.update({
            where: { id: leadId },
            data: {
              evaluation: {
                increment: activityType.point
              }
            }
          })
        )
      )

      return createdActivities
    })

    return NextResponse.json(activities)
  } catch (error) {
    console.error('エラー:', error)
    return NextResponse.json(
      { error: 'アクティビティの作成に失敗しました' },
      { status: 500 }
    )
  }
} 