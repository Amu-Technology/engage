import { type DefaultSession } from 'next-auth';

declare module 'next-auth' {
  /**
   * `session`コールバックから返されるセッションオブジェクトの型
   */
  interface Session {
    accessToken?: string;
    error?: string;
    user: {
      id: string;
    } & DefaultSession['user'];
  }
}

declare module 'next-auth/jwt' {
  /**
   * `jwt`コールバックから返されるトークンオブジェクトの型
   */
  interface JWT {
    accessToken?: string;
    refreshToken?: string;
    accessTokenExpires?: number;
    error?: string;
  }
}