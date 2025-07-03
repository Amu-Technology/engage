import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

/**
 * @openapi
 * /api/public/participation/[participationId]/status:
 *   get:
 *     summary: 参加状況確認
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               participationId:
 *                 type: string
 *     responses:
 *       200:
 *         description: 参加状況確認
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 participation:
 *                   type: object
 *                 event:
 *                   type: object
 *                 message:
 *                   type: string
 *                 statusInfo:
 *                   type: object
 *                 error:
 *                   type: string
 *       400:
 *         description: 参加IDが必要です
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       404:
 *         description: 参加記録が見つかりません
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       500:
 *         description: 参加状況の確認に失敗しました
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ participationId: string }> }
) {
  try {
    const { participationId } = await params;

    if (!participationId) {
      return NextResponse.json(
        { error: "参加IDが必要です" },
        { status: 400 }
      );
    }

    // 参加記録を取得（外部ユーザーのみ）
    const participation = await prisma.eventParticipation.findFirst({
      where: {
        id: participationId,
        isExternal: true,
      },
      select: {
        id: true,
        status: true,
        registeredAt: true,
        responseDate: true,
        note: true,
        participantName: true,
        participantEmail: true,
        participantPhone: true,
        participantAddress: true,
        eventId: true,
        event: {
          select: {
            id: true,
            title: true,
            description: true,
            startDate: true,
            endDate: true,
            location: true,
            maxParticipants: true,
            _count: {
              select: {
                participations: {
                  where: { status: 'CONFIRMED' }
                }
              }
            }
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

    // ステータス別のメッセージ
    const getStatusMessage = (status: string) => {
      switch (status) {
        case 'PENDING':
          return "参加申込を受け付けました。確定のご連絡をお待ちください。";
        case 'CONFIRMED':
          return "参加が確定しました！当日お待ちしております。";
        case 'DECLINED':
          return "参加をお断りさせていただきました。";
        case 'CANCELLED':
          return "参加申込がキャンセルされました。";
        case 'WAITLIST':
          return "現在キャンセル待ちです。空きが出次第、ご連絡いたします。";
        default:
          return "状況を確認中です。";
      }
    };

    // ウェイトリストの場合、現在の順番を計算
    let waitlistPosition = null;
    if (participation.status === 'WAITLIST') {
      const earlierWaitlistCount = await prisma.eventParticipation.count({
        where: {
          eventId: participation.eventId,
          status: 'WAITLIST',
          registeredAt: {
            lt: participation.registeredAt,
          },
        },
      });
      waitlistPosition = earlierWaitlistCount + 1;
    }

    const event = participation.event;
    const confirmedCount = event._count.participations;

    return NextResponse.json({
      participation: {
        id: participation.id,
        status: participation.status,
        registeredAt: participation.registeredAt,
        responseDate: participation.responseDate,
        note: participation.note,
        participant: {
          name: participation.participantName,
          email: participation.participantEmail,
          phone: participation.participantPhone,
          address: participation.participantAddress,
        },
        waitlistPosition,
      },
      event: {
        id: event.id,
        title: event.title,
        description: event.description,
        startDate: event.startDate,
        endDate: event.endDate,
        location: event.location,
        maxParticipants: event.maxParticipants,
        currentConfirmedParticipants: confirmedCount,
        availableSpots: event.maxParticipants 
          ? Math.max(0, event.maxParticipants - confirmedCount)
          : null,
      },
      message: getStatusMessage(participation.status),
      statusInfo: {
        isPending: participation.status === 'PENDING',
        isConfirmed: participation.status === 'CONFIRMED',
        isDeclined: participation.status === 'DECLINED',
        isCancelled: participation.status === 'CANCELLED',
        isWaitlist: participation.status === 'WAITLIST',
      },
    });

  } catch (error) {
    console.error("参加状況確認エラー:", error);
    return NextResponse.json(
      { error: "参加状況の確認に失敗しました" },
      { status: 500 }
    );
  }
}