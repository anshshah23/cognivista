import type React from "react"
import type { Metadata } from "next/types"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/lib/authContext"

export const metadata: Metadata = {
  title: "CogniVista",
  authors: [{ name: "Ansh Shah", url: "https://cognivista.vercel.app/" }],
  description: "A platform for Smart, Interactive Learning",
  keywords: ["CogniVista", "AI", "Learning", "Education"],
  creator: "Ansh Shah",
  publisher: "Ansh Shah",
}

import { AppLayout } from "./layout-client"

const inter = Inter({ subsets: ["latin"] })


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <AuthProvider>
          <AppLayout>{children}</AppLayout>
        </AuthProvider>
      </body>
    </html>
  )
}

