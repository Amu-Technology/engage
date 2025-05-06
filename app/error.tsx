'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { signOut } from 'next-auth/react'

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/login' })
  }

  return (
    <div className="container mx-auto p-4 flex items-center justify-center min-h-screen">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">エラーが発生しました</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-gray-500">
            {error.message || '予期せぬエラーが発生しました。'}
          </p>
          <div className="flex flex-col space-y-2">
            <Button onClick={() => reset()}>再試行</Button>
            <Button variant="outline" onClick={handleSignOut}>
              再ログイン
            </Button>
            <Button variant="ghost" onClick={() => window.location.href = '/'}>
              ホームに戻る
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 