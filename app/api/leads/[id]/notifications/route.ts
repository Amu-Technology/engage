import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { auth } from '@/auth'

/**
 * @openapi
 * /api/leads/{id}/notifications:
 *   post:
 *     summary: リードの通知設定
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               days:
 *                 type: number
 *     responses:
 *       200:
 *         description: リードの通知設定
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotificationPreference'
 */
export async function POST(
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

    const lead = await prisma.lead.findUnique({
      where: { id: id },
    })

    if (!lead) {
      return NextResponse.json({ error: 'リードが見つかりません' }, { status: 404 })
    }

    if (lead.organizationId !== user.organization.id) {
      return NextResponse.json({ error: '権限がありません' }, { status: 403 })
    }

    const { email, days } = await request.json()

    const notification = await prisma.notificationPreference.upsert({
      where: {
        leadId: id,
      },
      update: {
        email: true,
        emailAddress: email,
        intervalDays: parseInt(days),
      },
      create: {
        leadId: id,
        email: true,
        emailAddress: email,
        intervalDays: parseInt(days),
        organizationId: user.organization.id
      },
    })

    return NextResponse.json(notification)
  } catch (err) {
    console.error('エラー:', err)
    return NextResponse.json({ error: '内部サーバーエラー' }, { status: 500 })
  }
} 