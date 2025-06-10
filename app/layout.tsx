import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AuthProvider from './providers/SessionProvider';
import { UserProvider } from './providers/UserProvider';
import { ThemeProvider } from "@/components/theme-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Engage",
  description: "政策リード管理システム「Engage」",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
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
            <UserProvider>
              {children}
            </UserProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
