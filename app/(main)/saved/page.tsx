"use client"

import { useState, useEffect } from "react"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function SavedPage() {
  const [saved, setSaved] = useState<any[]>([])

  useEffect(() => {
    // Fetch saved posts from localStorage (or database)
    const savedPosts = localStorage.getItem("savedPosts")
    if (savedPosts) {
      setSaved(JSON.parse(savedPosts))
    }
  }, [])

  return (
    <div>
      {/* Header */}
      <div className="sticky top-0 bg-background/80 backdrop-blur z-10 p-4 border-b border-border flex items-center gap-4">
        <Link href="/home" className="hover:bg-muted p-2 rounded-full transition">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="font-bold text-lg">Saved Posts</h1>
      </div>

      <div className="max-w-2xl">
        {saved.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>No saved posts yet</p>
            <p className="text-sm mt-2">Posts you save will appear here</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {saved.map((post) => (
              <div key={post.id} className="p-4 hover:bg-muted/50 transition">
                <p className="font-semibold mb-2">{post.author}</p>
                <p>{post.content}</p>
                <p className="text-sm text-muted-foreground mt-2">{post.date}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
