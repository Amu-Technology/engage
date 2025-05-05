import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { auth } from '@/auth'

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

    const { leadIds, groupId } = await request.json()

    if (!Array.isArray(leadIds) || leadIds.length === 0) {
      return NextResponse.json(
        { error: 'リードIDが必要です' },
        { status: 400 }
      )
    }

    // グループが存在するか確認
    if (groupId) {
      const group = await prisma.group.findUnique({
        where: { id: groupId },
      })

      if (!group || group.organizationId !== user.organization.id) {
        return NextResponse.json(
          { error: '無効なグループです' },
          { status: 400 }
        )
      }
    }

    // リードのグループを更新
    await prisma.lead.updateMany({
      where: {
        id: { in: leadIds },
        organizationId: user.organization.id,
      },
      data: {
        groupId: groupId || null,
      },
    })

    return NextResponse.json({ message: 'グループを更新しました' })
  } catch (error) {
    console.error('エラー:', error)
    return NextResponse.json(
      { error: 'グループの更新に失敗しました' },
      { status: 500 }
    )
  }
} 