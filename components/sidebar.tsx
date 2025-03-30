"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { BookOpen, Home, Image, LogOut, MessageSquare, PenTool, Settings, User, Video, BarChart } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/lib/authContext"
import { motion } from "framer-motion"

const navItems = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Whiteboard", href: "/whiteboard", icon: PenTool },
  { name: "Image Learning", href: "/image-learning", icon: Image },
  { name: "Analytics", href: "/analytics", icon: BarChart },
  { name: "Video Player", href: "/video", icon: Video },
  { name: "Quizzes", href: "/quizzes", icon: BookOpen },
  { name: "Collaboration", href: "/collaboration", icon: MessageSquare },
]

const userItems = [
  { name: "Profile", href: "/settings", icon: User },
  { name: "Settings", href: "/settings", icon: Settings },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuth()
  const [isCollapsed, setIsCollapsed] = useState(false)

  const handleLogout = async () => {
    try {
      await logout()
      router.push("/login")
    } catch (error) {
      console.error("Logout failed", error)
    }
  }

  const sidebarVariants = {
    expanded: { width: "16rem" },
    collapsed: { width: "4rem" },
  }

  return (
    <motion.div
      className="flex flex-col h-screen border-r bg-background/80 backdrop-blur-sm z-10"
      initial={false}
      animate={isCollapsed ? "collapsed" : "expanded"}
      variants={sidebarVariants}
      transition={{ duration: 0.3, ease: "easeInOut" }}
    >
      {/* Header Section */}
      <div className="flex h-16 items-center border-b px-3 shrink-0">
        <Link href="/" className="flex items-center">
          <div className="relative h-8 w-8 overflow-hidden rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500">
            <div className="absolute inset-0 flex items-center justify-center text-white font-bold">SE</div>
          </div>
          {!isCollapsed && (
            <motion.span
              className="ml-2 text-lg font-semibold gradient-text"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              SmartEdu
            </motion.span>
          )}
        </Link>
        <Button
          variant="ghost"
          size="icon"
          className={cn("ml-auto", isCollapsed && "mx-auto")}
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          <PenTool className="h-5 w-5 text-primary" />
          <span className="sr-only">Toggle Sidebar</span>
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 overflow-hidden">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href

            return (
              <motion.li key={item.name} whileHover={{ x: 5 }} transition={{ duration: 0.2 }}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 text-primary"
                      : "hover:bg-accent/50 hover:text-primary",
                    isCollapsed && "justify-center px-0",
                  )}
                >
                  <item.icon className={cn("h-5 w-5", isActive ? "text-primary" : "text-muted-foreground")} />

                  {!isCollapsed && (
                    <motion.span
                      className="ml-3"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      {item.name}
                    </motion.span>
                  )}

                  {isActive && !isCollapsed && (
                    <motion.div
                      className="ml-auto h-2 w-2 rounded-full bg-primary"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.3 }}
                    />
                  )}
                </Link>
              </motion.li>
            )
          })}
        </ul>
      </nav>

      {/* User Profile Section */}
      <div className="border-t p-3 shrink-0">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className={`w-full flex ${isCollapsed ? "justify-center" : "justify-start"} items-center rounded-lg hover:bg-accent/50`}
            >
              <Avatar className="h-8 w-8 border-2 border-primary">
                <AvatarImage src="/placeholder.svg" />
                <AvatarFallback className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white">
                  {user?.username?.substring(0, 2) || "U"}
                </AvatarFallback>
              </Avatar>

              {!isCollapsed && (
                <motion.div
                  className="ml-3 flex flex-col items-start"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <span className="text-sm font-medium">{user?.username || "User"}</span>
                  <span className="text-xs text-muted-foreground">{user?.email || "user@example.com"}</span>
                </motion.div>
              )}
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />

            {userItems.map((item) => (
              <DropdownMenuItem key={item.name} asChild>
                <Link href={item.href} className="flex items-center cursor-pointer">
                  <item.icon className="mr-2 h-4 w-4 text-primary" />
                  <span>{item.name}</span>
                </Link>
              </DropdownMenuItem>
            ))}

            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              className="cursor-pointer flex items-center text-destructive focus:text-destructive"
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </motion.div>
  )
}

