"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Compass, BookMarked, Heart, MessageSquare, Camera, Settings, LogOut, Feather } from "lucide-react"

interface SidebarProps {
  user: any
  onLogout: () => void
  onClose: () => void
}

export default function Sidebar({ user, onLogout, onClose }: SidebarProps) {
  const pathname = usePathname()

  const menuItems = [
    { href: "/home", icon: Home, label: "Home" },
    { href: "/explore", icon: Compass, label: "Explore" },
    { href: "/saved", icon: BookMarked, label: "Saved" },
    { href: "/likes", icon: Heart, label: "Likes" },
    { href: "/messages", icon: MessageSquare, label: "Messages" },
    { href: "/stories", icon: Camera, label: "Stories" },
    { href: `/profile/${user?.id}`, icon: Feather, label: "Profile" },
    { href: "/settings", icon: Settings, label: "Settings" },
  ]

  const isActive = (href: string) => pathname === href

  return (
    <div className="flex flex-col h-full p-4 gap-6">
      {/* Logo */}
      <Link href="/home" className="text-2xl font-bold text-primary hover:opacity-80 transition" onClick={onClose}>
        Stack
      </Link>

      {/* User Info */}
      <div className="flex items-center gap-3 p-3 rounded-lg bg-background">
        <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
          {user?.username?.[0]?.toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm truncate">{user?.username}</p>
          <p className="text-xs text-muted-foreground truncate">@{user?.username}</p>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon
          const active = isActive(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={`flex items-center gap-4 px-4 py-3 rounded-lg transition ${
                active ? "bg-primary text-primary-foreground font-semibold" : "text-foreground hover:bg-muted"
              }`}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Create Post Button */}
      <Link
        href="/create-post"
        onClick={onClose}
        className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-semibold hover:opacity-90 transition text-center flex items-center justify-center gap-2"
      >
        <Feather size={18} />
        Post
      </Link>

      {/* Logout */}
      <button
        onClick={onLogout}
        className="w-full flex items-center gap-4 px-4 py-3 text-destructive hover:bg-destructive/10 rounded-lg transition"
      >
        <LogOut size={20} />
        <span>Logout</span>
      </button>
    </div>
  )
}
