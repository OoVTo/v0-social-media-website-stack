"use client"

import type React from "react"

import { useState, useRef } from "react"
import { ImageIcon, Video, Smile, X } from "lucide-react"
import { createClient } from "@/lib/supabase-client"
import { uploadFile } from "@/lib/storage-utils"

interface CreatePostFormProps {
  onPostCreated: () => void
}

export default function CreatePostForm({ onPostCreated }: CreatePostFormProps) {
  const [content, setContent] = useState("")
  const [media, setMedia] = useState<File[]>([])
  const [loading, setLoading] = useState(false)
  const [preview, setPreview] = useState<string[]>([])
  const [error, setError] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  const getUser = () => {
    try {
      const userStr = sessionStorage.getItem("user")
      return userStr ? JSON.parse(userStr) : null
    } catch {
      return null
    }
  }

  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    console.log("📁 Files selected:", files.length, files.map(f => f.name))
    setMedia([...media, ...files])

    // Create previews
    files.forEach((file) => {
      const reader = new FileReader()
      reader.onload = (event) => {
        setPreview((prev) => [...prev, event.target?.result as string])
      }
      reader.readAsDataURL(file)
    })
  }

  const removeMedia = (index: number) => {
    setMedia(media.filter((_, i) => i !== index))
    setPreview(preview.filter((_, i) => i !== index))
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
      const mediaUrls: string[] = []
      const uploadWarnings: string[] = []

      // Upload media files
      for (const file of media) {
        const path = `posts/${user.id}/${Date.now()}-${file.name}`
        const result = await uploadFile(file, path)
        if ("url" in result) {
          mediaUrls.push(result.url)
          console.log("✅ Uploaded:", result.url)
        } else {
          // Log warning but don't fail the post
          console.warn("❌ Failed to upload", file.name, ":", result.error)
          uploadWarnings.push(file.name)
        }
      }

      // Show warning if some media failed to upload
      if (uploadWarnings.length > 0) {
        console.warn(`⚠️ Failed to upload ${uploadWarnings.length} file(s). Post will be created without these images.`)
      }

      // Create post (with or without media)
      console.log("💾 Saving post with media_urls:", mediaUrls)
      const { error: insertError } = await supabase.from("posts").insert([
        {
          user_id: user.id,
          content,
          media_urls: mediaUrls.length > 0 ? mediaUrls : [],
        },
      ])

      if (insertError) throw insertError

      console.log("✅ Post created successfully!")
      setContent("")
      setMedia([])
      setPreview([])
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

      {/* Media Preview */}
      {preview.length > 0 && (
        <div className="grid grid-cols-2 gap-2 mt-4">
          {preview.map((src, idx) => (
            <div key={idx} className="relative rounded-lg overflow-hidden bg-muted">
              <img src={src || "/placeholder.svg"} alt="Preview" className="w-full h-40 object-cover" />
              <button
                type="button"
                onClick={() => removeMedia(idx)}
                className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 p-1 rounded-full text-white"
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2 hover:bg-muted rounded-full transition text-primary"
            title="Add image"
          >
            <ImageIcon size={20} />
          </button>
          <button type="button" className="p-2 hover:bg-muted rounded-full transition text-primary" title="Add video">
            <Video size={20} />
          </button>
          <button type="button" className="p-2 hover:bg-muted rounded-full transition text-primary" title="Add emoji">
            <Smile size={20} />
          </button>
        </div>

        <button
          type="submit"
          disabled={!content.trim() || loading}
          className="bg-primary text-primary-foreground px-6 py-2 rounded-full font-semibold hover:opacity-90 disabled:opacity-50 transition"
        >
          {loading ? "Posting..." : "Post"}
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,video/*"
        onChange={handleMediaChange}
        className="hidden"
      />
    </form>
  )
}
