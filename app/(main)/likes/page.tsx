"use client"

import { useState, useEffect } from "react"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase-client"

export default function LikesPage() {
  const [likedPosts, setLikedPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const supabase = createClient()

  useEffect(() => {
    const userData = sessionStorage.getItem("user")
    if (userData) setCurrentUser(JSON.parse(userData))

    fetchLikedPosts()
  }, [])

  const fetchLikedPosts = async () => {
    try {
      setLoading(true)
      const userData = JSON.parse(sessionStorage.getItem("user") || "{}")

      const { data, error } = await supabase
        .from("likes")
        .select("posts:post_id(*)")
        .eq("user_id", userData.id)
        .order("created_at", { ascending: false })

      if (error) throw error
      setLikedPosts((data || []).map((item: any) => item.posts))
    } catch (error) {
      console.error("Error fetching liked posts:", error)
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
        <h1 className="font-bold text-lg">Your Likes</h1>
      </div>

      <div className="max-w-2xl">
        {loading ? (
          <div className="text-center py-12">Loading...</div>
        ) : likedPosts.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>You haven't liked any posts yet</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {likedPosts.map((post) => (
              <div key={post.id} className="p-4 hover:bg-muted/50 transition">
                <p>{post.content}</p>
                <p className="text-sm text-muted-foreground mt-2">{new Date(post.created_at).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
