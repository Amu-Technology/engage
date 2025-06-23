import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// GET /api/events/[id]/participations/stats - 参加状況統計取得
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
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

    // イベントの存在確認と組織チェック
    const event = await prisma.event.findFirst({
      where: {
        id: eventId,
        organizationId: user.org_id,
      },
    });

    if (!event) {
      return NextResponse.json(
        { error: "イベントが見つかりません" },
        { status: 404 }
      );
    }

    // 参加状況の統計を取得
    const participations = await prisma.eventParticipation.findMany({
      where: {
        eventId: eventId,
        organizationId: user.org_id,
      },
      select: {
        status: true,
      },
    });

    // 統計を計算
    const stats = {
      total: participations.length,
      confirmed: participations.filter(p => p.status === 'CONFIRMED').length,
      declined: participations.filter(p => p.status === 'DECLINED').length,
      waitlist: participations.filter(p => p.status === 'WAITLIST').length,
      pending: participations.filter(p => p.status === 'PENDING').length,
      cancelled: participations.filter(p => p.status === 'CANCELLED').length,
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error("参加状況統計取得エラー:", error);
    return NextResponse.json(
      { error: "参加状況統計の取得に失敗しました" },
      { status: 500 }
    );
  }
} 