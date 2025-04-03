"use client"

import type React from "react"

import { usePathname } from "next/navigation"
import { useAuth } from "@/lib/authContext"
import Sidebar from "@/components/sidebar"
import { ThemeProvider } from "@/components/theme-provider"
import { AnimatedBackground } from "@/components/animated-background"

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { user, loading } = useAuth()
  const isAuthPage = pathname === "/login" || pathname === "/signup" || pathname === "/forgot-password"

  // Show only the children (login/signup form) without sidebar if:
  // 1. User is not authenticated AND not on an auth page (redirect to login will happen via middleware)
  // 2. User is on an auth page (login/signup/forgot-password)
  const showOnlyContent = isAuthPage || (!user && !loading)

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <AnimatedBackground />
      {showOnlyContent ? (
        // Auth pages - no sidebar, centered content
        <div className="flex min-h-screen items-center justify-center">{children}</div>
      ) : (
        // Main app layout with sidebar for authenticated users
        <div className="flex h-screen overflow-hidden">
          <Sidebar />
          <main className="flex-1 overflow-auto">{children}</main>
        </div>
      )}
    </ThemeProvider>
  )
}

