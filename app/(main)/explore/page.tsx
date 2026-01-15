"use client"

import { useState, useEffect } from "react"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase-client"

export default function ExplorePage() {
  const [tags, setTags] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchTrendingContent()
  }, [])

  const fetchTrendingContent = async () => {
    try {
      setLoading(true)

      // Fetch trending tags
      const { data: tagsData } = await supabase.from("tags").select("*, post_tags(count)").limit(10)

      setTags(tagsData || [])

      // Fetch popular users
      const { data: usersData } = await supabase.from("users").select("*, follows:follows(count)").limit(10)

      setUsers(usersData || [])
    } catch (error) {
      console.error("Error fetching content:", error)
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
        <h1 className="font-bold text-lg">Explore</h1>
      </div>

      <div className="max-w-2xl">
        {/* Trending Tags */}
        <div className="border-b border-border p-4">
          <h2 className="text-xl font-bold mb-4">Trending Tags</h2>
          <div className="space-y-2">
            {tags.map((tag) => (
              <Link
                key={tag.id}
                href={`/search?q=%23${tag.tag_name}`}
                className="block p-3 hover:bg-muted rounded-lg transition"
              >
                <p className="font-semibold">#{tag.tag_name}</p>
                <p className="text-sm text-muted-foreground">{tag.post_tags?.length || 0} posts</p>
              </Link>
            ))}
          </div>
        </div>

        {/* Popular Users */}
        <div className="p-4">
          <h2 className="text-xl font-bold mb-4">Popular Users</h2>
          <div className="space-y-2">
            {users.map((user) => (
              <Link
                key={user.id}
                href={`/profile/${user.id}`}
                className="flex items-center justify-between p-3 hover:bg-muted rounded-lg transition"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                    {user.username?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold">{user.username}</p>
                    <p className="text-sm text-muted-foreground">{user.follows?.length || 0} followers</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
