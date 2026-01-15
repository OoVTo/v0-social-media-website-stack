"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Send } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase-client"

export default function MessagesPage() {
  const [conversations, setConversations] = useState<any[]>([])
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const supabase = createClient()

  useEffect(() => {
    const userData = sessionStorage.getItem("user")
    if (userData) setCurrentUser(JSON.parse(userData))

    fetchConversations()
  }, [])

  useEffect(() => {
    if (selectedUser) {
      fetchMessages(selectedUser.id)
    }
  }, [selectedUser])

  const fetchConversations = async () => {
    try {
      setLoading(true)
      const userData = JSON.parse(sessionStorage.getItem("user") || "{}")

      // Fetch conversations where user is involved
      const { data, error } = await supabase
        .from("messages")
        .select("sender_id, receiver_id, users:sender_id(*)")
        .or(`sender_id.eq.${userData.id},receiver_id.eq.${userData.id}`)
        .order("created_at", { ascending: false })
        .limit(20)

      if (error) throw error

      // Get unique conversations
      const uniqueConversations = Array.from(
        new Map(
          (data || []).map((msg: any) => [
            msg.sender_id === userData.id ? msg.receiver_id : msg.sender_id,
            { id: msg.sender_id === userData.id ? msg.receiver_id : msg.sender_id },
          ]),
        ).values(),
      )

      setConversations(uniqueConversations)
    } catch (error) {
      console.error("Error fetching conversations:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchMessages = async (userId: string) => {
    try {
      const userData = JSON.parse(sessionStorage.getItem("user") || "{}")

      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .or(
          `and(sender_id.eq.${userData.id},receiver_id.eq.${userId}),and(sender_id.eq.${userId},receiver_id.eq.${userData.id})`,
        )
        .order("created_at", { ascending: true })

      if (error) throw error
      setMessages(data || [])
    } catch (error) {
      console.error("Error fetching messages:", error)
    }
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedUser) return

    try {
      const userData = JSON.parse(sessionStorage.getItem("user") || "{}")

      const { error } = await supabase.from("messages").insert([
        {
          sender_id: userData.id,
          receiver_id: selectedUser.id,
          content: newMessage,
        },
      ])

      if (error) throw error

      setNewMessage("")
      fetchMessages(selectedUser.id)
    } catch (error) {
      console.error("Error sending message:", error)
    }
  }

  return (
    <div className="flex h-full">
      {/* Conversations List */}
      <div className="w-64 border-r border-border flex flex-col">
        <div className="sticky top-0 bg-background/80 backdrop-blur z-10 p-4 border-b border-border flex items-center gap-4">
          <Link href="/home" className="hover:bg-muted p-2 rounded-full transition">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="font-bold text-lg">Messages</h1>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : conversations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No conversations</div>
          ) : (
            conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => setSelectedUser(conv)}
                className={`w-full p-4 border-b border-border text-left hover:bg-muted transition ${
                  selectedUser?.id === conv.id ? "bg-muted" : ""
                }`}
              >
                <p className="font-semibold truncate">{conv.username}</p>
                <p className="text-sm text-muted-foreground truncate">@{conv.username}</p>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Chat View */}
      <div className="flex-1 flex flex-col">
        {selectedUser ? (
          <>
            {/* Header */}
            <div className="sticky top-0 bg-background/80 backdrop-blur z-10 p-4 border-b border-border">
              <p className="font-semibold">{selectedUser.username}</p>
              <p className="text-sm text-muted-foreground">@{selectedUser.username}</p>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender_id === currentUser?.id ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-xs px-4 py-2 rounded-lg ${
                      msg.sender_id === currentUser?.id
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-foreground"
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
            </div>

            {/* Message Input */}
            <div className="border-t border-border p-4 flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                placeholder="Type a message..."
                className="flex-1 px-4 py-2 border border-border rounded-lg bg-input focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                onClick={handleSendMessage}
                className="bg-primary text-primary-foreground p-2 rounded-lg hover:opacity-90 transition"
              >
                <Send size={20} />
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            Select a conversation to start messaging
          </div>
        )}
      </div>
    </div>
  )
}
