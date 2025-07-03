import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

/**
 * @openapi
 * /api/public/events/[accessToken]:
 *   get:
 *     summary: 公開イベント情報取得
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               accessToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: 公開イベント情報取得
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 title:
 *                   type: string
 *                 description:
 *                   type: string
 *                 startDate:
 *                   type: string
 *                 endDate:
 *                   type: string
 *                 location:
 *                   type: string
 *                 maxParticipants:
 *                   type: number
 *                 registrationStart:
 *                   type: string
 *                 registrationEnd:
 *                   type: string
 *                 isPublic:
 *                   type: boolean
 *                 accessToken:
 *                   type: string
 *                 _count:
 *                   type: object
 *                 properties:
 *                   participations:
 *                     type: number
 *       400:
 *         description: アクセストークンが必要です
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       404:
 *         description: イベントが見つかりません
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       500:
 *         description: イベント情報の取得に失敗しました
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
  { params }: { params: Promise<{ accessToken: string }> }
) {
  try {
    const { accessToken } = await params;

    if (!accessToken) {
      return NextResponse.json(
        { error: "アクセストークンが必要です" },
        { status: 400 }
      );
    }

    // アクセストークンでイベントを検索
    const event = await prisma.event.findFirst({
      where: {
        accessToken: accessToken,
        isPublic: true,
      },
      include: {
        _count: {
          select: {
            participations: {
              where: { 
                status: { in: ['CONFIRMED', 'PENDING'] }
              }
            }
          }
        },
      },
    });

    if (!event) {
      return NextResponse.json(
        { error: "イベントが見つかりません" },
        { status: 404 }
      );
    }

    // 定員チェック
    const currentParticipants = event._count.participations;

    // フロントエンドが期待する形式でイベント情報を返す
    return NextResponse.json({
      id: event.id,
      title: event.title,
      description: event.description,
      startDate: event.startDate.toISOString(),
      endDate: event.endDate.toISOString(),
      location: event.location,
      maxParticipants: event.maxParticipants,
      registrationStart: event.registrationStart?.toISOString() || null,
      registrationEnd: event.registrationEnd?.toISOString() || null,
      isPublic: event.isPublic,
      accessToken: event.accessToken,
      _count: {
        participations: currentParticipants,
      },
    });

  } catch (error) {
    console.error("公開イベント情報取得エラー:", error);
    return NextResponse.json(
      { error: "イベント情報の取得に失敗しました" },
      { status: 500 }
    );
  }
}