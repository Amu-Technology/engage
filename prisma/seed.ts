import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // 組織を作成
  const organization = await prisma.organization.upsert({
    where: {
      id: 1
    },
    update: {
      name: 'デフォルト組織',
      updatedAt: new Date(),
    },
    create: {
      id: 1,
      name: 'デフォルト組織',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  })

  // デフォルトのステータスを作成
  const defaultStatuses = [
    { name: '潜在', color: '#FFA500' },
    { name: '見込', color: '#4169E1' },
    { name: 'アプローチ', color: '#32CD32' },
    { name: '会員', color: '#FF0000' },
  ]

  for (const status of defaultStatuses) {
    await prisma.leadsStatus.upsert({
      where: {
        id: `default-${status.name}`
      },
      update: {
        ...status,
        organizationId: organization.id,
        updatedAt: new Date(),
      },
      create: {
        id: `default-${status.name}`,
        ...status,
        organizationId: organization.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    })
  }

  // デフォルトのアクティビティタイプを作成
  const defaultActivityTypes = [
    { name: '電話', color: '#FFA500', point: 10 },
    { name: 'メール', color: '#4169E1', point: 5 },
    { name: '面談', color: '#32CD32', point: 30 },
    { name: '訪問', color: '#9370DB', point: 20 },
    { name: '提案', color: '#20B2AA', point: 10 },
    { name: '入金', color: '#FFD700', point: 50 },
    { name: 'イベント案内', color: '#FF6B6B', point: 15 },
    { name: 'イベント参加', color: '#3B82F6', point: 25 },
  ]

  for (const type of defaultActivityTypes) {
    await prisma.activityType.upsert({
      where: {
        id: `default-${type.name}`
      },
      update: {
        ...type,
        organizationId: organization.id,
        updatedAt: new Date(),
      },
      create: {
        id: `default-${type.name}`,
        ...type,
        organizationId: organization.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    })
  }

  // デフォルトのメモタイプを作成
  const defaultMemoTypes = [
    { name: '電話', color: '#FFA500' },
    { name: 'メール', color: '#4169E1' },
    { name: '面談', color: '#32CD32' },
    { name: 'その他', color: '#808080' },
  ]

  for (const type of defaultMemoTypes) {
    await prisma.memoType.upsert({
      where: {
        id: `default-${type.name}`
      },
      update: {
        ...type,
        organizationId: organization.id,
        updatedAt: new Date(),
      },
      create: {
        id: `default-${type.name}`,
        ...type,
        organizationId: organization.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    })
  }

  // 管理者ユーザーを作成または更新
  await prisma.user.upsert({
    where: {
      email: 'shimada_hayato@amu-lab.com',
    },
    update: {
      name: '島田迅人',
      role: 'admin',
      org_id: organization.id,
      updatedAt: new Date(),
    },
    create: {
      name: '島田迅人',
      email: 'shimada_hayato@amu-lab.com',
      role: 'admin',
      org_id: organization.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  })

    // ユーザーを作成または更新
    await prisma.user.upsert({
      where: {
        email: 'test@test.com',
      },
      update: {
        name: 'テストユーザー',
        role: 'admin',
        org_id: organization.id,
        updatedAt: new Date(),
      },
      create: {
        name: 'テストユーザー',
        email: 'test@test.com',
        role: 'admin',
        org_id: organization.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 