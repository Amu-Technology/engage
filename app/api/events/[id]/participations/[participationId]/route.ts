import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

// バリデーションスキーマ
const updateParticipationSchema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'DECLINED', 'CANCELLED', 'WAITLIST']),
  note: z.string().optional(),
});

// PUT /api/events/[id]/participations/[participationId] - 参加状況変更
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; participationId: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { organization: true },
    });

    if (!user?.org_id) {
      return NextResponse.json(
        { error: "組織に所属していません" },
        { status: 404 }
      );
    }

    const eventId = params.id;
    const participationId = params.participationId;
    const body = await request.json();

    // バリデーション
    const validatedData = updateParticipationSchema.parse(body);

    // 参加記録の存在確認と組織チェック
    const participation = await prisma.eventParticipation.findFirst({
      where: {
        id: participationId,
        eventId: eventId,
        organizationId: user.org_id,
      },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            maxParticipants: true,
            _count: {
              select: {
                participations: {
                  where: { status: 'CONFIRMED' }
                }
              }
            }
          }
        },
        lead: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    if (!participation) {
      return NextResponse.json(
        { error: "参加記録が見つかりません" },
        { status: 404 }
      );
    }

    const currentStatus = participation.status;
    const newStatus = validatedData.status;

    // ステータス変更のビジネスロジック
    let additionalUpdates: any = {};

    // 定員管理ロジック
    if (newStatus === 'CONFIRMED' && currentStatus !== 'CONFIRMED') {
      // 確定への変更
      const event = participation.event;
      const currentConfirmedCount = event._count.participations;
      
      if (event.maxParticipants && currentConfirmedCount >= event.maxParticipants) {
        return NextResponse.json(
          { error: "定員に達しているため確定できません" },
          { status: 400 }
        );
      }
      
      additionalUpdates.responseDate = new Date();
    } else if (currentStatus === 'CONFIRMED' && newStatus !== 'CONFIRMED') {
      // 確定からの変更 - ウェイトリストから自動昇格
      additionalUpdates.responseDate = new Date();
    }

    // 参加状況を更新
    const updatedParticipation = await prisma.$transaction(async (tx) => {
      // メインの参加記録を更新
      const updated = await tx.eventParticipation.update({
        where: { id: participationId },
        data: {
          status: newStatus,
          note: validatedData.note,
          ...additionalUpdates,
        },
        include: {
          lead: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
        },
      });

      // 確定から他のステータスに変更した場合、ウェイトリストから自動昇格
      if (currentStatus === 'CONFIRMED' && newStatus !== 'CONFIRMED') {
        const waitlistParticipation = await tx.eventParticipation.findFirst({
          where: {
            eventId: eventId,
            status: 'WAITLIST',
            organizationId: user.org_id,
          },
          orderBy: { registeredAt: 'asc' },
        });

        if (waitlistParticipation) {
          await tx.eventParticipation.update({
            where: { id: waitlistParticipation.id },
            data: {
              status: 'CONFIRMED',
              responseDate: new Date(),
            },
          });
        }
      }

      return updated;
    });

    return NextResponse.json({
      participation: {
        id: updatedParticipation.id,
        status: updatedParticipation.status,
        registeredAt: updatedParticipation.registeredAt,
        responseDate: updatedParticipation.responseDate,
        note: updatedParticipation.note,
        isExternal: updatedParticipation.isExternal,
        participant: updatedParticipation.isExternal ? {
          name: updatedParticipation.participantName,
          email: updatedParticipation.participantEmail,
          phone: updatedParticipation.participantPhone,
        } : updatedParticipation.lead,
      },
      message: "参加状況を更新しました",
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "入力データが無効です", details: error.errors },
        { status: 400 }
      );
    }

    console.error("参加状況更新エラー:", error);
    return NextResponse.json(
      { error: "参加状況の更新に失敗しました" },
      { status: 500 }
    );
  }
}

// DELETE /api/events/[id]/participations/[participationId] - 参加取消
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; participationId: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { organization: true },
    });

    if (!user?.org_id) {
      return NextResponse.json(
        { error: "組織に所属していません" },
        { status: 404 }
      );
    }

    const eventId = params.id;
    const participationId = params.participationId;

    // 参加記録の存在確認と組織チェック
    const participation = await prisma.eventParticipation.findFirst({
      where: {
        id: participationId,
        eventId: eventId,
        organizationId: user.org_id,
      },
    });

    if (!participation) {
      return NextResponse.json(
        { error: "参加記録が見つかりません" },
        { status: 404 }
      );
    }

    const wasConfirmed = participation.status === 'CONFIRMED';

    // 参加記録を削除し、必要に応じてウェイトリストから昇格
    await prisma.$transaction(async (tx) => {
      // 参加記録を削除
      await tx.eventParticipation.delete({
        where: { id: participationId },
      });

      // 確定参加者が削除された場合、ウェイトリストから自動昇格
      if (wasConfirmed) {
        const waitlistParticipation = await tx.eventParticipation.findFirst({
          where: {
            eventId: eventId,
            status: 'WAITLIST',
            organizationId: user.org_id,
          },
          orderBy: { registeredAt: 'asc' },
        });

        if (waitlistParticipation) {
          await tx.eventParticipation.update({
            where: { id: waitlistParticipation.id },
            data: {
              status: 'CONFIRMED',
              responseDate: new Date(),
            },
          });
        }
      }
    });

    return NextResponse.json({
      message: "参加申込を取り消しました",
    });

  } catch (error) {
    console.error("参加取消エラー:", error);
    return NextResponse.json(
      { error: "参加取消に失敗しました" },
      { status: 500 }
    );
  }
}