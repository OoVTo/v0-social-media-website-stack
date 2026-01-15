"use client"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import CreatePostForm from "@/components/create-post-form"

export default function CreatePostPage() {
  const router = useRouter()

  const handlePostCreated = () => {
    router.push("/home")
  }

  return (
    <div className="max-w-2xl">
      {/* Header */}
      <div className="sticky top-0 bg-background/80 backdrop-blur z-10 p-4 border-b border-border flex items-center gap-4">
        <Link href="/home" className="hover:bg-muted p-2 rounded-full transition">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="font-bold text-lg">Create Post</h1>
      </div>

      <div className="p-4">
        <CreatePostForm onPostCreated={handlePostCreated} />
      </div>
    </div>
  )
}
