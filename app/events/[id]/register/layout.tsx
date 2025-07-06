import type { Metadata } from "next";
import { Inter } from "next/font/google";
import AuthProvider from '../../../providers/SessionProvider';
import { ThemeProvider } from "@/components/theme-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "イベント参加申込 - Engage",
  description: "イベントへの参加申込を行ってください",
};

export default function EventRegistrationLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
} 