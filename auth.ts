import NextAuth from "next-auth"
import Google from "next-auth/providers/google"

export const { handlers, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET!,
  pages: {
    signIn: "/auth/signin",
  },
  callbacks: {
    async redirect({ url, baseUrl }) {      
      // 相対パスの場合はbaseUrlを追加
      if (url.startsWith("/")) {
        const redirectUrl = new URL(url, baseUrl)
        // クエリパラメータを保持
        if (url.includes("?")) {
          const searchParams = new URL(url).searchParams
          searchParams.forEach((value, key) => {
            redirectUrl.searchParams.set(key, value)
          })
        }
        return redirectUrl.toString()
      }
      
      // 同じオリジンの場合はそのまま
      if (new URL(url).origin === baseUrl) {
        return url
      }
      
      // それ以外はbaseUrlにリダイレクト
      return baseUrl
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub
      }
      return session
    },
    async jwt({ token, user, account }) {
      if (account && user) {
        token.accessToken = account.access_token
      }
      return token
    },
  },
  events: {
    async signIn({ user, account, profile }) {
      console.log("[Auth] Sign in success:", { user, account, profile })
    },
    async signOut() {
    },
  },
})