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
    const { groupId, type, content } = body

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

    // グループに所属するすべてのリードを取得
    const groupLeads = await prisma.leadGroup.findMany({
      where: { groupId },
      select: { leadId: true },
    })

    // 各リードに対してアクションを作成
    const activities = await Promise.all(
      groupLeads.map(({ leadId }: { leadId: string }) =>
        prisma.leadActivity.create({
          data: {
            lead: {
              connect: { id: leadId }
            },
            type,
            description: content
          }
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