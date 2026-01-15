"use client"

import { useState } from "react"
import PostCard from "@/components/post-card"
import CreatePostForm from "@/components/create-post-form"

interface FeedProps {
  posts: any[]
  currentUser: any
  onPostCreated: () => void
  loading: boolean
}

export default function Feed({ posts, currentUser, onPostCreated, loading }: FeedProps) {
  const [showCreateForm, setShowCreateForm] = useState(false)

  if (!currentUser) {
    return <div className="text-center py-8">Loading...</div>
  }

  return (
    <div className="divide-y divide-border">
      {/* Create Post Section */}
      {showCreateForm && (
        <div className="p-4 border-b border-border">
          <CreatePostForm
            onPostCreated={() => {
              onPostCreated()
              setShowCreateForm(false)
            }}
          />
        </div>
      )}

      {!showCreateForm && (
        <div
          className="p-4 border-b border-border flex items-start gap-4 cursor-pointer hover:bg-muted/50 transition"
          onClick={() => setShowCreateForm(true)}
        >
          <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
            {currentUser?.username?.[0]?.toUpperCase()}
          </div>
          <div className="flex-1">
            <p className="text-muted-foreground">What's on your mind?</p>
          </div>
        </div>
      )}

      {/* Posts */}
      {loading ? (
        <div className="text-center py-8 text-muted-foreground">Loading posts...</div>
      ) : posts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-2">No posts yet</p>
          <p className="text-sm text-muted-foreground">Follow users to see their posts or create your own!</p>
        </div>
      ) : (
        posts.map((post) => (
          <PostCard key={post.id} post={post} currentUser={currentUser} onPostUpdated={onPostCreated} />
        ))
      )}
    </div>
  )
}
