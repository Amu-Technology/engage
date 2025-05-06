import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { auth } from '@/auth'

export async function GET(
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
      include: { organization: true }
    })

    if (!user?.organization) {
      return NextResponse.json({ error: '組織が見つかりません' }, { status: 404 })
    }

    const lead = await prisma.lead.findUnique({
      where: {
        id: params.id,
        organizationId: user.organization.id,
      },
    })

    if (!lead) {
      return NextResponse.json({ error: 'リードが見つかりません' }, { status: 404 })
    }

    return NextResponse.json(lead)
  } catch (err) {
    console.error('エラー:', err)
    return NextResponse.json(
      { error: 'リードの取得に失敗しました' },
      { status: 500 }
    )
  }
}

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

    const leadId = params.id
    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
      include: {
        leadsStatus: true
      }
    })

    if (!lead) {
      return NextResponse.json({ error: 'リードが見つかりません' }, { status: 404 })
    }

    if (lead.organizationId !== user.organization.id) {
      return NextResponse.json({ error: '権限がありません' }, { status: 403 })
    }

    const { statusId, isPaid } = await request.json()

    // トランザクションで更新と履歴記録を行う
    const updatedLead = await prisma.$transaction(async (tx) => {
      // 更新データの準備
      const updateData: { statusId?: string; isPaid?: boolean } = {}
      if (statusId !== undefined) updateData.statusId = statusId
      if (isPaid !== undefined) updateData.isPaid = isPaid

      // リードを更新
      const updated = await tx.lead.update({
        where: { id: leadId },
        data: updateData,
        include: {
          leadsStatus: true,
        },
      })

      // ステータスが変更された場合のみ履歴を記録
      if (statusId !== undefined && lead.statusId !== statusId) {
        await tx.leadStatusHistory.create({
          data: {
            leadId: lead.id,
            oldStatusId: lead.statusId,
            newStatusId: statusId,
          },
        })
      }

      return updated
    })

    return NextResponse.json(updatedLead)
  } catch (err) {
    console.error('エラー:', err)
    return NextResponse.json({ error: '内部サーバーエラー' }, { status: 500 })
  }
} 