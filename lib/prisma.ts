import { PrismaClient } from '@prisma/client'
import { withAccelerate } from '@prisma/extension-accelerate'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Prisma Clientのインスタンスを生成
const prismaClient = new PrismaClient()

// 本番環境の場合のみ、Accelerate拡張を適用
const extendedPrismaClient =
  process.env.NODE_ENV === 'production'
    ? prismaClient.$extends(withAccelerate())
    : prismaClient

export const prisma = globalForPrisma.prisma ?? extendedPrismaClient

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = extendedPrismaClient as PrismaClient
}
