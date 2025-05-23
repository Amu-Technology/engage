import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export default async function HomePage() {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      redirect('/login')
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      throw new Error('ユーザー情報が見つかりません。管理者にお問い合わせください。')
    }

    redirect('/dashboard')
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }
    throw new Error('予期せぬエラーが発生しました')
  }
}
