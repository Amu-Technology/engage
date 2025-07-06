import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * @openapi
 * /api/organizations:
 *   get:
 *     summary: 組織一覧の取得
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               organizationId:
 *                 type: string
 *     responses:
 *       200:
 *         description: 組織一覧の取得
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Organization'
 *       500:
 *         description: 組織一覧の取得に失敗しました
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       400:
 *         description: 組織一覧の取得に失敗しました
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
export async function GET() {
  try {
    const organizations = await prisma.organization.findMany({
      include: {
        users: true,
      },
    });
    return NextResponse.json(organizations);
  } catch (error) {
    console.error('組織一覧の取得に失敗しました:', error);
    return NextResponse.json(
      { error: '組織一覧の取得に失敗しました' },
      { status: 500 }
    );
  }
}

/**
 * @openapi
 * /api/organizations:
 *   post:
 *     summary: 組織の作成
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       200:
 *         description: 組織の作成
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Organization'
 *       500:
 *         description: 組織の作成に失敗しました
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
export async function POST(request: Request) {
  try {
    const { name } = await request.json();

    if (!name) {
      return NextResponse.json(
        { error: '組織名は必須です' },
        { status: 400 }
      );
    }

    const organization = await prisma.organization.create({
      data: {
        name,
      },
    });

    return NextResponse.json(organization);
  } catch (error) {
    console.error('組織の作成に失敗しました:', error);
    return NextResponse.json(
      { error: '組織の作成に失敗しました' },
      { status: 500 }
    );
  }
}

/**
 * @openapi
 * /api/organizations:
 *   put:
 *     summary: 組織の更新
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *               name:
 *                 type: string
 *     responses:
 *       200:
 *         description: 組織の更新
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Organization'
 *       500:
 *         description: 組織の更新に失敗しました
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
export async function PUT(request: Request) {
  try {
    const { id, name } = await request.json();

    if (!id || !name) {
      return NextResponse.json(
        { error: 'IDと組織名は必須です' },
        { status: 400 }
      );
    }

    const organization = await prisma.organization.update({
      where: { id },
      data: { name },
    });

    return NextResponse.json(organization);
  } catch (error) {
    console.error('組織の更新に失敗しました:', error);
    return NextResponse.json(
      { error: '組織の更新に失敗しました' },
      { status: 500 }
    );
  }
}

/**
 * @openapi
 * /api/organizations:
 *   delete:
 *     summary: 組織の削除
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
 *         description: 組織の削除
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'IDは必須です' },
        { status: 400 }
      );
    }

    await prisma.organization.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({ message: '組織を削除しました' });
  } catch (error) {
    console.error('組織の削除に失敗しました:', error);
    return NextResponse.json(
      { error: '組織の削除に失敗しました' },
      { status: 500 }
    );
  }
} 