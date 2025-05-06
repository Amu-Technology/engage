import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // 組織を作成
  const organization = await prisma.organization.create({
    data: {
      name: 'デフォルト組織',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  })

  // 管理者ユーザーを作成または更新
  await prisma.user.upsert({
    where: {
      email: 'yanthemajisyan@gmail.com',
    },
    update: {
      name: '島田迅人',
      role: 'admin',
      org_id: organization.id,
      updatedAt: new Date(),
    },
    create: {
      name: '島田迅人',
      email: 'yanthemajisyan@gmail.com',
      role: 'admin',
      org_id: organization.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  })

  // デフォルトのステータスを作成
  const defaultStatuses = [
    { name: '潜在顧客', color: '#FFA500' },
    { name: '見込み顧客', color: '#4169E1' },
    { name: '商談中', color: '#32CD32' },
    { name: '成約', color: '#FF0000' },
  ]

  for (const status of defaultStatuses) {
    await prisma.leadsStatus.create({
      data: {
        ...status,
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
    await prisma.memoType.create({
      data: {
        ...type,
        organizationId: organization.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    })
  }

  // デフォルトのアクティビティタイプを作成
  const defaultActivityTypes = [
    { name: '電話', color: '#FFA500' },
    { name: 'メール', color: '#4169E1' },
    { name: '面談', color: '#32CD32' },
    { name: '訪問', color: '#9370DB' },
    { name: '提案', color: '#20B2AA' },
    { name: 'その他', color: '#808080' },
  ]

  for (const type of defaultActivityTypes) {
    await prisma.activityType.create({
      data: {
        ...type,
        organizationId: organization.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    })
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 