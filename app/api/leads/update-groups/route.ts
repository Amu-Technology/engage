import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { auth } from '@/auth'

/**
 * @openapi
 * /api/leads/update-groups:
 *   post:
 *     summary: リードのグループ一括更新
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               leadIds:
 *                 type: array
 *                 items:
 *                   type: string
 *               groupId:
 *                 type: string
 *     responses:
 *       200:
 *         description: リードのグループ一括更新
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
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
    if (groupId) {
      await prisma.leadGroup.createMany({
        data: leadIds.map(leadId => ({
          leadId,
          groupId,
          organizationId: user.organization!.id
        })),
        skipDuplicates: true
      })
    } else {
      await prisma.leadGroup.deleteMany({
        where: {
          leadId: { in: leadIds }
        }
      })
    }

    return NextResponse.json({ message: 'グループを更新しました' })
  } catch (error) {
    console.error('エラー:', error)
    return NextResponse.json(
      { error: 'グループの更新に失敗しました' },
      { status: 500 }
    )
  }
} 