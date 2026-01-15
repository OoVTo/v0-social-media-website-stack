"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { createClient } from "@/lib/supabase-client"
import { ArrowLeft, MessageSquare, UserPlus, UserCheck } from "lucide-react"
import Link from "next/link"

export default function ProfilePage() {
  const params = useParams()
  const userId = params.id as string
  const [profile, setProfile] = useState<any>(null)
  const [posts, setPosts] = useState<any[]>([])
  const [isFollowing, setIsFollowing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const supabase = createClient()

  useEffect(() => {
    const userData = sessionStorage.getItem("user")
    if (userData) setCurrentUser(JSON.parse(userData))

    fetchProfile()
    fetchUserPosts()
  }, [userId])

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase.from("users").select("*").eq("id", userId).single()
      if (error) throw error
      setProfile(data)

      // Check if current user is following
      const userData = JSON.parse(sessionStorage.getItem("user") || "{}")
      if (userData.id !== userId) {
        const { data: followData } = await supabase
          .from("follows")
          .select("id")
          .eq("follower_id", userData.id)
          .eq("following_id", userId)
          .single()
        setIsFollowing(!!followData)
      }
    } catch (error) {
      console.error("Error fetching profile:", error)
    }
  }

  const fetchUserPosts = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })

      if (error) throw error
      setPosts(data || [])
    } catch (error) {
      console.error("Error fetching posts:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleFollowToggle = async () => {
    try {
      if (isFollowing) {
        await supabase.from("follows").delete().eq("follower_id", currentUser.id).eq("following_id", userId)
        setIsFollowing(false)
      } else {
        await supabase.from("follows").insert([{ follower_id: currentUser.id, following_id: userId }])
        setIsFollowing(true)
      }
    } catch (error) {
      console.error("Error toggling follow:", error)
    }
  }

  if (!profile) return <div className="text-center py-8">Loading...</div>

  const isOwnProfile = currentUser?.id === userId

  return (
    <div>
      {/* Header */}
      <div className="sticky top-0 bg-background/80 backdrop-blur z-10 p-4 border-b border-border flex items-center gap-4">
        <Link href="/home" className="hover:bg-muted p-2 rounded-full transition">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="font-bold text-lg">{profile.username}</h1>
          <p className="text-xs text-muted-foreground">{posts.length} posts</p>
        </div>
      </div>

      {/* Profile Cover & Info */}
      <div className="border-b border-border">
        {/* Cover */}
        <div className="h-48 bg-gradient-to-r from-primary to-secondary"></div>

        {/* Profile Section */}
        <div className="px-4 pb-4">
          {/* Avatar */}
          <div className="flex justify-between items-start -mt-16 mb-4">
            <div className="w-32 h-32 rounded-full bg-primary/30 border-4 border-background flex items-center justify-center text-4xl font-bold">
              {profile.username?.[0]?.toUpperCase()}
            </div>
            <div className="flex gap-2">
              {!isOwnProfile && (
                <>
                  <button className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-full font-semibold hover:opacity-90 transition">
                    <MessageSquare size={18} />
                    Message
                  </button>
                  <button
                    onClick={handleFollowToggle}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full font-semibold transition ${
                      isFollowing
                        ? "bg-muted text-foreground hover:bg-destructive/10 hover:text-destructive"
                        : "bg-primary text-primary-foreground hover:opacity-90"
                    }`}
                  >
                    {isFollowing ? (
                      <>
                        <UserCheck size={18} />
                        Following
                      </>
                    ) : (
                      <>
                        <UserPlus size={18} />
                        Follow
                      </>
                    )}
                  </button>
                </>
              )}
              {isOwnProfile && (
                <Link
                  href="/settings"
                  className="bg-muted text-foreground px-4 py-2 rounded-full font-semibold hover:bg-muted/80 transition"
                >
                  Edit Profile
                </Link>
              )}
            </div>
          </div>

          {/* Bio */}
          <div>
            <h2 className="font-bold text-xl">{profile.username}</h2>
            <p className="text-muted-foreground">@{profile.username}</p>
            {profile.bio && <p className="mt-2">{profile.bio}</p>}
            {profile.date_of_birth && (
              <p className="text-sm text-muted-foreground mt-2">
                Born {new Date(profile.date_of_birth).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Posts */}
      <div>
        {loading ? (
          <div className="text-center py-8">Loading posts...</div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">No posts yet</div>
        ) : (
          posts.map((post) => (
            <div key={post.id} className="p-4 border-b border-border hover:bg-muted/50 transition cursor-pointer">
              <p>{post.content}</p>
              <p className="text-xs text-muted-foreground mt-2">{new Date(post.created_at).toLocaleDateString()}</p>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
