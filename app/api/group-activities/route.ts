import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { groupId, type, content, scheduledAt } = body

    // グループに所属するすべてのリードを取得
    const groupLeads = await prisma.groupLead.findMany({
      where: { groupId },
      select: { leadId: true },
    })

    // 各リードに対してアクションを作成
    const activities = await Promise.all(
      groupLeads.map(({ leadId }) =>
        prisma.leadActivity.create({
          data: {
            leadId,
            type,
            content,
            scheduledAt: new Date(scheduledAt),
          },
        })
      )
    )

    return NextResponse.json(activities)
  } catch (error) {
    console.error('エラー:', error)
    return NextResponse.json(
      { error: 'アクションの作成に失敗しました' },
      { status: 500 }
    )
  }
} 