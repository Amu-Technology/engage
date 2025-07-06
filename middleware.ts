import { auth } from "@/auth"
import { NextResponse } from "next/server"

export default auth(async (req) => {
  const isLoggedIn = !!req.auth
  const isAuthPage = req.nextUrl.pathname.startsWith("/auth")
  const isApiRoute = req.nextUrl.pathname.startsWith("/api")
  const isStaticFile = req.nextUrl.pathname.startsWith("/_next") || 
                      req.nextUrl.pathname.startsWith("/favicon.ico")
  const isDashboard = req.nextUrl.pathname.startsWith("/dashboard")
  const isAdminPage = req.nextUrl.pathname.startsWith("/admin")
  
  // 公開ページ（ログイン不要）
  const isPublicPage = req.nextUrl.pathname === "/" ||
                      req.nextUrl.pathname === "/privacy" ||
                      req.nextUrl.pathname === "/terms-of-service"

  if (isApiRoute || isStaticFile) {
    return NextResponse.next()
  }

  // 公開ページは認証不要
  if (isPublicPage) {
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

      // APIエンドポイントを使用してユーザー情報を確認
      const response = await fetch(`${req.nextUrl.origin}/api/users/check?email=${session.user.email}`)
      if (!response.ok) {
        return NextResponse.redirect(new URL("/", req.nextUrl))
      }

      const { exists } = await response.json()
      if (!exists) {
        return NextResponse.redirect(new URL("/", req.nextUrl))
      }
    } catch (error) {
      console.error("ユーザー情報の取得に失敗しました:", error)
      return NextResponse.redirect(new URL("/", req.nextUrl))
    }
  }

  // 管理者ページへのアクセス制御
  if (isAdminPage) {
    try {
      const session = await auth()
      if (!session?.user?.email) {
        return NextResponse.redirect(new URL("/dashboard", req.nextUrl))
      }

      // APIエンドポイントを使用して管理者権限を確認
      const response = await fetch(`${req.nextUrl.origin}/api/users/check-admin?email=${session.user.email}`)
      if (!response.ok) {
        return NextResponse.redirect(new URL("/dashboard", req.nextUrl))
      }

      const { isAdmin } = await response.json()
      if (!isAdmin) {
        return NextResponse.redirect(new URL("/dashboard", req.nextUrl))
      }
    } catch (error) {
      console.error("管理者権限の確認に失敗しました:", error)
      return NextResponse.redirect(new URL("/dashboard", req.nextUrl))
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api).*)"],
}
