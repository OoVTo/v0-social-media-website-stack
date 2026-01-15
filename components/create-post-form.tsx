"use client"

import type React from "react"

import { useState } from "react"
import { createClient } from "@/lib/supabase-client"

interface CreatePostFormProps {
  onPostCreated: () => void
}

export default function CreatePostForm({ onPostCreated }: CreatePostFormProps) {
  const [content, setContent] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const supabase = createClient()

  const getUser = () => {
    try {
      const userStr = sessionStorage.getItem("user")
      return userStr ? JSON.parse(userStr) : null
    } catch {
      return null
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    
    if (!content.trim()) {
      setError("Please write something to post")
      return
    }

    const user = getUser()
    if (!user || !user.id) {
      setError("You must be logged in to post")
      return
    }

    setLoading(true)

    try {
      // For now, skip media uploads entirely - just create text posts
      // Media uploads can be added separately without affecting post creation
      
      console.log("💾 Creating post:", content.substring(0, 50) + "...")
      
      const { error: insertError } = await supabase.from("posts").insert([
        {
          user_id: user.id,
          content,
          media_urls: [],  // Empty for now
        },
      ])

      if (insertError) throw insertError

      console.log("✅ Post created successfully!")
      setContent("")
      setError("")
      onPostCreated()
    } catch (error: any) {
      const errorMessage = error?.message || "Failed to create post. Please try again."
      console.error("Error creating post:", error)
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="border border-border rounded-lg p-4 bg-card">
      {error && (
        <div className="mb-4 p-3 bg-destructive/10 border border-destructive text-destructive rounded-lg text-sm">
          {error}
        </div>
      )}
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="What's on your mind?"
        className="w-full bg-transparent text-lg resize-none outline-none placeholder:text-muted-foreground min-h-24"
      />

      {/* Action Buttons */}
      <div className="flex items-center justify-end mt-4 pt-4 border-t border-border">
        <button
          type="submit"
          disabled={!content.trim() || loading}
          className="bg-primary text-primary-foreground px-6 py-2 rounded-full font-semibold hover:opacity-90 disabled:opacity-50 transition"
        >
          {loading ? "Posting..." : "Post"}
        </button>
      </div>
    </form>
  )
}
