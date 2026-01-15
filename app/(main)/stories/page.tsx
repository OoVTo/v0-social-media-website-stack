"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { ArrowLeft, Upload, Play } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase-client"
import { uploadFile } from "@/lib/storage-utils"

export default function StoriesPage() {
  const [stories, setStories] = useState<any[]>([])
  const [currentStory, setCurrentStory] = useState<any>(null)
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  useEffect(() => {
    const userData = sessionStorage.getItem("user")
    if (userData) setCurrentUser(JSON.parse(userData))

    fetchStories()
  }, [])

  const fetchStories = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from("stories")
        .select("*, users:user_id(*)")
        .gt("expires_at", new Date().toISOString())
        .order("created_at", { ascending: false })

      if (error) throw error
      setStories(data || [])
    } catch (error) {
      console.error("Error fetching stories:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleUploadStory = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const userData = JSON.parse(sessionStorage.getItem("user") || "{}")
      const path = `stories/${userData.id}/${Date.now()}`
      const result = await uploadFile(file, path)

      if ("url" in result) {
        const { error } = await supabase.from("stories").insert([
          {
            user_id: userData.id,
            video_url: result.url,
          },
        ])

        if (error) throw error
        fetchStories()
      }
    } catch (error) {
      console.error("Error uploading story:", error)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="sticky top-0 bg-background/80 backdrop-blur z-10 p-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/home" className="hover:bg-muted p-2 rounded-full transition">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="font-bold text-lg">Your Story</h1>
        </div>
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg font-semibold hover:opacity-90 disabled:opacity-50 transition"
        >
          <Upload size={18} />
          {uploading ? "Uploading..." : "Upload Story"}
        </button>
        <input ref={fileInputRef} type="file" accept="video/*" onChange={handleUploadStory} className="hidden" />
      </div>

      <div className="max-w-2xl">
        {loading ? (
          <div className="text-center py-12">Loading stories...</div>
        ) : stories.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">No stories yet</p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition"
            >
              Upload Your First Story
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 p-4">
            {stories.map((story) => (
              <button
                key={story.id}
                onClick={() => setCurrentStory(story)}
                className="relative group rounded-lg overflow-hidden bg-muted aspect-video flex items-center justify-center hover:opacity-80 transition"
              >
                <video src={story.video_url} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition flex items-center justify-center">
                  <Play size={32} className="text-white opacity-0 group-hover:opacity-100 transition" />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Story Viewer Modal */}
      {currentStory && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setCurrentStory(null)}
        >
          <div
            className="relative w-full max-w-lg aspect-video bg-black rounded-lg overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <video src={currentStory.video_url} autoPlay controls className="w-full h-full" />
            <div className="absolute top-4 left-4 bg-black/50 text-white px-4 py-2 rounded-full text-sm">
              {currentStory.users?.username}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
