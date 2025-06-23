import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// 参加者とLeadを紐付ける
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; participationId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { organization: true }
    });

    if (!user?.org_id) {
      return NextResponse.json({ error: '組織に所属していません' }, { status: 404 });
    }

    const { id: eventId, participationId } = await params;
    const { leadId } = await request.json();

    if (!leadId) {
      return NextResponse.json({ error: 'Lead IDが必要です' }, { status: 400 });
    }

    // 参加記録の存在確認と組織チェック
    const participation = await prisma.eventParticipation.findFirst({
      where: {
        id: participationId,
        eventId: eventId,
        organizationId: user.org_id
      }
    });

    if (!participation) {
      return NextResponse.json({ error: '参加記録が見つかりません' }, { status: 404 });
    }

    // Leadの存在確認と組織チェック
    const lead = await prisma.lead.findFirst({
      where: {
        id: leadId,
        organizationId: user.org_id
      }
    });

    if (!lead) {
      return NextResponse.json({ error: 'Leadが見つかりません' }, { status: 404 });
    }

    // 参加記録を更新
    const updatedParticipation = await prisma.eventParticipation.update({
      where: { id: participationId },
      data: { leadId: leadId },
      include: {
        lead: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    return NextResponse.json(updatedParticipation);
  } catch (error) {
    console.error('Lead紐付けエラー:', error);
    return NextResponse.json(
      { error: 'Leadとの紐付けに失敗しました' },
      { status: 500 }
    );
  }
} 