import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { auth } from "@/auth";

// PUT: アクティビティタイプの更新
/**
 * @openapi
 * /api/activity-types/{id}:
 *   put:
 *     summary: アクティビティタイプ更新
 *     description: 指定したアクティビティタイプを更新します。
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
 *               name:
 *                 type: string
 *               color:
 *                 type: string
 *               point:
 *                 type: integer
 *     responses:
 *       200:
 *         description: 更新されたアクティビティタイプ
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ActivityType'
 */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
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

    const { name, color, point } = await request.json();

    const activityType = await prisma.activityType.update({
      where: {
        id,
        organizationId: user.organization.id,
      },
      data: {
        name,
        color,
        point,
      },
    });

    return NextResponse.json(activityType);
  } catch (error) {
    console.error("エラー:", error);
    return NextResponse.json(
      { error: "アクティビティタイプの更新に失敗しました" },
      { status: 500 }
    );
  }
}

// DELETE: アクティビティタイプの削除
/**
 * @openapi
 * /api/activity-types/{id}:
 *   delete:
 *     summary: アクティビティタイプ削除
 *     description: 指定したアクティビティタイプを削除します。
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 削除されたアクティビティタイプ
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ActivityType'
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
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

    const activityType = await prisma.activityType.findUnique({
      where: { id },
    });

    if (!activityType) {
      return NextResponse.json(
        { error: "アクティビティタイプが見つかりません" },
        { status: 404 }
      );
    }

    if (activityType.organizationId !== user.organization.id) {
      return NextResponse.json({ error: "権限がありません" }, { status: 403 });
    }

    await prisma.activityType.delete({
      where: { id },
    });

    return NextResponse.json({ message: "アクティビティタイプを削除しました" });
  } catch (err) {
    console.error("エラー:", err);
    return NextResponse.json(
      { error: "アクティビティタイプの削除に失敗しました" },
      { status: 500 }
    );
  }
}
