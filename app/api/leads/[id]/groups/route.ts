import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { auth } from '@/auth'

/**
 * @openapi
 * /api/leads/{id}/groups:
 *   patch:
 *     summary: リードのグループ一括更新
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               groupIds:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: リードのグループ一括更新
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Lead'
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    const leadId =id

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

    const { groupIds } = await request.json()

    // トランザクションで一括処理
    await prisma.$transaction(async (tx) => {
      // 既存のグループ関連を削除
      await tx.leadGroup.deleteMany({
        where: {
          leadId: leadId
        }
      })

      // 新しいグループ関連を追加
      if (groupIds && groupIds.length > 0) {
        await tx.leadGroup.createMany({
          data: groupIds.map((groupId: string) => ({
            leadId: leadId,
            groupId: groupId,
            organizationId: user.organization!.id
          }))
        })
      }
    })

    // 更新されたリードを取得
    const updatedLead = await prisma.lead.findUnique({
      where: { id: leadId },
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