"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase-client"

export default function SearchContent() {
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
    <div className="max-w-2xl">
      {loading ? (
        <div className="text-center py-12">Searching...</div>
      ) : results.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          {query ? "No results found" : "Start typing to search"}
        </div>
      ) : (
        <div className="divide-y divide-border">
          {results.map((result) => (
            <div key={result.id} className="p-4 hover:bg-muted/50 transition cursor-pointer">
              {result.type === "user" ? (
                <a href={`/profile/${result.id}`} className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                    {result.username?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold">{result.username}</p>
                    <p className="text-sm text-muted-foreground">@{result.username}</p>
                  </div>
                </a>
              ) : (
                <div>
                  <p className="font-semibold mb-2">{result.users?.username}</p>
                  <p>{result.content}</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    {new Date(result.created_at).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
