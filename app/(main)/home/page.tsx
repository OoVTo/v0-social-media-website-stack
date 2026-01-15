"use client"

import { useState, useEffect } from "react"
import Feed from "@/components/feed"
import { createClient } from "@/lib/supabase-client"

export default function HomePage() {
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const userData = sessionStorage.getItem("user")
    if (userData) {
      setUser(JSON.parse(userData))
    }

    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    try {
      setLoading(true)
      const supabase = createClient()

      // Fetch latest posts with user info and engagement counts
      const { data, error } = await supabase
        .from("posts")
        .select(
          `
          *,
          users:user_id (id, username, profile_picture_url),
          likes:likes(count),
          shares:shares(count),
          comments:comments(count)
        `,
        )
        .is("shared_post_id", null)
        .order("created_at", { ascending: false })
        .limit(20)

      if (error) throw error

      setPosts(data || [])
    } catch (error) {
      console.error("Error fetching posts:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Feed posts={posts} currentUser={user} onPostCreated={fetchPosts} loading={loading} />
    </div>
  )
}
