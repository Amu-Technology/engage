import { LoginForm } from "@/components/login-form"
import { Suspense } from "react"
import Link from "next/link"

export default function Page() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <a href="https://amu-lab.com" className="flex items-center gap-2 self-center font-medium">
          Amu-Technology Inc.
        </a>
        <Suspense fallback={<div>Loading...</div>}>
          <LoginForm />
        </Suspense>
        <div className="text-center text-sm text-gray-500">
          <Link
            href="/privacy"
            className="text-blue-600 hover:underline"
          >
            プライバシーポリシー
          </Link>
          <span className="mx-2">|</span>
          <Link
            href="/terms-of-service"
            className="text-blue-600 hover:underline"
          >
            利用規約
          </Link>
        </div>
      </div>
    </div>
  )
}