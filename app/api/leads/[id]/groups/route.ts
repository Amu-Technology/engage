import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { auth } from '@/auth'

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
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

    // リードの存在確認と権限チェック
    const lead = await prisma.lead.findFirst({
      where: {
        id: params.id,
        organizationId: user.organization.id
      }
    })

    if (!lead) {
      return NextResponse.json({ error: 'リードが見つかりません' }, { status: 404 })
    }

    const { groupIds } = await request.json()

    // トランザクションで一括処理
    await prisma.$transaction(async (tx) => {
      // 既存のグループ関連を削除
      await tx.leadGroup.deleteMany({
        where: {
          leadId: params.id
        }
      })

      // 新しいグループ関連を追加
      if (groupIds && groupIds.length > 0) {
        await tx.leadGroup.createMany({
          data: groupIds.map((groupId: string) => ({
            leadId: params.id,
            groupId: groupId
          }))
        })
      }
    })

    // 更新されたリードを取得
    const updatedLead = await prisma.lead.findUnique({
      where: { id: params.id },
      include: {
        groups: {
          include: {
            group: true
          }
        }
      }
    })

    return NextResponse.json(updatedLead)
  } catch (err) {
    console.error('エラー:', err)
    return NextResponse.json({ error: '内部サーバーエラー' }, { status: 500 })
  }
} 