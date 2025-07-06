import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * @openapi
 * /api/family-members/{id}:
 *   put:
 *     summary: 家族メンバー更新
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               nameReading:
 *                 type: string
 *               relationship:
 *                 type: string
 *     responses:
 *       200:
 *         description: 家族メンバー更新
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FamilyMember'
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {

    const { id } = await params;
    const body = await request.json();
    const { name, nameReading, relationship } = body;

    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }
    const updatedMember = await prisma.familyMember.update({
      where: { id },
      data: { name, nameReading, relationship },
    });
    return NextResponse.json(updatedMember);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "サーバーエラー" }, { status: 500 });
  }
}

/**
 * @openapi
 * /api/family-members/{id}:
 *   delete:
 *     summary: 家族メンバー削除
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *     responses:
 *       200:
 *         description: 家族メンバー削除
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    await prisma.familyMember.delete({
      where: { id },
    });
    return NextResponse.json({ message: "削除しました" }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "サーバーエラー" }, { status: 500 });
  }
}
