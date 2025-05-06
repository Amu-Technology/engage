import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { AdminDashboard } from '@/components/admin/AdminDashboard'

export default async function AdminPage() {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      redirect('/login')
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      throw new Error('ユーザー情報が見つかりません')
    }

    if (user.role !== 'admin') {
      throw new Error('このページにアクセスする権限がありません')
    }

    return <AdminDashboard />
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }
    throw new Error('予期せぬエラーが発生しました')
  }
} 