import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

/**
 * @openapi
 * /api/public/participation/[participationId]/cancel:
 *   post:
 *     summary: 参加申込のキャンセル
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
 *         description: 参加申込のキャンセル
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       400:
 *         description: 参加申込IDが必要です
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       404:
 *         description: 参加申込が見つかりません
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       500:
 *         description: 参加申込のキャンセルに失敗しました
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ participationId: string }> }
) {
  try {
    const { participationId } = await params;

    if (!participationId) {
      return NextResponse.json(
        { error: "参加申込IDが必要です" },
        { status: 400 }
      );
    }

    // 参加申込を検索
    const participation = await prisma.eventParticipation.findUnique({
      where: { id: participationId },
      include: {
        event: true,
      },
    });

    if (!participation) {
      return NextResponse.json(
        { error: "参加申込が見つかりません" },
        { status: 404 }
      );
    }

    // キャンセル可能なステータスかチェック
    if (participation.status === 'CANCELLED') {
      return NextResponse.json(
        { error: "既にキャンセル済みです" },
        { status: 400 }
      );
    }

    if (participation.status === 'CONFIRMED') {
      return NextResponse.json(
        { error: "参加確定済みのためキャンセルできません" },
        { status: 400 }
      );
    }

    // 参加申込をキャンセルに更新
    const updatedParticipation = await prisma.eventParticipation.update({
      where: { id: participationId },
      data: {
        status: 'CANCELLED',
        responseDate: new Date(),
      },
    });

    return NextResponse.json({
      message: "参加申込をキャンセルしました",
      participation: {
        id: updatedParticipation.id,
        status: updatedParticipation.status,
        responseDate: updatedParticipation.responseDate,
      },
    });

  } catch (error) {
    console.error("参加申込キャンセルエラー:", error);
    return NextResponse.json(
      { error: "キャンセルに失敗しました" },
      { status: 500 }
    );
  }
} 