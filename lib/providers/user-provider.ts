import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export interface User {
  id: string
  name: string | null
  email: string
  email_verified: Date | null
  image: string | null
  role: 'admin' | 'store_manager' | 'store_staff' | null
  store_id: number | null
  created_at: Date | null
  updated_at: Date | null
}

export class UserProvider {
  /**
   * ユーザーIDからユーザー情報を取得
   */
  static async getUserById(id: string): Promise<User | null> {
    try {
      const user = await prisma.users.findUnique({
        where: { id },
      })
      return user
    } catch (error) {
      console.error('ユーザー情報の取得に失敗しました:', error)
      return null
    }
  }

  /**
   * メールアドレスからユーザー情報を取得
   */
  static async getUserByEmail(email: string): Promise<User | null> {
    try {
      const user = await prisma.users.findUnique({
        where: { email },
      })
      return user
    } catch (error) {
      console.error('ユーザー情報の取得に失敗しました:', error)
      return null
    }
  }

  /**
   * 店舗IDからユーザー一覧を取得
   */
  static async getUsersByStoreId(storeId: number): Promise<User[]> {
    try {
      const users = await prisma.users.findMany({
        where: { store_id: storeId },
      })
      return users
    } catch (error) {
      console.error('ユーザー一覧の取得に失敗しました:', error)
      return []
    }
  }

  /**
   * ユーザー情報を更新
   */
  static async updateUser(id: string, data: Partial<User>): Promise<User | null> {
    try {
      const user = await prisma.users.update({
        where: { id },
        data,
      })
      return user
    } catch (error) {
      console.error('ユーザー情報の更新に失敗しました:', error)
      return null
    }
  }
} 