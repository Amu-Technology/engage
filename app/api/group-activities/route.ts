import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

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
    const { groupId, typeId, type, content, scheduledAt } = body

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
    const activityType = await prisma.activityType.findUnique({
      where: { id: typeId }
    })

    if (!activityType) {
      return NextResponse.json({ error: 'アクティビティタイプが見つかりません' }, { status: 404 })
    }

    // グループに所属するすべてのリードを取得
    const groupLeads = await prisma.leadGroup.findMany({
      where: { groupId },
      select: { leadId: true },
    })

    // トランザクションで一括処理
    const activities = await prisma.$transaction(async (tx) => {
      // 各リードに対してアクティビティを作成
      const createdActivities = await Promise.all(
        groupLeads.map(({ leadId }) =>
          tx.leadActivity.create({
            data: {
              lead: {
                connect: { id: leadId }
              },
              type,
              activityType: {
                connect: { id: typeId }
              },
              description: content,
              updatedAt: scheduledAt ? new Date(scheduledAt) : undefined
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