"use client"

import type React from "react"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import Sidebar from "@/components/sidebar"
import { AnimatedBackground } from "@/components/animated-background"
import { usePathname } from "next/navigation"

const inter = Inter({ subsets: ["latin"] })

// Create a client component wrapper to use hooks
function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAuthPage = pathname === "/login" || pathname === "/signup" || pathname === "/forgot-password"

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <AnimatedBackground />
      {isAuthPage ? (
        // Auth pages - no sidebar, centered content
        <div className="flex min-h-screen items-center justify-center">{children}</div>
      ) : (
        // Main app layout with sidebar
        <div className="flex h-screen overflow-hidden">
          <Sidebar />
          <main className="flex-1 overflow-auto">{children}</main>
        </div>
      )}
    </ThemeProvider>
  )
}

export default function ClientRootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <body className={inter.className}>
      <AppLayout>{children}</AppLayout>
    </body>
  )
}

