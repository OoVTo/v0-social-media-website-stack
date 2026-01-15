"use client"

import { useState, useEffect } from "react"
import { Suspense } from "react"
import { ArrowLeft, Search } from "lucide-react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase-client"
import SearchContent from "@/components/search-content"

function SearchHeader() {
  return (
    <div className="sticky top-0 bg-background/80 backdrop-blur z-10 p-4 border-b border-border">
      <Link href="/home" className="flex items-center gap-4 mb-4 hover:opacity-80 transition">
        <ArrowLeft size={20} />
        <h1 className="font-bold text-lg">Search</h1>
      </Link>
      <div className="flex items-center gap-2 bg-muted rounded-full px-4 py-2">
        <Search size={20} className="text-muted-foreground" />
        <input
          type="text"
          placeholder="Search posts, tags (#), and users (@)..."
          className="bg-transparent flex-1 outline-none"
        />
      </div>
    </div>
  )
}

export default function SearchPage() {
  const searchParams = useSearchParams()
  const [query, setQuery] = useState(searchParams.get("q") || "")
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    if (query.trim()) {
      performSearch()
    }
  }, [query])

  const performSearch = async () => {
    try {
      setLoading(true)
      let searchResults: any[] = []

      if (query.startsWith("#")) {
        // Search for hashtags
        const tag = query.substring(1)
        const { data, error } = await supabase
          .from("post_tags")
          .select("posts:post_id(*), tags:tag_id(*)")
          .ilike("tags.tag_name", `%${tag}%`)

        if (!error) {
          searchResults = (data || []).map((item) => ({ ...item.posts, tag: item.tags }))
        }
      } else if (query.startsWith("@")) {
        // Search for users
        const username = query.substring(1)
        const { data, error } = await supabase.from("users").select("*").ilike("username", `%${username}%`)

        if (!error) {
          searchResults = (data || []).map((user) => ({ ...user, type: "user" }))
        }
      } else {
        // Search for posts and users
        const { data: postsData } = await supabase.from("posts").select("*").ilike("content", `%${query}%`)

        const { data: usersData } = await supabase.from("users").select("*").ilike("username", `%${query}%`)

        searchResults = [...(postsData || []), ...(usersData || []).map((user) => ({ ...user, type: "user" }))]
      }

      setResults(searchResults)
    } catch (error) {
      console.error("Error searching:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <SearchHeader />
      <Suspense fallback={<div className="text-center py-12">Loading...</div>}>
        <SearchContent results={results} loading={loading} />
      </Suspense>
    </div>
  )
}
