"use client"

import { useState } from "react"
import Link from "next/link"
import { Heart, MessageCircle, Share2, Trash2, Edit2 } from "lucide-react"
import { createClient } from "@/lib/supabase-client"

interface PostCardProps {
  post: any
  currentUser: any
  onPostUpdated: () => void
}

export default function PostCard({ post, currentUser, onPostUpdated }: PostCardProps) {
  const [isLiked, setIsLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(post.likes?.[0]?.count || 0)
  const [showOptions, setShowOptions] = useState(false)
  const supabase = createClient()
  const isOwnPost = post.user_id === currentUser?.id

  const handleLike = async () => {
    if (isLiked) {
      const { error } = await supabase.from("likes").delete().eq("post_id", post.id).eq("user_id", currentUser.id)
      if (!error) {
        setIsLiked(false)
        setLikeCount(likeCount - 1)
      }
    } else {
      const { error } = await supabase.from("likes").insert([{ post_id: post.id, user_id: currentUser.id }])
      if (!error) {
        setIsLiked(true)
        setLikeCount(likeCount + 1)
      }
    }
  }

  const handleDelete = async () => {
    const { error } = await supabase.from("posts").delete().eq("id", post.id)
    if (!error) {
      onPostUpdated()
    }
  }

  return (
    <div className="p-4 hover:bg-muted/50 transition cursor-pointer border-b border-border">
      <div className="flex gap-4">
        {/* Avatar */}
        <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
          {post.users?.username?.[0]?.toUpperCase()}
        </div>

        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <Link href={`/profile/${post.user_id}`} className="font-semibold hover:underline">
                {post.users?.username}
              </Link>
              <span className="text-muted-foreground text-sm ml-2">@{post.users?.username}</span>
            </div>
            {isOwnPost && (
              <div className="relative">
                <button
                  onClick={() => setShowOptions(!showOptions)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  ⋯
                </button>
                {showOptions && (
                  <div className="absolute right-0 top-full mt-2 bg-card border border-border rounded-lg shadow-lg z-10">
                    <button className="w-full text-left px-4 py-2 hover:bg-muted flex items-center gap-2 text-sm">
                      <Edit2 size={16} />
                      Edit
                    </button>
                    <button
                      onClick={handleDelete}
                      className="w-full text-left px-4 py-2 hover:bg-destructive/10 text-destructive flex items-center gap-2 text-sm"
                    >
                      <Trash2 size={16} />
                      Delete
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Content */}
          <p className="mt-2 text-foreground leading-normal">{post.content}</p>

          {/* Media */}
          {post.media_urls && post.media_urls.length > 0 && (
            <div className="mt-3 rounded-2xl overflow-hidden bg-muted">
              <div className="grid grid-cols-2 gap-1">
                {post.media_urls.slice(0, 4).map((url: string, idx: number) => (
                  <img
                    key={idx}
                    src={url || "/placeholder.svg"}
                    alt="Post media"
                    className="w-full h-40 object-cover"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Engagement Buttons */}
          <div className="mt-3 flex justify-between text-muted-foreground text-sm max-w-xs">
            <button className="flex items-center gap-2 hover:text-primary transition">
              <MessageCircle size={16} />
              <span>Reply</span>
            </button>

            <button className="flex items-center gap-2 hover:text-primary transition">
              <Share2 size={16} />
              <span>Share</span>
            </button>

            <button
              onClick={handleLike}
              className={`flex items-center gap-2 transition ${isLiked ? "text-destructive" : "hover:text-primary"}`}
            >
              <Heart size={16} fill={isLiked ? "currentColor" : "none"} />
              <span>{likeCount}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
