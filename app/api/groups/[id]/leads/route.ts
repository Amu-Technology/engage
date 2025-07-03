import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { auth } from '@/auth'


export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const groupId = id;
  
  try {
    const session = await auth();
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

    const { leadIds } = await request.json()

    if (!Array.isArray(leadIds) || leadIds.length === 0) {
      return NextResponse.json({ error: 'リードIDが必要です' }, { status: 400 })
    }

    // トランザクションで一括処理
    await prisma.$transaction(async (tx) => {
      // 既存のリード関連を削除
      await tx.leadGroup.deleteMany({
        where: {
          groupId: groupId
        }
      })

      // 新しいリード関連を追加
      await tx.leadGroup.createMany({
        data: leadIds.map((leadId: string) => ({
          leadId,
          groupId,
          organizationId: user.organization!.id
        }))
      })
    })

    // 更新されたグループを取得
    const updatedGroup = await prisma.group.findUnique({
      where: { id: groupId },
      include: {
        leads: {
          include: {
            lead: true
          }
        }
      }
    })

    return NextResponse.json(updatedGroup)
  } catch (err) {
    console.error('エラー:', err)
    return NextResponse.json({ error: '内部サーバーエラー' }, { status: 500 })
  }
} 