import { auth } from "@/auth"
import { NextResponse } from "next/server"

export default auth(async (req) => {
  const isLoggedIn = !!req.auth
  const isAuthPage = req.nextUrl.pathname.startsWith("/auth")
  const isApiRoute = req.nextUrl.pathname.startsWith("/api")
  const isStaticFile = req.nextUrl.pathname.startsWith("/_next") || 
                      req.nextUrl.pathname.startsWith("/favicon.ico")
  const isDashboard = req.nextUrl.pathname.startsWith("/dashboard")

  if (isApiRoute || isStaticFile) {
    return NextResponse.next()
  }

  if (isAuthPage) {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL("/dashboard", req.nextUrl))
    }
    return NextResponse.next()
  }

  if (!isLoggedIn) {
    const redirectUrl = new URL("/auth/signin", req.nextUrl)
    if (req.nextUrl.pathname !== "/") {
      redirectUrl.searchParams.set("callbackUrl", req.nextUrl.pathname)
    }
    return NextResponse.redirect(redirectUrl)
  }

  // ダッシュボードへのアクセス制御
  if (isDashboard) {
    try {
      const session = await auth()
      if (!session?.user?.email) {
        return NextResponse.redirect(new URL("/", req.nextUrl))
      }

      const response = await fetch(`${req.nextUrl.origin}/api/users?email=${session.user.email}`)
      if (!response.ok) {
        return NextResponse.redirect(new URL("/", req.nextUrl))
      }

      const user = await response.json()
      if (!user) {
        return NextResponse.redirect(new URL("/", req.nextUrl))
      }
    } catch (error) {
      console.error("ユーザー情報の取得に失敗しました:", error)
      return NextResponse.redirect(new URL("/", req.nextUrl))
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api).*)"],
}
