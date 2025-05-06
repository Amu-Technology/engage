import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export default async function LoginPage() {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return (
        <div className="container mx-auto p-4 flex items-center justify-center min-h-screen">
          <div className="w-full max-w-md text-center">
            <h1 className="text-2xl font-bold mb-4">ログイン</h1>
            <p className="text-gray-500 mb-4">
              このページにアクセスするにはログインが必要です。
            </p>
            <Link
              href="/api/auth/signin"
              className="inline-block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              ログイン
            </Link>
          </div>
        </div>
      )
    }

    // ユーザー情報を取得
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      throw new Error('ユーザー情報が見つかりません')
    }

    // 権限に応じてリダイレクト
    if (user.role === 'admin') {
      redirect('/dashboard/admin')
    } else {
      redirect('/dashboard')
    }
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }
    throw new Error('予期せぬエラーが発生しました')
  }
} 