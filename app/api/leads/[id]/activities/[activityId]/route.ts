import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { auth } from '@/auth'

/**
 * @openapi
 * /api/leads/{id}/activities/{activityId}:
 *   put:
 *     summary: リードアクティビティ更新
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               type:
 *                 type: string 
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: リードアクティビティ更新
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LeadActivity'
 */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string; activityId: string }> }
) {
  try {
    const { id, activityId } = await params;
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

    const lead = await prisma.lead.findUnique({
      where: { id: id },
    })

    if (!lead) {
      return NextResponse.json({ error: 'リードが見つかりません' }, { status: 404 })
    }

    if (lead.organizationId !== user.organization.id) {
      return NextResponse.json({ error: '権限がありません' }, { status: 403 })
    }

    const activity = await prisma.leadActivity.findUnique({
      where: { id: activityId },
    })

    if (!activity) {
      return NextResponse.json({ error: 'アクティビティが見つかりません' }, { status: 404 })
    }

    const { type, description } = await request.json()

    const updatedActivity = await prisma.leadActivity.update({
      where: { id: activityId },
      data: {
        type,
        description,
      },
    })

    return NextResponse.json(updatedActivity)
  } catch (err) {
    console.error('エラー:', err)
    return NextResponse.json({ error: '内部サーバーエラー' }, { status: 500 })
  }
}

/**
 * @openapi
 * /api/leads/{id}/activities/{activityId}:
 *   delete:
 *     summary: リードアクティビティ削除
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *     responses:
 *       200:
 *         description: リードアクティビティ削除
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; activityId: string }> }
) {
  try {
    const { id, activityId } = await params;
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

    const lead = await prisma.lead.findUnique({
      where: { id: id },
    })

    if (!lead) {
      return NextResponse.json({ error: 'リードが見つかりません' }, { status: 404 })
    }

    if (lead.organizationId !== user.organization.id) {
      return NextResponse.json({ error: '権限がありません' }, { status: 403 })
    }

    const activity = await prisma.leadActivity.findUnique({
      where: { id: activityId },
    })

    if (!activity) {
      return NextResponse.json({ error: 'アクティビティが見つかりません' }, { status: 404 })
    }

    await prisma.leadActivity.delete({
      where: { id: activityId },
    })

    return NextResponse.json({ message: 'アクティビティを削除しました' })
  } catch (err) {
    console.error('エラー:', err)
    return NextResponse.json({ error: '内部サーバーエラー' }, { status: 500 })
  }
} 