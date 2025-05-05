import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const organizations = await prisma.organization.findMany()

  for (const org of organizations) {
    await prisma.memoType.create({
      data: {
        name: '一般',
        color: '#808080',
        organizationId: org.id,
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