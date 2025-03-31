import type React from "react"
import type { Metadata } from "next/types"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import Sidebar from "@/components/sidebar"
import { AuthProvider } from "@/lib/authContext"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "CogniVista",
  authors: [{ name: "Ansh Shah", url: "https://cognivista.vercel.app/" }],
  description: "A platform for Smart, Interactive Learning",
  keywords: ["CogniVista", "AI", "Learning", "Education"],
  creator: "Ansh Shah",
  publisher: "Ansh Shah",
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="h-screen w-screen overflow-hidden">
        <AuthProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            <div className="flex h-screen">
              <Sidebar />
              <main className="flex-1 h-screen overflow-y-auto">{children}</main>
            </div>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
