import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { auth } from '@/auth'

/**
 * @openapi
 * /api/leads/{id}/status-history:
 *   get:
 *     summary: リードのステータス履歴取得
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               leadId:
 *                 type: string
 *     responses:
 *       200:
 *         description: リードのステータス履歴
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/LeadStatusHistory'
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const leadId = id;
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

    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
    })

    if (!lead) {
      return NextResponse.json({ error: 'リードが見つかりません' }, { status: 404 })
    }

    if (lead.organizationId !== user.organization.id) {
      return NextResponse.json({ error: '権限がありません' }, { status: 403 })
    }

    const statusHistory = await prisma.leadStatusHistory.findMany({
      where: { 
        leadId,
        organizationId: user.organization.id
      },
      include: {
        oldStatus: true,
        newStatus: true,
      },
      orderBy: { updatedAt: 'desc' },
    })

    return NextResponse.json(statusHistory)
  } catch (err) {
    console.error('エラー:', err)
    return NextResponse.json(
      { error: 'ステータス履歴の取得に失敗しました' },
      { status: 500 }
    )
  }
} 