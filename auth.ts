import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

export const { handlers, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope:
            "openid email profile https://www.googleapis.com/auth/gmail.send",
          access_type: "offline",
          prompt: "consent",
        },
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET!,
  pages: {
    signIn: "/auth/signin",
  },
  callbacks: {
    async jwt({ token, user, account }) {
      // 最初のサインイン時
      if (account && user) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.accessTokenExpires = Date.now() + account.expires_in! * 1000;
        return token;
      }

      // アクセストークンの有効期限が切れていなければ、そのまま返す
      if (Date.now() < (token.accessTokenExpires as number)) {
        return token;
      }

      // アクセストークンが切れていれば、リフレッシュトークンを使って更新
      try {
        const response = await fetch("https://oauth2.googleapis.com/token", {
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            client_id: process.env.GOOGLE_CLIENT_ID!,
            client_secret: process.env.GOOGLE_CLIENT_SECRET!,
            grant_type: "refresh_token",
            refresh_token: token.refreshToken as string,
          }),
          method: "POST",
        });

        const newTokens = await response.json();

        if (!response.ok) {
          throw newTokens;
        }

        return {
          ...token,
          accessToken: newTokens.access_token,
          accessTokenExpires: Date.now() + newTokens.expires_in * 1000,
          refreshToken: newTokens.refresh_token ?? token.refreshToken, // 新しいリフレッシュトークンが返される場合もある
        };
      } catch (error) {
        console.error("Error refreshing access token", error);
        return { ...token, error: "RefreshAccessTokenError" as const };
      }
    },
    async redirect({ url, baseUrl }) {
      // 相対パスの場合はbaseUrlを追加
      if (url.startsWith("/")) {
        const redirectUrl = new URL(url, baseUrl);
        // クエリパラメータを保持
        if (url.includes("?")) {
          const searchParams = new URL(url).searchParams;
          searchParams.forEach((value, key) => {
            redirectUrl.searchParams.set(key, value);
          });
        }
        return redirectUrl.toString();
      }

      // 同じオリジンの場合はそのまま
      if (new URL(url).origin === baseUrl) {
        return url;
      }

      // それ以外はbaseUrlにリダイレクト
      return baseUrl;
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }
      session.accessToken = token.accessToken as string;
      session.error = token.error as string;

      return session;
    },
  },
  events: {
    async signIn({ user, account, profile }) {
      console.log("[Auth] Sign in success:", { user, account, profile });
    },
    async signOut() {},
  },
});
