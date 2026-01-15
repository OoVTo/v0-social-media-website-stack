"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase-client"

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null)
  const [formData, setFormData] = useState({
    username: "",
    bio: "",
    date_of_birth: "",
    email: "",
  })
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const supabase = createClient()

  useEffect(() => {
    const userData = sessionStorage.getItem("user")
    if (userData) {
      const parsed = JSON.parse(userData)
      setUser(parsed)
      setFormData({
        username: parsed.username || "",
        bio: parsed.bio || "",
        date_of_birth: parsed.date_of_birth || "",
        email: parsed.email || "",
      })
    }
  }, [])

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage("")

    try {
      const { error } = await supabase.from("users").update(formData).eq("id", user.id)

      if (error) throw error

      setMessage("Profile updated successfully!")
      setTimeout(() => setMessage(""), 3000)
    } catch (error: any) {
      setMessage(`Error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()

    if (newPassword !== confirmPassword) {
      setMessage("Passwords don't match")
      return
    }

    if (newPassword.length < 6) {
      setMessage("Password must be at least 6 characters")
      return
    }

    setLoading(true)
    setMessage("")

    try {
      // In a real app, verify current password first
      const { error } = await supabase.from("users").update({ password_hash: newPassword }).eq("id", user.id)

      if (error) throw error

      setMessage("Password changed successfully!")
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
      setTimeout(() => setMessage(""), 3000)
    } catch (error: any) {
      setMessage(`Error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="sticky top-0 bg-background/80 backdrop-blur z-10 p-4 border-b border-border flex items-center gap-4">
        <Link href="/home" className="hover:bg-muted p-2 rounded-full transition">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="font-bold text-lg">Settings</h1>
      </div>

      <div className="max-w-2xl">
        {/* Profile Settings */}
        <div className="p-4 border-b border-border">
          <h2 className="text-xl font-bold mb-4">Profile Settings</h2>
          <form onSubmit={handleProfileUpdate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Username</label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="w-full px-4 py-2 border border-border rounded-lg bg-input focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Bio</label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                rows={4}
                className="w-full px-4 py-2 border border-border rounded-lg bg-input focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Date of Birth</label>
              <input
                type="date"
                value={formData.date_of_birth}
                onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                className="w-full px-4 py-2 border border-border rounded-lg bg-input focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="bg-primary text-primary-foreground px-6 py-2 rounded-lg font-semibold hover:opacity-90 disabled:opacity-50 transition"
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </form>
        </div>

        {/* Password Settings */}
        <div className="p-4">
          <h2 className="text-xl font-bold mb-4">Change Password</h2>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Current Password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-4 py-2 border border-border rounded-lg bg-input focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-2 border border-border rounded-lg bg-input focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2 border border-border rounded-lg bg-input focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="bg-primary text-primary-foreground px-6 py-2 rounded-lg font-semibold hover:opacity-90 disabled:opacity-50 transition"
            >
              {loading ? "Updating..." : "Update Password"}
            </button>
          </form>
        </div>

        {/* Messages */}
        {message && (
          <div
            className={`fixed bottom-4 right-4 p-4 rounded-lg ${message.includes("Error") ? "bg-destructive text-destructive-foreground" : "bg-green-500 text-white"}`}
          >
            {message}
          </div>
        )}
      </div>
    </div>
  )
}
