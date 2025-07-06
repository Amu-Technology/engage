import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { auth } from "@/auth";

/**
 * @openapi
 * /api/leads/{id}/activities:
 *   post:
 *     summary: リードのアクティビティ作成
 *     description: 指定したリードに新しいアクティビティを作成します。
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               typeId:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: 作成されたアクティビティ
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LeadActivity'
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const leadId = id;

  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { organization: true },
    });

    if (!user?.organization) {
      return NextResponse.json(
        { error: "組織が見つかりません" },
        { status: 404 }
      );
    }

    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
      include: { organization: true },
    });

    if (!lead) {
      return NextResponse.json(
        { error: "リードが見つかりません" },
        { status: 404 }
      );
    }

    if (lead.organizationId !== user.organization.id) {
      return NextResponse.json({ error: "権限がありません" }, { status: 403 });
    }

    const { typeId, description } = await request.json();

    const activityType = await prisma.activityType.findUnique({
      where: { id: typeId },
    });

    if (!activityType) {
      return NextResponse.json(
        { error: "アクティビティタイプが見つかりません" },
        { status: 404 }
      );
    }

    const activity = await prisma.leadActivity.create({
      data: {
        description,
        type: activityType.name,
        typeId,
        leadId: leadId,
        organizationId: user.organization.id,
      },
    });

    console.log('activity', activity);

    // リードの評価を更新
    const currentLead = await prisma.lead.findUnique({
      where: { id: leadId },
      select: { evaluation: true },
    });

    await prisma.lead.update({
      where: { id: leadId },
      data: {
        evaluation: (currentLead?.evaluation || 0) + activityType.point,
      },
    });

    return NextResponse.json(activity);
  } catch (err) {
    console.error("エラー:", err);
    return NextResponse.json(
      { error: "アクティビティの作成に失敗しました" },
      { status: 500 }
    );
  }
}

/**
 * @openapi
 * /api/leads/{id}/activities:
 *   get:
 *     summary: リードのアクティビティ一覧取得
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
 *         description: リードのアクティビティ一覧
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/LeadActivity'
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const leadId = id;

  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { organization: true },
    });

    if (!user?.organization) {
      return NextResponse.json(
        { error: "組織が見つかりません" },
        { status: 404 }
      );
    }

    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
    });

    if (!lead) {
      return NextResponse.json(
        { error: "リードが見つかりません" },
        { status: 404 }
      );
    }

    if (lead.organizationId !== user.organization.id) {
      return NextResponse.json({ error: "権限がありません" }, { status: 403 });
    }

    const activities = await prisma.leadActivity.findMany({
      where: { leadId: leadId, organizationId: user.organization.id },
      select: {
        id: true,
        type: true,
        typeId: true,
        description: true,
        createdAt: true,
        updatedAt: true,
        lead: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(activities);
  } catch (err) {
    console.error("エラー:", err);
    return NextResponse.json({ error: "内部サーバーエラー" }, { status: 500 });
  }
}
