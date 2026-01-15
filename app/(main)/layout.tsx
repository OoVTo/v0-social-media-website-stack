"use client"

import type React from "react"
import { Suspense } from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import Sidebar from "@/components/sidebar"
import { Search, Bell, Mail, Menu, X } from "lucide-react"

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    const userData = sessionStorage.getItem("user")
    if (!userData) {
      router.push("/login")
    } else {
      setUser(JSON.parse(userData))
    }
  }, [router])

  const handleLogout = () => {
    sessionStorage.removeItem("user")
    router.push("/login")
  }

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  if (!user) return null

  return (
    <div className="flex h-screen bg-background text-foreground">
      {/* Sidebar */}
      <div
        className={`${sidebarOpen ? "block" : "hidden"} lg:block fixed lg:relative w-64 h-screen border-r border-border bg-sidebar z-40`}
      >
        <Sidebar user={user} onLogout={handleLogout} onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation */}
        <nav className="border-b border-border bg-card p-4 flex items-center justify-between sticky top-0 z-30">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden text-foreground hover:text-primary transition"
          >
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          <div className="flex-1 px-4">
            <div className="max-w-2xl mx-auto flex items-center gap-2 bg-muted rounded-full px-4 py-2">
              <Search size={20} className="text-muted-foreground" />
              <input
                type="text"
                placeholder="Search posts, tags, and users..."
                className="bg-transparent flex-1 outline-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="text-foreground hover:text-primary transition" title="Notifications">
              <Bell size={20} />
            </button>
            <button className="text-foreground hover:text-primary transition" title="Messages">
              <Mail size={20} />
            </button>
            <button
              onClick={toggleTheme}
              className="text-foreground hover:text-primary transition"
              title="Toggle theme"
            >
              {theme === "dark" ? "☀️" : "🌙"}
            </button>
          </div>
        </nav>

        {/* Page Content */}
        <div className="flex-1 overflow-auto">
          <Suspense fallback={null}>{children}</Suspense>
        </div>
      </div>
    </div>
  )
}
