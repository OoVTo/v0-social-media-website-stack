"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Heart, MessageCircle, Share2, Trash2, Edit2, X } from "lucide-react"
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
  const [showReplies, setShowReplies] = useState(false)
  const [replies, setReplies] = useState<any[]>([])
  const [replyText, setReplyText] = useState("")
  const [showShareModal, setShowShareModal] = useState(false)
  const [shareText, setShareText] = useState("")
  const supabase = createClient()
  const isOwnPost = post.user_id === currentUser?.id

  useEffect(() => {
    // Check if user has liked this post
    checkIfLiked()
  }, [post.id, currentUser?.id])

  const checkIfLiked = async () => {
    if (!currentUser?.id) return
    try {
      const { data } = await supabase
        .from("likes")
        .select("id")
        .eq("post_id", post.id)
        .eq("user_id", currentUser.id)
        .single()

      setIsLiked(!!data)
    } catch {
      setIsLiked(false)
    }
  }

  const fetchReplies = async () => {
    try {
      const { data, error } = await supabase
        .from("comments")
        .select(
          `
          *,
          users:user_id (id, username, profile_picture_url)
        `,
        )
        .eq("post_id", post.id)
        .order("created_at", { ascending: true })

      if (!error && data) {
        setReplies(data)
      } else {
        // Comments table may not exist yet
        setReplies([])
      }
    } catch (error) {
      console.error("Error fetching replies:", error)
      setReplies([])
    }
  }

  const handleLike = async () => {
    try {
      if (isLiked) {
        const { error } = await supabase.from("likes").delete().eq("post_id", post.id).eq("user_id", currentUser.id)
        if (!error) {
          setIsLiked(false)
          setLikeCount(Math.max(0, likeCount - 1))
        }
      } else {
        const { error } = await supabase.from("likes").insert([{ post_id: post.id, user_id: currentUser.id }])
        if (!error) {
          setIsLiked(true)
          setLikeCount(likeCount + 1)
        }
      }
    } catch (error) {
      console.error("Error toggling like:", error)
    }
  }

  const handleShare = async () => {
    if (!shareText.trim()) return

    try {
      const { error } = await supabase.from("posts").insert([
        {
          user_id: currentUser.id,
          content: shareText,
          shared_post_id: post.id,
          media_urls: null,
        },
      ])

      if (!error) {
        setShareText("")
        setShowShareModal(false)
        onPostUpdated()
      }
    } catch (error) {
      console.error("Error sharing post:", error)
    }
  }

  const handleReply = async () => {
    if (!replyText.trim()) return

    try {
      const { error } = await supabase.from("comments").insert([
        {
          post_id: post.id,
          user_id: currentUser.id,
          content: replyText,
        },
      ])

      if (!error) {
        setReplyText("")
        await fetchReplies()
      } else {
        console.error("Error posting reply:", error)
      }
    } catch (error) {
      console.error("Error posting reply:", error)
    }
  }

  const handleDeleteReply = async (replyId: string) => {
    try {
      const { error } = await supabase.from("comments").delete().eq("id", replyId)

      if (!error) {
        await fetchReplies()
      }
    } catch (error) {
      console.error("Error deleting reply:", error)
    }
  }

  const handleDelete = async () => {
    const { error } = await supabase.from("posts").delete().eq("id", post.id)
    if (!error) {
      onPostUpdated()
    }
  }

  return (
    <div className="border-b border-border">
      <div className="p-4 hover:bg-muted/50 transition">
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
              <button
                onClick={() => {
                  setShowReplies(!showReplies)
                  if (!showReplies) {
                    fetchReplies()
                  }
                }}
                className="flex items-center gap-2 hover:text-primary transition"
              >
                <MessageCircle size={16} />
                <span>Reply</span>
              </button>

              <button
                onClick={() => setShowShareModal(true)}
                className="flex items-center gap-2 hover:text-primary transition"
              >
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

      {/* Replies Section */}
      {showReplies && (
        <div className="border-t border-border pl-16 pr-4 pb-4">
          {/* Reply Input */}
          <div className="mt-4">
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Reply to this post..."
              className="w-full bg-muted rounded-lg p-3 text-sm resize-none outline-none placeholder:text-muted-foreground"
              rows={2}
            />
            <div className="mt-2 flex justify-end">
              <button
                onClick={handleReply}
                disabled={!replyText.trim()}
                className="bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition"
              >
                Reply
              </button>
            </div>
          </div>

          {/* Replies List */}
          <div className="mt-4 space-y-4">
            {replies.length === 0 ? (
              <p className="text-muted-foreground text-sm">No replies yet. Be the first to reply!</p>
            ) : (
              replies.map((reply) => (
                <div key={reply.id} className="flex gap-3 p-3 bg-muted rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 text-xs">
                    {reply.users?.username?.[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <Link href={`/profile/${reply.user_id}`} className="font-semibold text-sm hover:underline">
                        {reply.users?.username}
                      </Link>
                      {currentUser?.id === reply.user_id && (
                        <button
                          onClick={() => handleDeleteReply(reply.id)}
                          className="text-destructive hover:text-destructive/80 transition"
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>
                    <p className="text-sm text-foreground mt-1">{reply.content}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">Quote Post</h2>
              <button
                onClick={() => setShowShareModal(false)}
                className="text-muted-foreground hover:text-foreground transition"
              >
                <X size={20} />
              </button>
            </div>

            {/* Original Post Preview */}
            <div className="bg-muted rounded-lg p-3 mb-4">
              <p className="font-semibold text-sm">{post.users?.username}</p>
              <p className="text-sm text-foreground mt-1">{post.content}</p>
            </div>

            {/* Share Input */}
            <textarea
              value={shareText}
              onChange={(e) => setShareText(e.target.value)}
              placeholder="Add a comment to this post..."
              className="w-full bg-muted rounded-lg p-3 text-sm resize-none outline-none placeholder:text-muted-foreground mb-4"
              rows={3}
            />

            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowShareModal(false)}
                className="px-4 py-2 rounded-full text-sm font-semibold hover:bg-muted transition"
              >
                Cancel
              </button>
              <button
                onClick={handleShare}
                disabled={!shareText.trim()}
                className="bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition"
              >
                Quote Post
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

