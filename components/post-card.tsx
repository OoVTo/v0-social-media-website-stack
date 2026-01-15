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
  const [sharedPost, setSharedPost] = useState<any>(null)
  const [isLiking, setIsLiking] = useState(false)
  const supabase = createClient()
  const isOwnPost = post.user_id === currentUser?.id

  useEffect(() => {
    // Check if user has liked this post
    checkIfLiked()
    
    // Fetch shared post if this is a quote post
    if (post.shared_post_id) {
      fetchSharedPost()
    }
  }, [post.id, currentUser?.id, post.shared_post_id])

  const checkIfLiked = async () => {
    if (!currentUser?.id) return
    try {
      const { data, error } = await supabase
        .from("likes")
        .select("id")
        .eq("post_id", post.id)
        .eq("user_id", currentUser.id)
        .single()

      if (error) {
        console.warn("⚠️ Could not check if liked (RLS policy issue):", error.message)
        setIsLiked(false)
        return
      }
      
      setIsLiked(!!data)
    } catch (error) {
      console.warn("⚠️ Like check error:", error)
      setIsLiked(false)
    }
  }

  const fetchSharedPost = async () => {
    try {
      const { data } = await supabase
        .from("posts")
        .select(
          `
          *,
          users:user_id (id, username, profile_picture_url)
        `,
        )
        .eq("id", post.shared_post_id)
        .single()

      if (data) {
        setSharedPost(data)
      }
    } catch (error) {
      console.error("Error fetching shared post:", error)
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
    // Prevent multiple clicks while processing
    if (isLiking || !currentUser?.id) {
      console.warn("⚠️ Like already in progress or user not logged in")
      return
    }
    
    setIsLiking(true)
    
    try {
      const willLike = !isLiked
      
      if (willLike) {
        // Optimistic update
        setIsLiked(true)
        setLikeCount(likeCount + 1)
        
        // Add to database
        const { error } = await supabase.from("likes").insert({
          post_id: post.id,
          user_id: currentUser.id,
        })
        
        if (error) {
          console.error("❌ Failed to add like:", error.message)
          // Revert on error
          setIsLiked(false)
          setLikeCount(Math.max(0, likeCount - 1))
        } else {
          console.log("✅ Like added")
        }
      } else {
        // Optimistic update
        setIsLiked(false)
        setLikeCount(Math.max(0, likeCount - 1))
        
        // Remove from database
        const { error } = await supabase
          .from("likes")
          .delete()
          .eq("post_id", post.id)
          .eq("user_id", currentUser.id)
        
        if (error) {
          console.error("❌ Failed to remove like:", error.message)
          // Revert on error
          setIsLiked(true)
          setLikeCount(likeCount + 1)
        } else {
          console.log("✅ Like removed")
        }
      }
    } catch (error) {
      console.error("❌ Unexpected error in handleLike:", error)
      // Make sure we clear the loading state
    } finally {
      setIsLiking(false)
    }
  }

  const handleShare = async () => {
    if (!shareText.trim()) {
      alert("Please add a comment to your quote post")
      return
    }

    try {
      const { data, error } = await supabase.from("posts").insert([
        {
          user_id: currentUser.id,
          content: shareText,
          shared_post_id: post.id,
          media_urls: [],
        },
      ]).select()

      if (error) {
        console.error("Error sharing post:", error)
        alert(`Failed to share post: ${error.message}`)
        return
      }

      if (data && data.length > 0) {
        setShareText("")
        setShowShareModal(false)
        onPostUpdated()
        alert("Post shared successfully!")
      }
    } catch (error: any) {
      console.error("Error sharing post:", error)
      alert(`Failed to share post: ${error.message}`)
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
    if (!window.confirm("Are you sure you want to delete this post?")) {
      return
    }

    try {
      console.log("🗑️ Deleting post:", post.id)
      const { error } = await supabase.from("posts").delete().eq("id", post.id)
      
      if (error) {
        console.error("❌ Delete failed:", error.message)
        alert("Failed to delete post: " + error.message)
      } else {
        console.log("✅ Post deleted successfully")
        onPostUpdated()
      }
    } catch (error) {
      console.error("❌ Unexpected error deleting post:", error)
      alert("Failed to delete post")
    }
  }

  return (
    <div className="border-b border-border" id={`post-${post.id}`}>
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

            {/* Shared Post */}
            {sharedPost && (
              <Link href={`#post-${sharedPost.id}`}>
                <div
                  className="mt-3 p-3 border border-border rounded-lg bg-muted/30 hover:bg-muted/50 transition cursor-pointer"
                >
                  <div className="flex gap-2 items-start">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 text-xs">
                      {sharedPost.users?.username?.[0]?.toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-sm">
                          {sharedPost.users?.username}
                        </p>
                        <span className="text-muted-foreground text-xs">@{sharedPost.users?.username}</span>
                      </div>
                      <p className="text-sm text-foreground mt-1 line-clamp-3">{sharedPost.content}</p>
                      {sharedPost.media_urls && sharedPost.media_urls.length > 0 && (
                        <div className="mt-2 rounded overflow-hidden bg-muted">
                          <img
                            src={sharedPost.media_urls[0] || "/placeholder.svg"}
                            alt="Shared post media"
                            className="w-full h-20 object-cover"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
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
                disabled={isLiking}
                className={`flex items-center gap-2 transition ${
                  isLiked
                    ? "text-destructive hover:text-destructive/80"
                    : "text-muted-foreground hover:text-destructive"
                } disabled:opacity-50`}
              >
                <Heart
                  size={16}
                  fill={isLiked ? "currentColor" : "none"}
                  className={isLiked ? "animate-pulse" : ""}
                />
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

      {/* Zoom Modal - Removed */}
    </div>
  )
}

